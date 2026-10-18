import { randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import type { LeadRequest } from "./lead-schema";

// Одно подключение на два режима:
// локально — файл SQLite (file:./data/leads.db), на Vercel — Turso (libsql://…).
// Имена переменных — те, что создаёт интеграция Turso в Vercel.

const DEFAULT_URL = "file:./data/leads.db";
const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");
const DEDUP_WINDOW = "-10 minutes";

let client: Client | null = null;
let ready: Promise<Client> | null = null;

function connect(): Client {
  if (process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
    // Файловая система Vercel только для чтения и не переживает деплой — файл-база там бессмысленна
    throw new Error("TURSO_DATABASE_URL не задан в переменных окружения Vercel");
  }
  const url = process.env.TURSO_DATABASE_URL || DEFAULT_URL;
  if (url.startsWith("file:")) {
    // libSQL не создаёт папку под файл базы сам
    mkdirSync(path.dirname(url.slice("file:".length)), { recursive: true });
  }
  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
}

function splitStatements(sql: string): string[] {
  return sql
    .replace(/^\s*--.*$/gm, "")
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function migrate(db: Client) {
  await db.execute(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)",
  );
  const applied = new Set(
    (await db.execute("SELECT name FROM schema_migrations")).rows.map((r) => String(r.name)),
  );
  const pending = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && !applied.has(f))
    .sort();

  for (const file of pending) {
    const statements = splitStatements(readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"));
    await db.batch(
      [
        ...statements,
        {
          sql: "INSERT OR IGNORE INTO schema_migrations (name, applied_at) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))",
          args: [file],
        },
      ],
      "write",
    );
  }
}

function getDb(): Promise<Client> {
  if (!ready) {
    client = connect();
    const db = client;
    ready = migrate(db).then(
      () => db,
      (err) => {
        // следующий запрос попробует ещё раз, а не получит закэшированную ошибку
        ready = null;
        throw err;
      },
    );
  }
  return ready;
}

type InsertResult = { created: true; id: string } | { created: false };

/**
 * Сохраняет заявку, если за последние 10 минут не было заявки с тем же телефоном.
 * Проверка и вставка — один оператор INSERT … SELECT … WHERE NOT EXISTS: в SQLite он
 * выполняется атомарно под блокировкой записи, поэтому два одновременных запроса
 * с одним номером не создадут две строки. Время берём из часов базы — одних на всех.
 */
export async function insertLeadDeduped(lead: LeadRequest): Promise<InsertResult> {
  const db = await getDb();
  const id = randomUUID();
  const result = await db.execute({
    sql: `
      INSERT INTO leads (
        id, name, phone, interest, product, comment,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        landing_page, referrer, created_at
      )
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE NOT EXISTS (
        SELECT 1 FROM leads
        WHERE phone = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?)
      )
      RETURNING id`,
    args: [
      id,
      lead.name,
      lead.phone,
      lead.interest,
      lead.product,
      lead.comment,
      lead.utm_source,
      lead.utm_medium,
      lead.utm_campaign,
      lead.utm_content,
      lead.utm_term,
      lead.landing_page,
      lead.referrer,
      lead.phone,
      DEDUP_WINDOW,
    ],
  });
  return result.rows.length > 0 ? { created: true, id } : { created: false };
}

/**
 * Считает запросы по ключу (хэш IP) в скользящем окне. Один батч — один поход в базу:
 * чистим устаревшие отметки, ставим новую, считаем свои за окно.
 */
export async function hitRateLimit(key: string, windowMs: number): Promise<number> {
  const db = await getDb();
  const now = Date.now();
  const since = now - windowMs;
  const [, , count] = await db.batch(
    [
      { sql: "DELETE FROM rate_hits WHERE at <= ?", args: [since] },
      { sql: "INSERT INTO rate_hits (key, at) VALUES (?, ?)", args: [key, now] },
      { sql: "SELECT count(*) AS n FROM rate_hits WHERE key = ? AND at > ?", args: [key, since] },
    ],
    "write",
  );
  return Number(count?.rows[0]?.n ?? 0);
}

import { createHash } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { hitRateLimit, insertLeadDeduped } from "@/lib/db";
import { fieldErrors, leadRequestSchema } from "@/lib/lead-schema";
import { notifyTelegram } from "@/lib/telegram";

// POST /api/lead — prompt.xml, раздел <api>.
// Порядок: формат запроса → защита от ботов → лимит частоты → валидация →
// атомарная вставка с проверкой дубля → уведомление после ответа.

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;
const MIN_FILL_MS = 2000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
// С запасом: мобильные операторы сажают многих абонентов на один IP
const RATE_LIMIT = 10;

const json = (status: number, body: object, headers?: HeadersInit) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

const badRequest = () => json(400, { ok: false, error: "bad_request" });

// Боту отвечаем как человеку, чтобы он не подбирал обход
const fakeAccept = () => json(201, { ok: true });

async function readBody(req: NextRequest): Promise<string | null> {
  if (!req.body) return null;
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  // Браузер всегда шлёт Origin с POST из fetch. Без него — не браузер:
  // пропускаем, такие запросы всё равно упрутся в лимит и валидацию.
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clientKey(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return createHash("sha256")
    .update(`${process.env.RATE_LIMIT_SALT ?? ""}:${ip}`)
    .digest("hex");
}

function isBot(body: Record<string, unknown>): boolean {
  const honeypot = body.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;
  const elapsed = body.elapsed_ms;
  return typeof elapsed !== "number" || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS;
}

export async function POST(req: NextRequest) {
  try {
    if (!sameOrigin(req)) return json(403, { ok: false, error: "forbidden" });

    const type = req.headers.get("content-type") ?? "";
    if (!type.toLowerCase().startsWith("application/json")) return badRequest();

    const raw = await readBody(req);
    if (raw === null) return badRequest();

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return badRequest();
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) return badRequest();

    if (isBot(body as Record<string, unknown>)) return fakeAccept();

    const hits = await hitRateLimit(clientKey(req), RATE_WINDOW_MS);
    if (hits > RATE_LIMIT) {
      return json(429, { ok: false, error: "rate_limited" }, { "Retry-After": "60" });
    }

    const parsed = leadRequestSchema.safeParse(body);
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      // Ошибка только в атрибуции (клиент обрезает её сам) — это не ошибка человека
      if (Object.keys(errors).length === 0) return badRequest();
      return json(422, { ok: false, errors });
    }

    // Сорт имеет смысл только для разового заказа
    const lead =
      parsed.data.interest === "one_time" ? parsed.data : { ...parsed.data, product: null };

    const result = await insertLeadDeduped(lead);
    if (!result.created) return json(200, { ok: true, duplicate: true });

    after(() => notifyTelegram(lead));
    return json(201, { ok: true });
  } catch (err) {
    console.error("[lead] failed:", err);
    return json(500, { ok: false, error: "server_error" });
  }
}

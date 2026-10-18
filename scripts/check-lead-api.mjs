// Проверка POST /api/lead на живом сервере: формат, валидация, дубли под гонкой, лимит.
// pnpm check:api                          — локальный dev-сервер
// pnpm check:api https://<домен>          — задеплоенный сайт
// Каждый прогон берёт случайный номер, поэтому его можно повторять.
// Если доступна та же база, что у сервера (локальный файл или TURSO_* из .env.local),
// скрипт сверяет сохранённую заявку и удаляет за собой тестовые записи.

import { existsSync } from "node:fs";
import { createClient } from "@libsql/client";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const url = `${base}/api/lead`;
const runId = Math.random().toString(36).slice(2, 8);

const randomPhone = () => `+375 29 ${String(1_000_000 + Math.floor(Math.random() * 8_999_999))}`;
// Локально X-Forwarded-For берётся из запроса, и разные сценарии не мешают друг другу
// в лимите. На Vercel заголовок перезаписывает платформа, там лимит общий на ваш IP.
const fakeIp = (n) => `10.${n}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

const lead = (overrides = {}) => ({
  name: `Проверка ${runId}`,
  phone: randomPhone(),
  interest: "one_time",
  product: "eth",
  comment: null,
  utm_source: "check",
  utm_medium: "script",
  utm_campaign: runId,
  yclid: `y-${runId}`,
  website: "",
  elapsed_ms: 5000,
  ...overrides,
});

async function post(body, { ip = fakeIp(1), type = "application/json" } = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": type, "X-Forwarded-For": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

let failed = 0;
function check(name, ok, details) {
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : `\n    ${JSON.stringify(details)}`}`);
  if (!ok) failed++;
}

{
  const r = await post("{не json", { ip: fakeIp(2) });
  check("битый JSON → 400", r.status === 400, r);
}
{
  const r = await post(JSON.stringify(lead()), { ip: fakeIp(3), type: "text/plain" });
  check("не application/json → 400", r.status === 400, r);
}
{
  const r = await post("x".repeat(9000), { ip: fakeIp(4) });
  check("тело больше 8 КБ → 400", r.status === 400, r);
}
{
  const r = await post(lead({ phone: "+375 17 123-45-67", name: "  " }), { ip: fakeIp(5) });
  check(
    "городской номер и пустое имя → 422 с ошибками у полей",
    r.status === 422 && r.data?.errors?.phone && r.data?.errors?.name,
    r,
  );
}
{
  const r = await post(lead({ product: "latte" }), { ip: fakeIp(6) });
  check("несуществующий сорт → 422", r.status === 422 && r.data?.errors?.product, r);
}
{
  const r = await post(lead({ website: "http://spam.example" }), { ip: fakeIp(7) });
  check("заполнено поле-ловушка → фиктивный 201", r.status === 201, r);
}
{
  // Пять одновременных отправок одного номера в разных записях — как двойной тап
  // и повторная отправка с другого устройства
  const phone = randomPhone();
  const results = await Promise.all(
    ["+375", "8 0", "", "+375 ", "80"].map((prefix, i) =>
      post(lead({ phone: `${prefix}${phone.replace(/^\+375\s?/, "")}`.trim() }), {
        ip: fakeIp(10 + i),
      }),
    ),
  );
  const created = results.filter((r) => r.status === 201).length;
  const dups = results.filter((r) => r.status === 200 && r.data?.duplicate).length;
  check(`5 одновременных заявок с одним номером → 1×201, 4×200 duplicate`, created === 1 && dups === 4, results);

  const again = await post(lead({ phone }), { ip: fakeIp(20) });
  check("тот же номер ещё раз → 200 duplicate", again.status === 200 && again.data?.duplicate, again);
}
{
  const ip = fakeIp(30);
  const statuses = [];
  for (let i = 0; i < 11; i++) statuses.push((await post(lead({ phone: "123" }), { ip })).status);
  check("11-й запрос с одного IP за 10 минут → 429", statuses.at(-1) === 429, statuses);
}

// Сверка с базой и уборка за собой
const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)/.test(base);
const dbUrl =
  process.env.TURSO_DATABASE_URL ||
  (isLocal && existsSync("data/leads.db") ? "file:./data/leads.db" : null);
if (dbUrl) {
  const db = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
  const name = `Проверка ${runId}`;
  const { rows } = await db.execute({ sql: "SELECT yclid FROM leads WHERE name = ?", args: [name] });
  check(
    "в базе ровно одна заявка прогона, yclid сохранён",
    rows.length === 1 && rows[0].yclid === `y-${runId}`,
    rows,
  );
  await db.execute({ sql: "DELETE FROM leads WHERE name = ?", args: [name] });
  console.log("  тестовые заявки прогона удалены из базы");
} else {
  console.log("– сверка с базой пропущена: нет TURSO_DATABASE_URL (запустите с .env.local)");
}

console.log(failed ? `\nНе прошло: ${failed}` : "\nВсё прошло");
process.exit(failed ? 1 : 0);

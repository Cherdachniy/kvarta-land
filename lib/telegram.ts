import type { LeadRequest } from "./lead-schema";
import { INTEREST_LABELS } from "./lead-schema";
import { findProduct } from "./products";

// Дубль заявки менеджеру в Telegram. Необязательная функция из брифа:
// без TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID просто ничего не делает.
// Вызывается после сохранения в базу; сбой здесь заявку не отменяет.

const TIMEOUT_MS = 5000;

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatPhone(phone: string): string {
  // +375291234567 → +375 29 123-45-67
  return phone.replace(/^\+375(\d{2})(\d{3})(\d{2})(\d{2})$/, "+375 $1 $2-$3-$4");
}

function source(lead: LeadRequest): string[] {
  const lines: string[] = [];
  const utm = [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ");
  if (utm) lines.push(`Реклама: ${esc(utm)}`);
  if (lead.utm_content) lines.push(`Объявление: ${esc(lead.utm_content)}`);
  if (lead.utm_term) lines.push(`Ключ: ${esc(lead.utm_term)}`);
  if (lead.yclid) lines.push("Клик из Яндекса (yclid)");
  if (lead.fbclid) lines.push("Клик из Instagram/Facebook (fbclid)");
  if (lead.landing_page) lines.push(`Страница: ${esc(lead.landing_page)}`);
  if (lead.referrer) lines.push(`Пришёл с: ${esc(lead.referrer)}`);
  return lines.length ? lines : ["Источник: прямой заход"];
}

function formatLeadMessage(lead: LeadRequest): string {
  const product = findProduct(lead.product);
  return [
    "<b>Новая заявка</b>",
    `${esc(lead.name)} · ${formatPhone(lead.phone)}`,
    `${INTEREST_LABELS[lead.interest]}${product ? `: ${esc(product.full)}` : ""}`,
    lead.comment ? `Комментарий: ${esc(lead.comment)}` : null,
    "",
    ...source(lead),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export async function notifyTelegram(lead: LeadRequest): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLeadMessage(lead),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error("[lead] telegram: HTTP", res.status);
  } catch (err) {
    console.error("[lead] telegram:", err instanceof Error ? err.name : "unknown error");
  }
}

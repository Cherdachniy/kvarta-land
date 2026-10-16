import { z } from "zod";
import { normalizeBelarusPhone, PHONE_ERROR } from "./phone";
import { PRODUCT_IDS } from "./products";

// Одна схема для клиента (подсказки у полей) и сервера (обязательная проверка).

export const INTERESTS = ["subscription", "one_time", "question"] as const;
export type Interest = (typeof INTERESTS)[number];

export const INTEREST_LABELS: Record<Interest, string> = {
  subscription: "Подписка",
  one_time: "Разовый заказ",
  question: "Вопрос",
};

export const LIMITS = {
  name: 120,
  comment: 1000,
  utm: 255,
  url: 2000,
} as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

export const leadFieldsSchema = z.object({
  name: z
    .string({ error: "Напишите имя, чтобы мы знали, как обращаться." })
    .trim()
    .min(1, { error: "Напишите имя, чтобы мы знали, как обращаться." })
    .max(LIMITS.name, { error: `Не длиннее ${LIMITS.name} символов` }),
  phone: z
    .string({ error: PHONE_ERROR })
    .trim()
    .min(1, { error: PHONE_ERROR })
    .transform((value, ctx) => {
      const normalized = normalizeBelarusPhone(value);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: PHONE_ERROR });
        return z.NEVER;
      }
      return normalized;
    }),
  interest: z.enum(INTERESTS, { error: "Выберите сорт, подписку или «Вопрос»." }),
  product: z
    .enum(PRODUCT_IDS, { error: "Такого кофе у нас нет" })
    .nullish()
    .transform((v) => v ?? null),
  comment: z
    .string()
    .trim()
    .max(LIMITS.comment, { error: `Комментарий не длиннее ${LIMITS.comment} символов` })
    .nullish()
    .transform((v) => (v ? v : null)),
});

export const attributionSchema = z.object({
  utm_source: optionalText(LIMITS.utm),
  utm_medium: optionalText(LIMITS.utm),
  utm_campaign: optionalText(LIMITS.utm),
  utm_content: optionalText(LIMITS.utm),
  utm_term: optionalText(LIMITS.utm),
  yclid: optionalText(LIMITS.utm),
  fbclid: optionalText(LIMITS.utm),
  landing_page: optionalText(LIMITS.url),
  referrer: optionalText(LIMITS.url),
});

export const leadRequestSchema = leadFieldsSchema.extend(attributionSchema.shape);

export type LeadFieldsInput = z.input<typeof leadFieldsSchema>;
export type LeadRequestInput = z.input<typeof leadRequestSchema>;
export type LeadRequest = z.output<typeof leadRequestSchema>;
export type LeadField = keyof LeadFieldsInput;

export function fieldErrors(error: z.ZodError): Partial<Record<LeadField, string>> {
  const out: Partial<Record<LeadField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && key in leadFieldsSchema.shape && !(key in out)) {
      out[key as LeadField] = issue.message;
    }
  }
  return out;
}

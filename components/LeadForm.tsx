"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { captureAttribution, getAttribution } from "@/lib/attribution";
import {
  fieldErrors,
  INTEREST_LABELS,
  INTERESTS,
  LIMITS,
  leadFieldsSchema,
  type Interest,
  type LeadField,
} from "@/lib/lead-schema";
import { formatBelarusPhone } from "@/lib/phone";
import { PRODUCT_IDS, PRODUCTS, productLabel, type ProductId } from "@/lib/products";
import styles from "./LeadForm.module.css";

type Values = {
  name: string;
  phone: string;
  interest: Interest;
  product: ProductId | "";
  comment: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; phone: string; duplicate: boolean }
  | { kind: "error"; message: string };

type Errors = Partial<Record<LeadField, string>>;

const REQUEST_TIMEOUT_MS = 15_000;

const GENERIC_ERROR =
  "Не получилось отправить заявку. Проверьте интернет и попробуйте ещё раз — всё, что вы ввели, сохранилось. Если не выйдет снова, загляните к нам в мастерскую на Короля, 9.";

function isInterest(v: string | undefined): v is Interest {
  return (INTERESTS as readonly string[]).includes(v ?? "");
}

function isProduct(v: string | undefined): v is ProductId {
  return (PRODUCT_IDS as readonly string[]).includes(v ?? "");
}

export function LeadForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    interest: "one_time",
    product: "",
    comment: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inFlight = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // Запоминаем UTM и страницу входа сразу при загрузке, а не в момент отправки.
  useEffect(() => {
    captureAttribution();
  }, []);

  // Кнопки «Заказать» и «Подписка» в других секциях — обычные ссылки на #order
  // с data-атрибутами. Перехватываем клик и заранее выбираем нужный вариант.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest<HTMLElement>("[data-interest]");
      if (!link) return;
      const interest = link.dataset.interest;
      if (!isInterest(interest)) return;
      const product = link.dataset.product;
      setValues((v) => ({
        ...v,
        interest,
        product: isProduct(product) ? product : interest === "one_time" ? v.product : "",
      }));
      setStatus((s) => (s.kind === "success" ? { kind: "idle" } : s));
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (status.kind === "success" || status.kind === "error") statusRef.current?.focus();
  }, [status.kind]);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateField(key: LeadField) {
    const result = leadFieldsSchema.safeParse(toPayload(values));
    const fieldError = result.success ? undefined : fieldErrors(result.error)[key];
    setErrors((e) => ({ ...e, [key]: fieldError }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;

    const parsed = leadFieldsSchema.safeParse(toPayload(values));
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      if (first) document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }

    const honeypot = new FormData(e.currentTarget).get("website");

    inFlight.current = true;
    setStatus({ kind: "submitting" });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, ...getAttribution(), website: honeypot }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; duplicate?: boolean; errors?: Errors; error?: string }
        | null;

      if (res.ok && data?.ok) {
        setStatus({ kind: "success", phone: parsed.data.phone, duplicate: Boolean(data.duplicate) });
        return;
      }
      if (res.status === 422 && data?.errors) {
        setErrors(data.errors);
        setStatus({ kind: "error", message: "Проверьте поля, отмеченные ниже." });
        return;
      }
      if (res.status === 429) {
        setStatus({
          kind: "error",
          message: "Слишком много попыток подряд. Подождите минуту и отправьте ещё раз.",
        });
        return;
      }
      setStatus({ kind: "error", message: GENERIC_ERROR });
    } catch {
      setStatus({ kind: "error", message: GENERIC_ERROR });
    } finally {
      window.clearTimeout(timer);
      inFlight.current = false;
    }
  }

  const submitting = status.kind === "submitting";

  if (status.kind === "success") {
    return (
      <div className={styles.success} ref={statusRef} tabIndex={-1} role="status">
        <p className="label">заявка у нас</p>
        <p className={styles.successTitle}>
          {status.duplicate ? "Мы уже получили вашу заявку" : "Спасибо! Заявка принята"}
        </p>
        <p>
          Менеджер перезвонит на&nbsp;
          <span className={styles.nowrap}>{formatBelarusPhone(status.phone)}</span> и&nbsp;всё
          оформит.
          {status.duplicate && " Повторно отправлять не нужно."}
        </p>
      </div>
    );
  }

  const describe = (key: LeadField, hint?: string) =>
    [errors[key] ? `${uid}-${key}-error` : null, hint].filter(Boolean).join(" ") || undefined;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={submitting}>
      <div className={styles.field}>
        <label htmlFor={`${uid}-name`}>Как к&nbsp;вам обращаться?</label>
        <input
          id={`${uid}-name`}
          name="name"
          type="text"
          autoComplete="given-name"
          maxLength={LIMITS.name}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          onBlur={() => values.name && validateField("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describe("name")}
          required
        />
        {errors.name && (
          <p id={`${uid}-name-error`} className={styles.error}>
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${uid}-phone`}>Номер телефона</label>
        <input
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+375 29 123-45-67"
          maxLength={32}
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          onBlur={() => values.phone && validateField("phone")}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describe("phone", `${uid}-phone-hint`)}
          required
        />
        {errors.phone ? (
          <p id={`${uid}-phone-error`} className={styles.error}>
            {errors.phone}
          </p>
        ) : (
          <p id={`${uid}-phone-hint`} className={styles.hint}>
            Белорусский мобильный. Перезвоним, чтобы всё уточнить.
          </p>
        )}
      </div>

      <fieldset className={styles.field}>
        <legend>Что вас интересует?</legend>
        <div className={styles.choices}>
          {INTERESTS.map((value) => (
            <label key={value} className={styles.choice}>
              <input
                type="radio"
                name="interest"
                value={value}
                checked={values.interest === value}
                onChange={() => update("interest", value)}
              />
              <span>{INTEREST_LABELS[value]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {values.interest === "one_time" && (
        <div className={styles.field}>
          <label htmlFor={`${uid}-product`}>
            Какой кофе <span className={styles.optional}>— можно выбрать позже</span>
          </label>
          <select
            id={`${uid}-product`}
            name="product"
            value={values.product}
            onChange={(e) => update("product", isProduct(e.target.value) ? e.target.value : "")}
            aria-invalid={Boolean(errors.product)}
            aria-describedby={describe("product")}
          >
            <option value="">Ещё не решил(а)</option>
            {PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {productLabel(p)} — {p.price} BYN
              </option>
            ))}
          </select>
          {errors.product && (
            <p id={`${uid}-product-error`} className={styles.error}>
              {errors.product}
            </p>
          )}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor={`${uid}-comment`}>
          Комментарий <span className={styles.optional}>— по желанию</span>
        </label>
        <textarea
          id={`${uid}-comment`}
          name="comment"
          rows={3}
          maxLength={LIMITS.comment}
          placeholder="Например: удобно звонить после 18:00"
          value={values.comment}
          onChange={(e) => update("comment", e.target.value)}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={describe("comment")}
        />
        {errors.comment && (
          <p id={`${uid}-comment-error`} className={styles.error}>
            {errors.comment}
          </p>
        )}
      </div>

      {/* Ловушка для ботов: людям поле не видно и недоступно с клавиатуры */}
      <div className={styles.trap} aria-hidden="true">
        <label>
          Сайт
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div ref={statusRef} tabIndex={-1} className={styles.statusSlot}>
        {status.kind === "error" && (
          <p className={styles.formError} role="alert">
            {status.message}
          </p>
        )}
      </div>

      <button type="submit" className={`btn ${styles.submit}`} disabled={submitting}>
        {submitting ? "Отправляем…" : "Отправить заявку"}
        {!submitting && (
          <span className="arrow" aria-hidden="true">
            →
          </span>
        )}
      </button>
      <p className={styles.fine}>
        Платить на&nbsp;сайте ничего не&nbsp;нужно: менеджер перезвонит, уточнит заказ и&nbsp;время
        доставки.
      </p>
      <p className="visually-hidden" aria-live="polite">
        {submitting ? "Отправляем заявку" : ""}
      </p>
      <noscript>
        <p className={styles.formError}>
          Для отправки формы нужен включённый JavaScript. Или заходите к&nbsp;нам на&nbsp;Короля, 9.
        </p>
      </noscript>
    </form>
  );
}

function toPayload(v: Values) {
  return {
    name: v.name,
    phone: v.phone,
    interest: v.interest,
    product: v.interest === "one_time" && v.product ? v.product : null,
    comment: v.comment || null,
  };
}

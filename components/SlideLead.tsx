"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { getAttribution } from "@/lib/attribution";
import type { Friday } from "@/lib/friday";
import { fieldErrors, LIMITS, leadFieldsSchema, type LeadField } from "@/lib/lead-schema";
import { maskBelarusPhone, PHONE_HINT, PHONE_MASK_MAX_LENGTH } from "@/lib/phone";
import { findProduct, PRODUCTS, STUDIO, SUBSCRIPTION } from "@/lib/products";
import { Arrow } from "./Arrow";
import { delay, Slide, type SlidePos } from "./Slide";
import type { Choice } from "./Stories";
import s from "./SlideLead.module.css";
import ui from "./ui.module.css";

type Status = "idle" | "invalid" | "sending" | "ok" | "error";
type Errors = Partial<Record<LeadField, string>>;

const REQUEST_TIMEOUT_MS = 15_000;
const SEND_ERROR = `Не получилось отправить. Проверьте интернет и нажмите ещё раз. Не выйдет — приходите на ${STUDIO.street}: ${STUDIO.hours}.`;
const RATE_ERROR = "Слишком много попыток подряд. Подождите минуту и нажмите ещё раз.";

const OPTIONS: { id: Exclude<Choice, null>; label: string }[] = [
  ...PRODUCTS.map((p) => ({ id: p.id, label: p.name })),
  { id: "sub", label: "Подписка" },
  { id: "question", label: "Вопрос" },
];

type Props = {
  pos: SlidePos;
  choice: Choice;
  onChoice: (c: Choice) => void;
  friday: Friday;
  onRestart: () => void;
};

function toInterest(choice: Choice) {
  if (choice === "sub") return { interest: "subscription", product: null };
  if (choice === "question") return { interest: "question", product: null };
  if (choice) return { interest: "one_time", product: choice };
  return { interest: undefined, product: null };
}

// Порядок полей на экране: сначала выбор, потом имя, телефон, комментарий.
const FOCUS_ORDER: [LeadField, string][] = [
  ["interest", "[role=group] button"],
  ["name", "#lead-name"],
  ["phone", "#lead-phone"],
  ["comment", "#lead-comment"],
];

function focusFirstInvalid(errs: Errors) {
  const target = FOCUS_ORDER.find(([key]) => errs[key]);
  if (target) document.querySelector<HTMLElement>(target[1])?.focus();
}

function summary(choice: Choice, friday: Friday) {
  const day = friday.isToday ? `сегодня, ${friday.date}` : friday.date;
  const delivery = `Бесплатно от ${STUDIO.freeDeliveryFrom} BYN. Самовывоз: ${STUDIO.street}, ${STUDIO.hoursShort}`;
  if (choice === "sub") {
    return { line: SUBSCRIPTION.line, when: `Первая доставка по Минску: пятница, ${day}`, note: null };
  }
  if (choice === "question") {
    return { line: "Вопрос · менеджер перезвонит и ответит", when: null, note: `Мастерская: ${STUDIO.street}, ${STUDIO.hoursShort}` };
  }
  const product = findProduct(choice);
  return {
    line: product ? `${product.full} · ${product.price} BYN` : "Выберите сорт или подписку",
    when: `Привезём в пятницу, ${day}`,
    note: delivery,
  };
}

export function SlideLead({ pos, choice, onChoice, friday, onRestart }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const inFlight = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  // Сервер отбрасывает заявки, отправленные быстрее, чем человек успел бы заполнить форму
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "ok" || status === "error") statusRef.current?.focus({ preventScroll: true });
  }, [status]);

  // На телефоне ряд чипов прокручивается по горизонтали: выбранный заранее вариант
  // («Подписка», «Вопрос») может оказаться за краем. Докручиваем ряд до него —
  // при смене выбора и при открытии экрана. На десктопе чипы переносятся, сдвиг нулевой.
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip || pos !== "on") return;
    const r = row.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const shift = c.left < r.left ? c.left - r.left : c.right > r.right ? c.right - r.right : 0;
    if (!shift) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({ left: shift, behavior: smooth ? "smooth" : "auto" });
  }, [choice, pos]);

  function clearError(key: LeadField) {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (status === "error") setStatus("idle");
  }

  function pick(c: Exclude<Choice, null>) {
    onChoice(c);
    clearError("interest");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;

    const parsed = leadFieldsSchema.safeParse({
      name,
      phone,
      comment: comment || null,
      ...toInterest(choice),
    });
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setStatus("invalid");
      focusFirstInvalid(errs);
      return;
    }

    const honeypot = new FormData(e.currentTarget).get("website");

    inFlight.current = true;
    setStatus("sending");
    setErrors({});
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          ...getAttribution(),
          website: honeypot,
          elapsed_ms: Date.now() - mountedAt.current,
        }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; duplicate?: boolean; errors?: Errors }
        | null;

      if (res.ok && data?.ok) {
        setDuplicate(Boolean(data.duplicate));
        setStatus("ok");
      } else if (res.status === 422 && data?.errors) {
        setErrors(data.errors);
        setStatus("invalid");
        focusFirstInvalid(data.errors);
      } else {
        setMessage(res.status === 429 ? RATE_ERROR : SEND_ERROR);
        setStatus("error");
      }
    } catch {
      setMessage(SEND_ERROR);
      setStatus("error");
    } finally {
      window.clearTimeout(timer);
      inFlight.current = false;
    }
  }

  function restart() {
    setName("");
    setPhone("");
    setComment("");
    setShowComment(false);
    setErrors({});
    setDuplicate(false);
    setStatus("idle");
    onRestart();
  }

  const sending = status === "sending";
  const done = status === "ok";
  const sum = summary(choice, friday);

  const summaryBox = (
    <div className={s.summary}>
      <span className={s.summaryLine}>{sum.line}</span>
      {sum.when && <span className={ui.gold}>{sum.when}</span>}
      {sum.note && <span className={s.summaryNote}>{sum.note}</span>}
    </div>
  );

  return (
    <Slide pos={pos} label="Заявка">
      <form className={s.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
        <div className={s.intro}>
          <p className={`${ui.caption} ${ui.rv}`} style={delay(0)}>
            Сцена 04 · Заявка
          </p>
          <h2 className={`${ui.display} ${ui.rv} ${s.title}`} style={delay(120)}>
            Забронировать батч
          </h2>
        </div>

        <div className={`${s.body} ${ui.scroll}`} data-noswipe>
          <div className={`${s.choice} ${done ? s.choiceDone : ""} ${ui.rv}`} style={delay(260)}>
            <p id="lead-choice-label" className={ui.fieldLabel}>
              Ваш выбор
            </p>
            <div
              ref={chipsRef}
              className={`${s.chips} ${ui.scroll}`}
              role="group"
              aria-labelledby="lead-choice-label"
              aria-describedby={errors.interest ? "lead-choice-error" : undefined}
              data-noswipe
            >
              {OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={s.chip}
                  aria-pressed={choice === o.id}
                  onClick={() => pick(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {errors.interest && (
              <p id="lead-choice-error" className={s.error} role="alert">
                {errors.interest}
              </p>
            )}
            <div aria-live="polite">{summaryBox}</div>
          </div>

          {done ? (
            <div className={s.success} role="status" ref={statusRef} tabIndex={-1}>
              <div className={s.successTop}>
                <p className={`${ui.display} ${s.ready}`}>Готово.</p>
                <p className={s.successText}>
                  {duplicate
                    ? "Эта заявка уже у нас — второй раз отправлять не нужно. "
                    : "Бронь принята. "}
                  Менеджер перезвонит, чтобы подтвердить заказ: {STUDIO.hours}.
                </p>
                <div className={s.successSummary}>{summaryBox}</div>
              </div>
              <button type="button" className={`${ui.ghost} ${s.restart}`} onClick={restart}>
                В начало
              </button>
            </div>
          ) : (
            <div className={`${s.fields} ${ui.rv}`} style={delay(400)}>
              <div className={s.field}>
                <label htmlFor="lead-name" className={ui.fieldLabel}>
                  Имя
                </label>
                <input
                  id="lead-name"
                  className={s.input}
                  type="text"
                  name="name"
                  autoComplete="given-name"
                  placeholder="Как к вам обращаться"
                  maxLength={LIMITS.name}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "lead-name-error" : undefined}
                />
                {errors.name && (
                  <p id="lead-name-error" className={s.error} role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={s.field}>
                <label htmlFor="lead-phone" className={ui.fieldLabel}>
                  Телефон
                </label>
                <input
                  id="lead-phone"
                  className={s.input}
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="+375 29 123-45-67"
                  maxLength={PHONE_MASK_MAX_LENGTH}
                  value={phone}
                  onFocus={() => {
                    if (!phone) setPhone("+375 ");
                  }}
                  onBlur={() => setPhone((v) => maskBelarusPhone(v))}
                  onChange={(e) => {
                    setPhone(maskBelarusPhone(e.target.value));
                    clearError("phone");
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby="lead-phone-hint"
                />
                <p
                  id="lead-phone-hint"
                  className={errors.phone ? s.error : s.hint}
                  role={errors.phone ? "alert" : undefined}
                >
                  {errors.phone ?? PHONE_HINT}
                </p>
              </div>

              {!showComment ? (
                <button type="button" className={s.addComment} onClick={() => setShowComment(true)}>
                  + Добавить комментарий
                </button>
              ) : (
                <div className={s.field}>
                  <label htmlFor="lead-comment" className={ui.fieldLabel}>
                    Комментарий <span className={s.optional}>· необязательно</span>
                  </label>
                  <textarea
                    id="lead-comment"
                    className={`${s.input} ${s.textarea}`}
                    name="comment"
                    rows={2}
                    autoFocus
                    maxLength={LIMITS.comment}
                    placeholder="Например: удобно звонить после 18:00"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      clearError("comment");
                    }}
                    aria-invalid={Boolean(errors.comment)}
                    aria-describedby={errors.comment ? "lead-comment-error" : undefined}
                  />
                  {errors.comment && (
                    <p id="lead-comment-error" className={s.error} role="alert">
                      {errors.comment}
                    </p>
                  )}
                </div>
              )}

              {/* Ловушка для ботов: людям не видна и недоступна с клавиатуры */}
              <div className={s.trap} aria-hidden="true">
                <label>
                  Сайт
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              <div className={s.submitRow}>
                <button type="submit" className={ui.cta} disabled={sending}>
                  <span>{sending ? "Бронируем…" : "Забронировать батч"}</span>
                  <Arrow />
                </button>
                <div ref={statusRef} tabIndex={-1} className={s.statusSlot}>
                  {status === "error" && (
                    <p className={s.sendError} role="alert">
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </Slide>
  );
}

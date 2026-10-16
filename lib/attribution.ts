// Откуда пришёл человек: UTM, страница входа и referrer.
// Запоминаем при первом заходе и обновляем, если пришёл по новой рекламной ссылке.
// Храним 30 дней в localStorage — переживает перезагрузку и переходы по якорям.

const STORAGE_KEY = "kvarta:attribution";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_LEN = 255;
const MAX_URL_LEN = 2000;

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type UtmKey = (typeof UTM_KEYS)[number];

export type Attribution = Record<UtmKey, string | null> & {
  landing_page: string | null;
  referrer: string | null;
};

type Stored = Attribution & { saved_at: number };

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  landing_page: null,
  referrer: null,
};

function clip(value: string | null, max: number): string | null {
  const v = value?.trim();
  return v ? v.slice(0, max) : null;
}

function read(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (typeof parsed.saved_at !== "number" || Date.now() - parsed.saved_at > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(value: Attribution) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...value, saved_at: Date.now() }));
  } catch {
    // приватный режим или запрет хранилища — атрибуция останется в памяти страницы
  }
}

function externalReferrer(): string | null {
  const ref = document.referrer;
  if (!ref) return null;
  try {
    return new URL(ref).origin === window.location.origin ? null : ref;
  } catch {
    return null;
  }
}

let current: Attribution | null = null;

export function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = Object.fromEntries(
    UTM_KEYS.map((k) => [k, clip(params.get(k), MAX_LEN)]),
  ) as Record<UtmKey, string | null>;
  const hasUtm = UTM_KEYS.some((k) => fromUrl[k]);
  const stored = read();

  if (hasUtm || !stored) {
    current = {
      ...fromUrl,
      landing_page: clip(window.location.pathname + window.location.search, MAX_URL_LEN),
      referrer: clip(externalReferrer(), MAX_URL_LEN),
    };
    write(current);
  } else {
    current = { ...EMPTY };
    for (const key of Object.keys(EMPTY) as (keyof Attribution)[]) {
      current[key] = typeof stored[key] === "string" ? stored[key] : null;
    }
  }
  return current;
}

export function getAttribution(): Attribution {
  return current ?? captureAttribution();
}

// Белорусские мобильные номера: +375 (25|29|33|44) XXX-XX-XX.
// normalizeBelarusPhone — строгая проверка (клиент и сервер), принимает привычные
// варианты записи: +375 29 123-45-67, 8 (029) 123 45 67, 80291234567, 291234567.
// maskBelarusPhone — маска поля ввода по docs/design/DESIGN.md, раздел 7.

const MOBILE_CODES = ["25", "29", "33", "44"] as const;
const ALLOWED_CHARS = /^[\d\s()+\-.]+$/;

export const PHONE_HINT = "Формат: +375 XX XXX-XX-XX. Коды 25, 29, 33, 44.";
export const PHONE_ERROR = "Нужны 9 цифр после +375. Коды: 25, 29, 33, 44.";

export function normalizeBelarusPhone(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 32 || !ALLOWED_CHARS.test(raw)) return null;
  // «+» допустим только в начале
  if (raw.indexOf("+") > 0 || raw.split("+").length > 2) return null;

  const digits = raw.replace(/\D/g, "");
  let national: string;

  if (digits.length === 12 && digits.startsWith("375")) {
    national = digits.slice(3);
  } else if (digits.length === 11 && digits.startsWith("80")) {
    national = digits.slice(2);
  } else if (digits.length === 9 && !raw.startsWith("+")) {
    national = digits;
  } else {
    return null;
  }

  const code = national.slice(0, 2);
  const subscriber = national.slice(2);
  if (!(MOBILE_CODES as readonly string[]).includes(code)) return null;
  if (!/^[1-9]\d{6}$/.test(subscriber)) return null;

  return `+375${national}`;
}

/** Промежуточные значения: «+375 2», «+375 29 123», «+375 29 123-45-67». */
export function maskBelarusPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("375")) d = d.slice(3);
  else if (d.length > 9 && d.startsWith("80")) d = d.slice(2);
  d = d.slice(0, 9);
  if (!d) return "";
  let out = `+375 ${d.slice(0, 2)}`;
  if (d.length > 2) out += ` ${d.slice(2, 5)}`;
  if (d.length > 5) out += `-${d.slice(5, 7)}`;
  if (d.length > 7) out += `-${d.slice(7, 9)}`;
  return out;
}

export const PHONE_MASK_MAX_LENGTH = 17;

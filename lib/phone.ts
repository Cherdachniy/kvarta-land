// Белорусские мобильные номера: +375 (25|29|33|44) XXX-XX-XX.
// Принимаем привычные варианты записи: +375 29 123-45-67, 8 (029) 123 45 67,
// 80291234567, 291234567. Всё приводим к +375XXXXXXXXX.

const MOBILE_CODES = ["25", "29", "33", "44"] as const;
const ALLOWED_CHARS = /^[\d\s()+\-.]+$/;

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

export function formatBelarusPhone(normalized: string): string {
  const m = /^\+375(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(normalized);
  return m ? `+375 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : normalized;
}

export const PHONE_HINT =
  "Нужен белорусский мобильный: код 25, 29, 33 или 44 и 7 цифр. Например, +375 29 123-45-67";

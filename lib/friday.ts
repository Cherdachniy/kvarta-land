// Ближайшая пятница (день доставки) по Europe/Minsk.
// В Беларуси нет перехода на летнее время — достаточно сдвига UTC+3.

const MINSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const FRIDAY = 5;

export type Friday = { date: string; isToday: boolean };

export function nearestFriday(now: Date = new Date()): Friday {
  const minsk = new Date(now.getTime() + MINSK_OFFSET_MS);
  const add = (FRIDAY - minsk.getUTCDay() + 7) % 7;
  const f = new Date(minsk.getTime() + add * DAY_MS);
  const dd = String(f.getUTCDate()).padStart(2, "0");
  const mm = String(f.getUTCMonth() + 1).padStart(2, "0");
  return { date: `${dd}.${mm}`, isToday: add === 0 };
}

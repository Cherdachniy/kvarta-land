// Ближайшая обжарка (четверг) и развоз (пятница) по минскому времени.
// В Беларуси нет перехода на летнее время, поэтому достаточно сдвига UTC+3.

const MINSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const THURSDAY = 4;

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export type RoastDay = { day: number; month: string; isToday: boolean };

function toDay(d: Date, isToday: boolean): RoastDay {
  return { day: d.getUTCDate(), month: MONTHS[d.getUTCMonth()] ?? "", isToday };
}

export function nextRoast(now: Date = new Date()) {
  const minsk = new Date(now.getTime() + MINSK_OFFSET_MS);
  const shift = (THURSDAY - minsk.getUTCDay() + 7) % 7;
  const roast = new Date(minsk.getTime() + shift * DAY_MS);
  const delivery = new Date(roast.getTime() + DAY_MS);
  return {
    roast: toDay(roast, shift === 0),
    delivery: toDay(delivery, false),
  };
}

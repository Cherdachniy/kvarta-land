// Ассортимент и цены — строго из брифа (kvarta-brief.pdf, стр. 2),
// идентификаторы и подписи — из docs/design/tokens.json.

export type ProductId = "eth" | "col" | "bra" | "drip";

export type Product = {
  id: ProductId;
  n: string;
  name: string;
  sub: string;
  pack: string;
  notes: readonly string[];
  price: number;
  full: string;
};

export const PRODUCTS: readonly Product[] = [
  {
    id: "eth",
    n: "01",
    name: "Эфиопия",
    sub: "Иргачеффе",
    pack: "250 г",
    notes: ["цветочный", "бергамот", "светлая обжарка"],
    price: 32,
    full: "Эфиопия Иргачеффе · 250 г",
  },
  {
    id: "col",
    n: "02",
    name: "Колумбия",
    sub: "Уила",
    pack: "250 г",
    notes: ["карамель", "красное яблоко"],
    price: 29,
    full: "Колумбия Уила · 250 г",
  },
  {
    id: "bra",
    n: "03",
    name: "Бразилия",
    sub: "Серрадо",
    pack: "250 г",
    notes: ["орех", "шоколад", "под эспрессо"],
    price: 26,
    full: "Бразилия Серрадо · 250 г",
  },
  {
    id: "drip",
    n: "04",
    name: "Дрип",
    sub: "Пакеты, ассорти",
    pack: "10 штук",
    notes: ["10 штук", "ассорти"],
    price: 18,
    full: "Дрип-пакеты, ассорти · 10 штук",
  },
];

export const PRODUCT_IDS = PRODUCTS.map((p) => p.id) as [ProductId, ...ProductId[]];

export function findProduct(id: string | null | undefined): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const SUBSCRIPTION = {
  price: 54,
  terms: ["2 пачки по 250 г", "Раз в месяц", "Доставка по Минску бесплатно"],
  line: "Подписка · 2 × 250 г в месяц · 54 BYN / мес",
} as const;

export const STUDIO = {
  street: "Короля, 9",
  address: "Минск, ул. Короля, 9",
  hours: "пн–пт 8:00–20:00, сб–вс 10:00–18:00",
  hoursShort: "пн–пт 8–20, сб–вс 10–18",
  freeDeliveryFrom: 50,
} as const;

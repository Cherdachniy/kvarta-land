// Ассортимент и цены — строго из брифа (kvarta-brief.pdf, стр. 2).

export type ProductId = "ethiopia" | "colombia" | "brazil" | "drip";

export type Product = {
  id: ProductId;
  name: string;
  origin: string;
  notes: string;
  detail: string;
  size: string;
  price: number;
};

export const PRODUCTS: readonly Product[] = [
  {
    id: "ethiopia",
    name: "Иргачеффе",
    origin: "Эфиопия",
    notes: "цветочный, бергамот",
    detail: "светлая обжарка",
    size: "250 г",
    price: 32,
  },
  {
    id: "colombia",
    name: "Уила",
    origin: "Колумбия",
    notes: "карамель, красное яблоко",
    detail: "",
    size: "250 г",
    price: 29,
  },
  {
    id: "brazil",
    name: "Серрадо",
    origin: "Бразилия",
    notes: "орех, шоколад",
    detail: "под эспрессо",
    size: "250 г",
    price: 26,
  },
  {
    id: "drip",
    name: "Дрип-пакеты",
    origin: "Ассорти",
    notes: "заварить в чашке, без кофемолки",
    detail: "",
    size: "10 штук",
    price: 18,
  },
];

export const PRODUCT_IDS = PRODUCTS.map((p) => p.id) as [ProductId, ...ProductId[]];

export const SUBSCRIPTION = {
  price: 54,
  description: "2 пачки по 250 г раз в месяц",
} as const;

export const STUDIO = {
  address: "Минск, ул. Короля, 9",
  hours: [
    { days: "пн–пт", time: "8:00–20:00" },
    { days: "сб–вс", time: "10:00–18:00" },
  ],
  freeDeliveryFrom: 50,
  since: 2019,
  batchKg: 5,
} as const;

export function productLabel(p: Product): string {
  return p.id === "drip" ? `${p.name}, ${p.origin.toLowerCase()}` : `${p.origin} ${p.name}`;
}

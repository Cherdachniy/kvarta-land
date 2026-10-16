import type { Product } from "@/lib/products";
import { Arrow } from "./Arrow";
import s from "./SlideBeans.module.css";
import ui from "./ui.module.css";

type Props = { bean: Product; selected: boolean; onPick: () => void };

// Одна структура у всех карточек: № и фасовка → название → подзаголовок →
// ноты (место под 3 строки) → цена → кнопка, прижатая к низу.
export function BeanCard({ bean, selected, onPick }: Props) {
  return (
    <article className={`${s.card} ${selected ? s.selected : ""}`}>
      <div className={`${ui.bgnum} ${s.cardNum}`} aria-hidden="true">
        {bean.n}
      </div>
      <div className={s.meta}>
        <span>№ {bean.n}</span>
        <span>{bean.pack}</span>
      </div>
      <div className={s.naming}>
        <h3 className={`${ui.display} ${s.name}`}>{bean.name}</h3>
        <p className={s.sub}>{bean.sub}</p>
      </div>
      <ul className={s.notes}>
        {bean.notes.map((note) => (
          <li key={note}>
            <span className={ui.gold}>+</span>&nbsp;{note}
          </li>
        ))}
      </ul>
      <div className={s.buy}>
        <p className={s.price}>
          <span className={s.amount}>{bean.price}</span>
          <span className={s.currency}>BYN</span>
        </p>
        <button
          type="button"
          className={`${ui.cta} ${ui.ctaSmall}`}
          onClick={onPick}
          aria-pressed={selected}
          aria-label={`${selected ? "Выбрано" : "Выбрать"}: ${bean.full}, ${bean.price} BYN`}
        >
          <span>{selected ? "Выбрано" : "Выбрать этот сорт"}</span>
          <Arrow size={22} />
        </button>
      </div>
    </article>
  );
}

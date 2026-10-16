"use client";

import { useState, type UIEvent } from "react";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { Arrow } from "./Arrow";
import { BeanCard } from "./BeanCard";
import { delay, Slide, type SlidePos } from "./Slide";
import s from "./SlideBeans.module.css";
import ui from "./ui.module.css";

type Props = {
  pos: SlidePos;
  choice: string | null;
  onPick: (id: ProductId) => void;
  onSubscription: () => void;
};

export function SlideBeans({ pos, choice, onPick, onSubscription }: Props) {
  const [dot, setDot] = useState(0);

  function onScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    const i = Math.round((el.scrollLeft / max) * (PRODUCTS.length - 1));
    if (i !== dot) setDot(i);
  }

  return (
    <Slide pos={pos} label="Зерно недели">
      <div className={s.head}>
        <div className={s.headText}>
          <p className={`${ui.caption} ${ui.rv}`} style={delay(0)}>
            Сцена 02 · Партия недели
          </p>
          <h2 className={`${ui.display} ${ui.rv} ${s.title}`} style={delay(120)}>
            Зерно <br className={s.br} />
            недели
          </h2>
        </div>
        <p className={`${s.hint} ${ui.rv}`} style={delay(240)}>
          Выберите сорт — перейдём к заявке
        </p>
      </div>

      <div className={s.carousel} data-noswipe onScroll={onScroll} style={delay(260)}>
        {PRODUCTS.map((bean, i) => (
          <div key={bean.id} className={s.cardWrap} style={delay(260 + i * 110)}>
            <BeanCard bean={bean} selected={choice === bean.id} onPick={() => onPick(bean.id)} />
          </div>
        ))}
      </div>

      <div className={`${s.foot} ${ui.rv}`} style={delay(400)}>
        <div className={s.dots} aria-hidden="true">
          {PRODUCTS.map((bean, i) => (
            <span key={bean.id} className={i === dot ? s.dotOn : s.dot} />
          ))}
        </div>
        <button type="button" className={ui.ghost} onClick={onSubscription}>
          <span>Подписка</span>
          <Arrow size={18} weight={2} />
        </button>
      </div>
    </Slide>
  );
}

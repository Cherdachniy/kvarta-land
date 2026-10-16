import { SUBSCRIPTION } from "@/lib/products";
import { Arrow } from "./Arrow";
import { delay, Slide, type SlidePos } from "./Slide";
import s from "./SlideSubscription.module.css";
import ui from "./ui.module.css";

type Props = { pos: SlidePos; onPick: () => void };

export function SlideSubscription({ pos, onPick }: Props) {
  return (
    <Slide pos={pos} label="Регулярная подписка">
      <div className={`${ui.bgnum} ${s.bgnum}`} aria-hidden="true">
        02
      </div>
      <p className={`${ui.caption} ${ui.rv} ${s.captionMobile}`} style={delay(0)}>
        Сцена 03 · Регулярная подписка
      </p>
      <div className={s.grid}>
        <div className={s.lead}>
          <p className={`${ui.caption} ${ui.rv} ${s.captionDesktop}`} style={delay(0)}>
            Сцена 03 · Регулярная подписка
          </p>
          <h2 className={`${ui.display} ${ui.rv} ${s.title}`} style={delay(150)}>
            Забыть о&nbsp;поиске кофе.
          </h2>
        </div>
        <div className={s.side}>
          <p className={`${s.price} ${ui.rv}`} style={delay(320)}>
            <span className={s.amount}>{SUBSCRIPTION.price}</span>
            <span className={s.per}>BYN / мес</span>
          </p>
          <ol className={`${s.terms} ${ui.rv}`} style={delay(480)}>
            {SUBSCRIPTION.terms.map((t, i) => (
              <li key={t}>
                <span className={ui.gold}>{String(i + 1).padStart(2, "0")}</span>&nbsp;&nbsp;{t}
              </li>
            ))}
          </ol>
          <div className={`${ui.rv} ${s.ctaDesktop}`} style={delay(640)}>
            <button type="button" className={ui.cta} onClick={onPick}>
              <span>Выбрать подписку</span>
              <Arrow />
            </button>
          </div>
        </div>
      </div>
      <div className={`${ui.rv} ${s.ctaMobile}`} style={delay(640)}>
        <button type="button" className={ui.cta} onClick={onPick}>
          <span>Выбрать подписку</span>
          <Arrow />
        </button>
      </div>
    </Slide>
  );
}

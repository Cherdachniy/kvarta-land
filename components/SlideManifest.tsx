import { Arrow } from "./Arrow";
import { delay, Slide, type SlidePos } from "./Slide";
import s from "./SlideManifest.module.css";
import ui from "./ui.module.css";

const TIMELINE = [
  { key: "ЧТ", text: "Обжарка", extra: "Короля 9" },
  { key: "ПТ", text: "Доставка", extra: "Минск" },
  { key: "1–3", text: "Дня свежести", extra: "" },
];

type Props = { pos: SlidePos; onNext: () => void };

export function SlideManifest({ pos, onNext }: Props) {
  return (
    <Slide pos={pos} label="Манифест">
      <div className={`${ui.bgnum} ${s.bgnum}`} aria-hidden="true">
        01
      </div>
      <div className={s.grid}>
        <div className={s.lead}>
          <p className={`${ui.caption} ${ui.rv}`} style={delay(0)}>
            Сцена 01 · Манифест
          </p>
          <div className={`${s.titleWrap} ${ui.scroll}`}>
            <h1 className={`${ui.display} ${s.title}`}>
              <span className={ui.rv} style={delay(150)}>
                Аня и Дима.
              </span>
              <span className={ui.rv} style={delay(300)}>
                Жарят в <span className={ui.gold}>четверг</span> на Короля&nbsp;9.
              </span>
              <span className={ui.rv} style={delay(450)}>
                Привозят в Минск в <span className={ui.gold}>пятницу</span>.
              </span>
              <span className={`${ui.rv} ${ui.smoke}`} style={delay(600)}>
                Свежесть <span className={`${ui.milk} ${s.nowrap}`}>1–3&nbsp;дня</span>
              </span>
            </h1>
          </div>
        </div>

        <div className={s.side}>
          <ul className={`${s.timeline} ${ui.rv}`} style={delay(750)}>
            {TIMELINE.map((t) => (
              <li key={t.key}>
                <span className={ui.gold}>{t.key}</span>
                <span className={ui.smoke}>
                  {t.text}
                  {t.extra && <span className={s.extra}> · {t.extra}</span>}
                </span>
              </li>
            ))}
          </ul>
          <div className={ui.rv} style={delay(900)}>
            <button type="button" className={ui.cta} onClick={onNext}>
              <span>Узнать зерно недели</span>
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </Slide>
  );
}

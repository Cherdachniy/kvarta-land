import Image from "next/image";
import { nextRoast, type RoastDay } from "@/lib/roast-dates";
import heroImage from "@/public/images/roast-tray.jpg";
import styles from "./Hero.module.css";

function dayText(d: RoastDay, weekday: string) {
  return d.isToday ? `сегодня, ${d.day} ${d.month}` : `${weekday}, ${d.day} ${d.month}`;
}

export function Hero() {
  const { roast, delivery } = nextRoast();

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          <p className="label">обжарка кофе · минск · с 2019</p>
          <h1 id="hero-title" className={styles.title}>
            Кофе, который обжарили <em>в&nbsp;этот четверг</em>
          </h1>
          <p className={styles.lead}>
            Жарим зерно небольшими партиями по&nbsp;5&nbsp;кг, в&nbsp;пятницу развозим по&nbsp;Минску.
            Пачка приезжает к&nbsp;вам на&nbsp;1–3 день после обжарки&nbsp;— пока аромат ещё на&nbsp;месте.
          </p>
          <div className={styles.actions}>
            <a href="#order" className="btn">
              Оставить заявку <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a href="#coffee" className="btn btn--ghost">
              Посмотреть кофе
            </a>
          </div>

          <dl className={styles.schedule} aria-label="Ближайшая обжарка и доставка">
            <div>
              <dt className="label">ближайшая обжарка</dt>
              <dd>{dayText(roast, "чт")}</dd>
            </div>
            <div>
              <dt className="label">развоз по Минску</dt>
              <dd>{dayText(delivery, "пт")}</dd>
            </div>
            <div>
              <dt className="label">у вас дома</dt>
              <dd>1–3 день после обжарки</dd>
            </div>
          </dl>
        </div>

        <div className={styles.photo}>
          <Image
            src={heroImage}
            alt="Рука над лотком со свежеобжаренным зерном"
            placeholder="blur"
            preload
            sizes="(min-width: 960px) 40vw, 100vw"
            className={styles.img}
          />
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import handsImage from "@/public/images/hands-beans.jpg";
import styles from "./Freshness.module.css";

const WEEK = [
  {
    day: "четверг",
    title: "Обжариваем",
    text: "Партия — 5 кг. Это немного, и зерно не успевает залежаться.",
  },
  {
    day: "пятница",
    title: "Развозим по Минску",
    text: "Привозим домой или в офис. Или забирайте сами на Короля, 9.",
  },
  {
    day: "1–3 день",
    title: "Кофе у вас",
    text: "Зерно отдыхает пару дней после обжарки, и как раз дальше начинается самое вкусное.",
  },
];

export function Freshness() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className="label">кто мы</p>
          <h2 id="about-title" className={styles.title}>
            Обжаривают те, кто раньше варил кофе за&nbsp;стойкой
          </h2>
        </div>

        <div className={styles.story}>
          <p className={styles.big}>
            Мы&nbsp;— Аня и Дмитрий, бывшие бариста. С&nbsp;2019 года обжариваем кофе сами, в&nbsp;маленькой
            мастерской на&nbsp;улице Короля.
          </p>
          <p>
            Свежесть&nbsp;— главное, за&nbsp;что мы отвечаем. Обжаренное зерно живёт недолго: первые дни
            оно раскрывается, а&nbsp;через несколько недель аромат заметно тускнеет, и&nbsp;в&nbsp;чашке
            остаётся просто «кофе». Поэтому у&nbsp;нас короткий путь от&nbsp;ростера до&nbsp;вашей
            кофемолки: обжарка в&nbsp;четверг, доставка в&nbsp;пятницу.
          </p>
        </div>

        <figure className={styles.photo}>
          <Image
            src={handsImage}
            alt="Горсть обжаренного зерна в ладонях"
            placeholder="blur"
            sizes="(min-width: 960px) 38vw, 100vw"
            className={styles.img}
          />
        </figure>

        <ol className={styles.week} aria-label="Как устроена наша неделя">
          {WEEK.map((step, i) => (
            <li key={step.day} className={styles.step}>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="label">{step.day}</p>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

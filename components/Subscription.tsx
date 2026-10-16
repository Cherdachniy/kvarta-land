import Image from "next/image";
import { SUBSCRIPTION } from "@/lib/products";
import chemexImage from "@/public/images/chemex.jpg";
import styles from "./Subscription.module.css";

export function Subscription() {
  return (
    <section id="subscription" className={styles.section} aria-labelledby="subscription-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.photo}>
          <Image
            src={chemexImage}
            alt="Кофе заваривается в кемексе"
            placeholder="blur"
            sizes="(min-width: 960px) 34vw, 100vw"
            className={styles.img}
          />
        </div>

        <div className={styles.body}>
          <p className={`label ${styles.label}`}>подписка</p>
          <h2 id="subscription-title" className={styles.title}>
            Свежий кофе раз в&nbsp;месяц, и&nbsp;не&nbsp;нужно помнить о&nbsp;заказе
          </h2>

          <p className={styles.price}>
            <span className={styles.amount}>{SUBSCRIPTION.price}</span>
            <span className={styles.unit}>BYN в&nbsp;месяц</span>
          </p>

          <ul className={styles.terms}>
            <li>
              <span className={styles.key}>что внутри</span>
              <span>2&nbsp;пачки по&nbsp;250&nbsp;г</span>
            </li>
            <li>
              <span className={styles.key}>доставка</span>
              <span>бесплатно, в&nbsp;пятницу после обжарки</span>
            </li>
            <li>
              <span className={styles.key}>какой кофе</span>
              <span>подберём вместе, когда перезвоним</span>
            </li>
          </ul>

          <a href="#order" className="btn btn--light" data-interest="subscription">
            Оставить заявку на&nbsp;подписку <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

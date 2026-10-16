import { LeadForm } from "./LeadForm";
import styles from "./OrderSection.module.css";

export function OrderSection() {
  return (
    <section id="order" className={styles.section} aria-labelledby="order-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className="label">заявка</p>
          <h2 id="order-title" className={styles.title}>
            Оставьте номер&nbsp;— перезвоним и&nbsp;всё оформим
          </h2>
          <p className={styles.text}>
            Корзины и&nbsp;оплаты на&nbsp;сайте нет. Менеджер позвонит, уточнит, какой кофе
            и&nbsp;как удобно получить: доставкой в&nbsp;пятницу или самовывозом.
          </p>
        </div>
        <div className={styles.formWrap}>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

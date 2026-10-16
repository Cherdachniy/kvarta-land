import { STUDIO } from "@/lib/products";
import styles from "./DeliveryInfo.module.css";

const MAP_URL = `https://yandex.by/maps/?text=${encodeURIComponent(STUDIO.address)}`;

export function DeliveryInfo() {
  return (
    <section id="delivery" className={styles.section} aria-labelledby="delivery-title">
      <div className="container">
        <p className="label">как получить кофе</p>
        <h2 id="delivery-title" className={styles.title}>
          Привезём в&nbsp;пятницу или заберите сами
        </h2>

        <div className={styles.cols}>
          <article className={styles.col}>
            <h3 className={styles.colTitle}>Доставка</h3>
            <dl className={styles.facts}>
              <div>
                <dt className="label">когда</dt>
                <dd>по&nbsp;пятницам, на&nbsp;следующий день после обжарки</dd>
              </div>
              <div>
                <dt className="label">куда</dt>
                <dd>по&nbsp;Минску</dd>
              </div>
              <div>
                <dt className="label">стоимость</dt>
                <dd>
                  бесплатно от&nbsp;{STUDIO.freeDeliveryFrom}&nbsp;BYN и&nbsp;по&nbsp;подписке.
                  Для заказа поменьше менеджер назовёт цену, когда перезвонит
                </dd>
              </div>
            </dl>
          </article>

          <article className={styles.col}>
            <h3 className={styles.colTitle}>Самовывоз</h3>
            <dl className={styles.facts}>
              <div>
                <dt className="label">адрес</dt>
                <dd>
                  {STUDIO.address}, мастерская
                  <br />
                  <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={styles.map}>
                    открыть на&nbsp;карте<span className="visually-hidden"> (в новой вкладке)</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label">часы</dt>
                <dd>
                  {STUDIO.hours.map((h) => (
                    <span key={h.days} className={styles.hours}>
                      <span>{h.days}</span>
                      <span>{h.time}</span>
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}

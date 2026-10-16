import Image from "next/image";
import { PRODUCTS, STUDIO } from "@/lib/products";
import beansImage from "@/public/images/beans-closeup.jpg";
import { ProductCard } from "./ProductCard";
import styles from "./ProductCatalog.module.css";

export function ProductCatalog() {
  return (
    <section id="coffee" className={styles.section} aria-labelledby="coffee-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.aside}>
          <p className="label">ассортимент</p>
          <h2 id="coffee-title" className={styles.title}>
            Три зерна и&nbsp;дрип-пакеты
          </h2>
          <p className={styles.intro}>
            Эфиопия&nbsp;— светлая и&nbsp;цветочная, Колумбия&nbsp;— сладкая, с&nbsp;карамелью, Бразилия&nbsp;—
            под эспрессо. Дрип-пакеты&nbsp;— если дома нет кофемолки или вы на&nbsp;работе.
          </p>
          <div className={styles.photo}>
            <Image
              src={beansImage}
              alt=""
              placeholder="blur"
              sizes="(min-width: 960px) 30vw, 0px"
              className={styles.img}
            />
          </div>
        </div>

        <div className={styles.listWrap}>
          <ul className={styles.list}>
            {PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </ul>
          <p className={styles.note}>
            Заказ от&nbsp;{STUDIO.freeDeliveryFrom}&nbsp;BYN привезём бесплатно. Например, две пачки
            Колумбии&nbsp;— 58&nbsp;BYN.
          </p>
        </div>
      </div>
    </section>
  );
}

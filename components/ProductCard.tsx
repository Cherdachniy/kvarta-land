import { productLabel, type Product } from "@/lib/products";
import styles from "./ProductCatalog.module.css";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <li className={styles.item}>
      <span className={styles.index} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className={styles.head}>
        <p className="label">{product.origin}</p>
        <h3 className={styles.name}>{product.name}</h3>
      </div>
      <p className={styles.notes}>
        {product.notes}
        {product.detail && <span className={styles.detail}> · {product.detail}</span>}
      </p>
      <p className={styles.size}>{product.size}</p>
      <p className={styles.price}>
        {product.price}&nbsp;<span>BYN</span>
      </p>
      <a
        href="#order"
        className={styles.order}
        data-interest="one_time"
        data-product={product.id}
        aria-label={`Заказать: ${productLabel(product)}, ${product.price} BYN`}
      >
        Заказать <span className="arrow" aria-hidden="true">→</span>
      </a>
    </li>
  );
}

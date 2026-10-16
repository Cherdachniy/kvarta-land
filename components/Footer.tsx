import { STUDIO } from "@/lib/products";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

const PHOTOS = [
  { author: "Syauqy Ayyash", href: "https://unsplash.com/photos/R3TrW4teHOc" },
  { author: "Nathan Dumlao", href: "https://unsplash.com/photos/UoehHcoiMB0" },
  { author: "Indra Projects", href: "https://unsplash.com/photos/H80RH1Hhvu8" },
  { author: "Peter Oslanec", href: "https://unsplash.com/photos/E6f3_ipCdfc" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo tone="light" />
          <p className={styles.tagline}>
            Обжарка кофе в&nbsp;Минске. Жарим по&nbsp;четвергам, развозим по&nbsp;пятницам.
          </p>
          <a href="#order" className="btn btn--light">
            Оставить заявку
          </a>
        </div>

        <address className={styles.contacts}>
          <p className={styles.head}>Мастерская</p>
          <p>{STUDIO.address}</p>
          <p className={styles.muted}>самовывоз</p>
        </address>

        <div className={styles.contacts}>
          <p className={styles.head}>Часы</p>
          {STUDIO.hours.map((h) => (
            <p key={h.days} className={styles.hours}>
              <span>{h.days}</span> <span>{h.time}</span>
            </p>
          ))}
        </div>

        <div className={styles.contacts}>
          <p className={styles.head}>Доставка</p>
          <p>по&nbsp;Минску в&nbsp;пятницу</p>
          <p className={styles.muted}>бесплатно от&nbsp;{STUDIO.freeDeliveryFrom}&nbsp;BYN</p>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {STUDIO.since}–{new Date().getFullYear()} кварта</p>
        <p>
          Фото: Unsplash —{" "}
          {PHOTOS.map((p, i) => (
            <span key={p.href}>
              <a href={p.href} target="_blank" rel="noopener noreferrer">
                {p.author}
              </a>
              {i < PHOTOS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}

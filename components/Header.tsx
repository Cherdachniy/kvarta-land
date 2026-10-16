import { Logo } from "./Logo";
import styles from "./Header.module.css";

const NAV = [
  { href: "#about", label: "О нас" },
  { href: "#coffee", label: "Кофе" },
  { href: "#subscription", label: "Подписка" },
  { href: "#delivery", label: "Доставка" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.home} aria-label="кварта — в начало страницы">
          <Logo />
        </a>
        <nav aria-label="Разделы" className={styles.nav}>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#coffee" className={`btn ${styles.cta}`}>
          Выбрать кофе
        </a>
      </div>
    </header>
  );
}

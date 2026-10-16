import styles from "./Logo.module.css";

// «Кварта» — четверть. Знак: круг, у которого закрашена одна четверть.
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className={`${styles.logo} ${tone === "light" ? styles.light : ""}`}>
      <svg className={styles.mark} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 12V1.75A10.25 10.25 0 0 1 22.25 12Z" className={styles.quarter} />
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      </svg>
      <span className={styles.word}>кварта</span>
    </span>
  );
}

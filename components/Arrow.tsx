import ui from "./ui.module.css";

export function Arrow({ size = 24, back = false, weight = 2.5 }: { size?: number; back?: boolean; weight?: number }) {
  return (
    <svg
      className={ui.icon}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      aria-hidden="true"
      focusable="false"
    >
      <path d={back ? "M20 12H4M10 5l-7 7 7 7" : "M4 12h16M13 5l7 7-7 7"} />
    </svg>
  );
}

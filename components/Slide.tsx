import ui from "./ui.module.css";

export type SlidePos = "on" | "before" | "after";

type Props = {
  pos: SlidePos;
  label: string;
  className?: string;
  children: React.ReactNode;
};

// Неактивный слайд скрыт через visibility и inert: фокус и скринридер в него не попадают.
export function Slide({ pos, label, className, children }: Props) {
  return (
    <section
      className={`${ui.slide} ${ui[pos]} ${className ?? ""}`}
      aria-label={label}
      tabIndex={-1}
      inert={pos !== "on"}
      data-active={pos === "on"}
    >
      {children}
    </section>
  );
}

export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

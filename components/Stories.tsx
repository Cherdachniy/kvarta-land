"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { captureAttribution } from "@/lib/attribution";
import type { Friday } from "@/lib/friday";
import type { ProductId } from "@/lib/products";
import { Arrow } from "./Arrow";
import type { SlidePos } from "./Slide";
import { SlideBeans } from "./SlideBeans";
import { SlideLead } from "./SlideLead";
import { SlideManifest } from "./SlideManifest";
import { SlideSubscription } from "./SlideSubscription";
import s from "./Stories.module.css";
import ui from "./ui.module.css";

export type Choice = ProductId | "sub" | "question" | null;

const SCENES = ["Манифест", "Зерно", "Подписка", "Заявка"];
const LAST = SCENES.length - 1;
const SWIPE_PX = 56;
const SWIPE_RATIO = 1.5;

const pad = (n: number) => String(n).padStart(2, "0");

export function Stories({ friday }: { friday: Friday }) {
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<Choice>(null);
  const stage = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const firstRender = useRef(true);

  const go = useCallback((i: number) => {
    window.clearTimeout(timer.current);
    setIdx(Math.max(0, Math.min(LAST, i)));
  }, []);

  const goLater = (i: number, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIdx(i), ms);
  };

  useEffect(() => {
    captureAttribution();
    return () => window.clearTimeout(timer.current);
  }, []);

  // Если фокус остался в ушедшем слайде (он стал inert), переносим его в новый.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const slides = Array.from(stage.current?.children ?? []) as HTMLElement[];
    const active = document.activeElement;
    const lost = !active || active === document.body || slides.some((el, i) => i !== idx && el.contains(active));
    if (lost) slides[idx]?.focus({ preventScroll: true });
  }, [idx]);

  const pos = (i: number): SlidePos => (i === idx ? "on" : i < idx ? "before" : "after");

  function onPointerDown(e: PointerEvent) {
    const target = e.target as Element;
    if (e.pointerType === "mouse" || target.closest("[data-noswipe]")) {
      touch.current = null;
      return;
    }
    touch.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) go(idx + (dx < 0 ? 1 : -1));
  }

  return (
    <div className={s.root}>
      <div className={s.shell}>
        <header className={s.top}>
          <div className={s.brand}>
            <span className={s.mark} aria-hidden="true" />
            <span className={s.word}>Кварта</span>
          </div>

          <nav aria-label="Сцены" className={s.bars}>
            {SCENES.map((name, i) => (
              <button
                key={name}
                type="button"
                className={s.tab}
                aria-current={i === idx ? "step" : undefined}
                aria-label={`Экран ${i + 1} из ${SCENES.length}: ${name}`}
                onClick={() => go(i)}
              >
                <span className={s.track}>
                  <span className={s.fill} style={{ width: i <= idx ? "100%" : "0%" }} />
                </span>
                <span className={s.tabName} aria-hidden="true">
                  {pad(i + 1)} {name}
                </span>
              </button>
            ))}
          </nav>

          <div className={s.right}>
            <span className={s.counter} aria-live="polite">
              {pad(idx + 1)} / {pad(SCENES.length)}
            </span>
            <button
              type="button"
              className={s.back}
              aria-label="Назад"
              onClick={() => go(idx - 1)}
              style={{ visibility: idx > 0 ? "visible" : "hidden" }}
            >
              <Arrow size={20} back weight={2} />
            </button>
          </div>
        </header>

        <main ref={stage} className={s.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <SlideManifest pos={pos(0)} onNext={() => go(1)} />
          <SlideBeans
            pos={pos(1)}
            choice={choice}
            onPick={(id) => {
              setChoice(id);
              goLater(3, 300);
            }}
            onSubscription={() => go(2)}
          />
          <SlideSubscription
            pos={pos(2)}
            onPick={() => {
              setChoice("sub");
              goLater(3, 150);
            }}
          />
          <SlideLead
            pos={pos(3)}
            choice={choice}
            onChoice={setChoice}
            friday={friday}
            onRestart={() => {
              setChoice(null);
              go(0);
            }}
          />
        </main>

        <footer className={s.bottom}>
          <button
            type="button"
            className={ui.ghost}
            onClick={() => go(idx - 1)}
            style={{ visibility: idx > 0 ? "visible" : "hidden" }}
          >
            <Arrow size={18} back weight={2} />
            <span>Назад</span>
          </button>
          <p className={s.info}>Короля 9 · Минск · Обжарка чт · Доставка пт</p>
          <button
            type="button"
            className={ui.ghost}
            onClick={() => go(idx + 1)}
            style={{ visibility: idx < LAST ? "visible" : "hidden" }}
          >
            <span>Далее</span>
            <Arrow size={18} weight={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}

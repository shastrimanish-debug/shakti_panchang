import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageFlipBookProps {
  pages: React.ReactNode[];
  index: number;
  onIndexChange: (next: number) => void;
  onTurn?: (dir: "forward" | "backward") => void;
}

type FlipState = {
  dir: "next" | "prev";
  angle: number;
  animating: boolean;
};

export function PageFlipBook({ pages, index, onIndexChange, onTurn }: PageFlipBookProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; dir: "next" | "prev" | null } | null>(null);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;

  const canPrev = index > 0;
  const canNext = index < pages.length - 1;

  const finish = useCallback(
    (dir: "next" | "prev") => {
      const i = indexRef.current;
      const nextIndex = dir === "next" ? i + 1 : i - 1;
      onIndexChange(nextIndex);
      onTurn?.(dir === "next" ? "forward" : "backward");
      setFlip(null);
    },
    [onIndexChange, onTurn],
  );

  const animateTo = useCallback(
    (dir: "next" | "prev", fromAngle: number, toAngle: number, complete: boolean) => {
      const start = performance.now();
      const duration = 520;
      const run = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const angle = fromAngle + (toAngle - fromAngle) * eased;
        setFlip({ dir, angle, animating: true });
        if (t < 1) {
          requestAnimationFrame(run);
        } else if (complete) {
          finish(dir);
        } else {
          setFlip(null);
        }
      };
      requestAnimationFrame(run);
    },
    [finish],
  );

  const goNext = useCallback(() => {
    if (!canNext || flip?.animating) return;
    setFlip({ dir: "next", angle: 0, animating: true });
    animateTo("next", 0, 180, true);
  }, [canNext, flip?.animating, animateTo]);

  const goPrev = useCallback(() => {
    if (!canPrev || flip?.animating) return;
    setFlip({ dir: "prev", angle: 180, animating: true });
    animateTo("prev", 180, 0, true);
  }, [canPrev, flip?.animating, animateTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.key === "ArrowRight") goNext();
        else goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const ignoreTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return Boolean(
      el.closest("button, a, input, textarea, select, [data-no-flip]"),
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (flip?.animating) return;
    if (ignoreTarget(e.target)) return;
    dragRef.current = { x: e.clientX, dir: null };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || flip?.animating) return;
    const w = stageRef.current?.clientWidth || 1;
    const dx = e.clientX - drag.x;
    if (drag.dir === null) {
      if (Math.abs(dx) < 12) return;
      drag.dir = dx < 0 ? "next" : "prev";
      if (drag.dir === "next" && !canNext) {
        dragRef.current = null;
        return;
      }
      if (drag.dir === "prev" && !canPrev) {
        dragRef.current = null;
        return;
      }
    }
    if (drag.dir === "next") {
      const angle = Math.min(180, Math.max(0, (-dx / (w * 0.55)) * 180));
      setFlip({ dir: "next", angle, animating: false });
    } else {
      const angle = Math.min(180, Math.max(0, 180 - (dx / (w * 0.55)) * 180));
      setFlip({ dir: "prev", angle, animating: false });
    }
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!flip || flip.animating) return;
    if (flip.dir === "next") {
      if (flip.angle > 42) animateTo("next", flip.angle, 180, true);
      else animateTo("next", flip.angle, 0, false);
    } else {
      if (flip.angle < 138) animateTo("prev", flip.angle, 0, true);
      else animateTo("prev", flip.angle, 180, false);
    }
  };

  const underIndex =
    flip?.dir === "next" ? Math.min(pages.length - 1, index + 1) : index;
  const sheetIndex = flip?.dir === "prev" ? index - 1 : index;
  const angle = flip?.angle ?? 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        ref={stageRef}
        className="relative flex-1 min-h-0 mx-2 sm:mx-4 mt-2 mb-1"
        style={{ perspective: "1800px", touchAction: "none", userSelect: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="absolute inset-0 rounded-lg bg-[#E8D5B5] shadow-[6px_8px_0_#d4b584,12px_14px_0_#c9a56e,0_18px_28px_rgba(44,24,12,0.28)]" />

        <div className="absolute inset-0 rounded-lg overflow-hidden bg-[#FFF9EE] border border-[#5C3A21]/35">
          {pages[underIndex]}
        </div>

        {flip ? (
        <div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            transform: `rotateY(${-angle}deg)`,
            zIndex: 3,
            boxShadow: `${8 + angle / 8}px 0 ${18 + angle / 6}px rgba(44,24,12,${0.12 + angle / 600})`,
            pointerEvents: "none",
          }}
        >
          <div
            className="absolute inset-0 bg-[#FFF9EE] border border-[#5C3A21]/35"
            style={{ backfaceVisibility: "hidden" }}
          >
            {pages[sheetIndex]}
          </div>
          <div
            className="absolute inset-0"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(90deg, #e8d5b5 0%, #f4e8d1 18%, #fff9ee 100%)",
              border: "1px solid rgba(92,58,33,0.25)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to left, rgba(44,24,12,${0.28 * (angle / 180)}) 0%, transparent 42%)`,
              backfaceVisibility: "hidden",
            }}
          />
        </div>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-5 py-2 px-3 shrink-0">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          className="min-h-11 min-w-11 rounded-full bg-[#FAF2E4] border border-[#8C6239]/40 text-[#5C3A21] disabled:opacity-30 flex items-center justify-center"
          aria-label="पिछला पन्ना"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="font-black text-[#5C3A21] text-sm">
          पन्ना {index + 1} / {pages.length}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className="min-h-11 min-w-11 rounded-full bg-[#5C3A21] text-[#FAF2E4] disabled:opacity-30 flex items-center justify-center"
          aria-label="अगला पन्ना"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

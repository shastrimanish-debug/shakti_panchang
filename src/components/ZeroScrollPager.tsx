import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Locks a region to the viewport and flips content page-by-page.
 * Blocks are measured and packed so a card is never sliced in half.
 * Text taller than one screen is split on word boundaries onto the next page.
 * No overflow-y scrolling — only explicit next / previous.
 */

type NodePage = { type: "nodes"; ids: string[] };
type TextPage = { type: "text"; text: string };
type Page = NodePage | TextPage;

function elementChildren(el: HTMLElement): HTMLElement[] {
  return Array.from(el.children).filter((n): n is HTMLElement => n instanceof HTMLElement);
}

function isSkipped(el: HTMLElement): boolean {
  if (el.dataset.zspChrome === "1") return true;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (style.position === "fixed" || style.position === "sticky") return true;
  return false;
}

function isAtomic(el: HTMLElement): boolean {
  const tag = el.tagName;
  return ["BUTTON", "INPUT", "TEXTAREA", "SELECT", "IMG", "SVG", "CANVAS", "VIDEO", "AUDIO", "TABLE", "FORM"].includes(tag);
}

function relaxTall(el: HTMLElement, pageH: number) {
  if (isSkipped(el)) return;
  const overflows = el.scrollHeight > pageH + 1 || el.scrollHeight > el.clientHeight + 4;
  if (overflows) {
    el.style.setProperty("height", "auto", "important");
    el.style.setProperty("max-height", "none", "important");
    el.style.setProperty("min-height", "0", "important");
    el.style.setProperty("overflow", "visible", "important");
    el.style.setProperty("flex", "0 0 auto", "important");
  }
  elementChildren(el).forEach((child) => relaxTall(child, pageH));
}

function collectAtoms(root: HTMLElement, pageH: number): HTMLElement[] {
  const atoms: HTMLElement[] = [];

  const visit = (el: HTMLElement) => {
    if (isSkipped(el)) return;
    const kids = elementChildren(el).filter((kid) => !isSkipped(kid));
    const h = el.offsetHeight;
    if (h <= 1) return;
    if (h <= pageH - 4 || kids.length === 0 || isAtomic(el)) {
      atoms.push(el);
      return;
    }
    kids.forEach(visit);
  };

  elementChildren(root).forEach(visit);
  if (atoms.length === 0 && root.childNodes.length > 0) atoms.push(root);
  return atoms;
}

function chunkText(source: HTMLElement, pageH: number): string[] {
  const flat = (source.innerText || "").replace(/[ \t]+\n/g, "\n").trim();
  if (!flat) return [];
  const tokens = flat.split(/\s+/);
  const cs = getComputedStyle(source);
  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.left = "-9999px";
  probe.style.top = "0";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.boxSizing = "border-box";
  probe.style.width = `${Math.max(source.clientWidth, 120)}px`;
  probe.style.font = cs.font;
  probe.style.lineHeight = cs.lineHeight;
  probe.style.letterSpacing = cs.letterSpacing;
  probe.style.whiteSpace = "pre-wrap";
  probe.style.padding = "2px 0";
  document.body.appendChild(probe);

  const chunks: string[] = [];
  let start = 0;
  const limit = Math.max(pageH - 16, 48);
  while (start < tokens.length) {
    let lo = 1;
    let hi = tokens.length - start;
    let best = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      probe.textContent = tokens.slice(start, start + mid).join(" ");
      if (probe.offsetHeight <= limit) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    chunks.push(tokens.slice(start, start + best).join(" "));
    start += best;
  }
  probe.remove();
  return chunks;
}

function showOnly(atoms: HTMLElement[], ids: Set<string> | null) {
  atoms.forEach((el) => {
    const synthetic = el.dataset.zspSynthetic === "1";
    const show = !!ids && ids.has(el.dataset.zspId || "") && !synthetic;
    el.classList.toggle("zsp-off", !show);
    if (!show) {
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.marginBottom = "";
    }
  });
}

function overflows(root: HTMLElement, pageH: number) {
  return root.scrollHeight > pageH + 2;
}

function fitAtom(el: HTMLElement, atoms: HTMLElement[], root: HTMLElement, pageH: number) {
  const interactive = el.querySelector("button, input, textarea, select, a");
  const textLen = (el.innerText || "").trim().length;
  showOnly(atoms, new Set([el.dataset.zspId || ""]));
  if (!overflows(root, pageH)) return;
  if (textLen > 70 && !interactive) {
    el.dataset.zspSynthetic = "1";
    el.classList.add("zsp-off");
    return;
  }
  const natural = el.offsetHeight || root.scrollHeight;
  const scale = Math.max(0.42, Math.min(0.98, (pageH - 6) / Math.max(root.scrollHeight, natural, 1)));
  el.dataset.zspScale = String(scale);
  el.style.transformOrigin = "top center";
  el.style.transform = `scale(${scale})`;
  el.style.marginBottom = `${-(natural - natural * scale)}px`;
}

function packMeasured(root: HTMLElement, atoms: HTMLElement[], pageH: number): Page[] {
  const pages: Page[] = [];
  let cur: HTMLElement[] = [];
  const naturalHeight = new Map<HTMLElement, number>();
  atoms.forEach((el) => naturalHeight.set(el, el.offsetHeight));

  const commit = () => {
    if (!cur.length) return;
    pages.push({ type: "nodes", ids: cur.map((el) => el.dataset.zspId!).filter(Boolean) });
    cur = [];
  };

  for (const el of atoms) {
    const id = el.dataset.zspId;
    if (!id) continue;
    const natural = naturalHeight.get(el) || 0;
    if (natural <= 1) continue;

    if (natural > pageH - 4) {
      commit();
      const interactive = el.querySelector("button, input, textarea, select, a");
      const textLen = (el.innerText || "").trim().length;
      if (textLen > 70 && !interactive) {
        el.dataset.zspSynthetic = "1";
        chunkText(el, pageH).forEach((text) => pages.push({ type: "text", text }));
      } else {
        fitAtom(el, atoms, root, pageH);
        if (el.dataset.zspSynthetic === "1") {
          chunkText(el, pageH).forEach((text) => pages.push({ type: "text", text }));
        } else {
          pages.push({ type: "nodes", ids: [id] });
        }
      }
      showOnly(atoms, null);
      continue;
    }

    const trial = [...cur, el];
    showOnly(atoms, new Set(trial.map((node) => node.dataset.zspId!)));
    if (cur.length && overflows(root, pageH)) {
      commit();
      cur = [el];
      showOnly(atoms, new Set([id]));
      if (overflows(root, pageH)) fitAtom(el, atoms, root, pageH);
    } else {
      cur = trial;
    }
  }
  commit();
  showOnly(atoms, null);

  if (!pages.length) {
    return [{ type: "nodes", ids: atoms.map((atom) => atom.dataset.zspId!).filter(Boolean) }];
  }
  return pages;
}

export interface ZeroScrollPagerProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  resetKey?: string | number;
  label?: string;
}

export function ZeroScrollPager({ children, className = "", contentClassName = "", resetKey, label }: ZeroScrollPagerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<Page[]>([{ type: "nodes", ids: [] }]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [textOverlay, setTextOverlay] = useState<string | null>(null);
  const [measureTick, setMeasureTick] = useState(0);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setMeasureTick((n) => n + 1));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = contentRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const pageH = stage.clientHeight;
    if (pageH < 32) return;

    root.querySelectorAll<HTMLElement>("[data-zsp-id], [data-zsp-synthetic]").forEach((el) => {
      el.classList.remove("zsp-off");
      delete el.dataset.zspId;
      delete el.dataset.zspSynthetic;
      delete el.dataset.zspScale;
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.marginBottom = "";
    });

    relaxTall(root, pageH);
    const atoms = collectAtoms(root, pageH);
    atoms.forEach((el, index) => {
      el.dataset.zspId = String(index);
    });

    const built = packMeasured(root, atoms, pageH);
    pagesRef.current = built;
    const count = Math.max(built.length, 1);
    const safe = Math.min(page, count - 1);
    if (safe !== page) {
      setPage(safe);
      return;
    }

    const current = built[safe];
    const visible = new Set(current?.type === "nodes" ? current.ids : []);

    atoms.forEach((el) => {
      const id = el.dataset.zspId || "";
      const show = current?.type === "nodes" && visible.has(id);
      const synthetic = el.dataset.zspSynthetic === "1";
      if (show && !synthetic) {
        el.classList.remove("zsp-off");
        const scale = Number(el.dataset.zspScale || "1");
        if (scale > 0 && scale < 0.995) {
          const h = el.offsetHeight;
          el.style.transformOrigin = "top center";
          el.style.transform = `scale(${scale})`;
          el.style.marginBottom = `${-(h - h * scale)}px`;
        }
      } else {
        el.classList.add("zsp-off");
      }
    });

    const overlay = current?.type === "text" ? current.text : null;
    setTextOverlay((prev) => (prev === overlay ? prev : overlay));
    setPageCount((prev) => (prev === count ? prev : count));
  }, [page, resetKey, children, measureTick]);

  const go = useCallback((dir: -1 | 1) => {
    setPage((current) => {
      const count = pagesRef.current.length || 1;
      return Math.min(count - 1, Math.max(0, current + dir));
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (pagesRef.current.length <= 1) return;
      const stage = stageRef.current;
      if (!stage || stage.getClientRects().length === 0) return;
      const top = document.elementFromPoint(window.innerWidth / 2, Math.min(window.innerHeight / 2, window.innerHeight - 80));
      if (top && !stage.contains(top)) return;
      if (event.key === "ArrowRight" && page < pagesRef.current.length - 1) {
        event.preventDefault();
        event.stopPropagation();
        go(1);
      } else if (event.key === "ArrowLeft" && page > 0) {
        event.preventDefault();
        event.stopPropagation();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, page]);

  const onPointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select, label")) return;
    touchRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select, label")) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
    event.stopPropagation();
    go(dx < 0 ? 1 : -1);
  };

  const onStageClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select, label")) return;
    if (pageCount <= 1) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    if (x < rect.width * 0.18) go(-1);
    else if (x > rect.width * 0.82) go(1);
  };

  const atStart = page <= 0;
  const atEnd = page >= pageCount - 1;

  return (
    <div className={`zsp-frame flex flex-col min-h-0 min-w-0 overflow-hidden ${className}`} data-zsp-chrome="1">
      <div
        ref={stageRef}
        className="relative flex-1 min-h-0 w-full overflow-hidden"
        style={{ touchAction: "pan-x" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={onStageClick}
      >
        <div ref={contentRef} className={`zsp-flow w-full ${contentClassName}`}>
          {children}
        </div>
        {textOverlay && (
          <div className="absolute inset-0 overflow-hidden p-3 sm:p-4" data-zsp-chrome="1">
            <p className="font-serif text-[15px] sm:text-base leading-relaxed text-[#3E2714] whitespace-pre-wrap">
              {textOverlay}
            </p>
          </div>
        )}
        {pageCount > 1 && (
          <>
            <button
              type="button"
              aria-label="पिछला पृष्ठ"
              onClick={(event) => {
                event.stopPropagation();
                go(-1);
              }}
              disabled={atStart}
              className="absolute left-0 top-0 bottom-0 w-[14%] z-20 bg-transparent disabled:opacity-0"
            />
            <button
              type="button"
              aria-label="अगला पृष्ठ"
              onClick={(event) => {
                event.stopPropagation();
                go(1);
              }}
              disabled={atEnd}
              className="absolute right-0 top-0 bottom-0 w-[14%] z-20 bg-transparent disabled:opacity-0"
            />
          </>
        )}
      </div>

      {pageCount > 1 && (
        <div
          className="shrink-0 z-[45] flex items-center justify-between gap-2 px-2 py-1 border-t border-[#E8DCCB] bg-[#FFFDF9]/95"
          data-zsp-chrome="1"
        >
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={atStart}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF0DD] text-[#5C3A21] border border-[#DFCBB5] text-xs font-bold disabled:opacity-35"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#B56A00]" />
            <span>पिछला</span>
          </button>
          <div className="text-[10px] sm:text-xs font-bold text-[#6E472A] tracking-wide truncate">
            {label ? `${label} · ` : ""}पृष्ठ {page + 1} / {pageCount}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#5C3A21] text-[#FAF2E4] border border-[#B56A00] text-xs font-bold disabled:opacity-35"
          >
            <span>अगला</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FFD88A]" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ZeroScrollPager;

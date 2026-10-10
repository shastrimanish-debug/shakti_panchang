import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../i18n";

/**
 * Locks a region to the viewport and flips content page-by-page.
 * Blocks are measured and packed so a card is never sliced in half.
 * Text taller than one screen is split on word boundaries onto the next page.
 * No overflow-y scrolling — only explicit next / previous.
 */

type NodeSlice = { id: string; top: number; height: number; clip: boolean; scale?: number };
type NodePage = { type: "nodes"; slices: NodeSlice[] };
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

function canSlice(el: HTMLElement) {
  if (["BUTTON", "INPUT", "TEXTAREA", "SELECT", "IMG"].includes(el.tagName)) return false;
  if (el.querySelector("canvas, video")) return false;
  const svg = el.querySelector("svg");
  const textLen = (el.innerText || "").trim().length;
  if (svg && svg.getBoundingClientRect().height > 90 && textLen < 80) return false;
  return textLen > 24 || el.scrollHeight > 180;
}

function paint(atoms: HTMLElement[], slices: NodeSlice[] | null) {
  const map = new Map((slices || []).map((slice) => [slice.id, slice]));
  atoms.forEach((el) => {
    const slice = map.get(el.dataset.zspId || "");
    el.style.transform = "";
    el.style.transformOrigin = "";
    el.style.height = "";
    el.style.overflow = "";
    el.style.marginBottom = "";
    if (!slice) {
      el.classList.add("zsp-off");
      el.scrollTop = 0;
      return;
    }
    el.classList.remove("zsp-off");
    if (slice.scale && slice.scale < 0.995) {
      const h = el.offsetHeight || slice.height;
      el.style.transformOrigin = "top center";
      el.style.transform = `scale(${slice.scale})`;
      el.style.marginBottom = `${-(h - h * slice.scale)}px`;
      return;
    }
    if (slice.clip) {
      el.style.overflow = "hidden";
      el.style.height = `${Math.max(36, slice.height)}px`;
      el.scrollTop = slice.top;
    } else {
      el.scrollTop = 0;
    }
  });
}

function fitAtom(el: HTMLElement, atoms: HTMLElement[], root: HTMLElement, pageH: number) {
  showOnly(atoms, new Set([el.dataset.zspId || ""]));
  if (root.scrollHeight <= pageH + 2) return;
  const natural = el.offsetHeight || root.scrollHeight;
  const scale = Math.max(0.42, Math.min(0.98, (pageH - 6) / Math.max(root.scrollHeight, natural, 1)));
  el.dataset.zspScale = String(scale);
  el.style.transformOrigin = "top center";
  el.style.transform = `scale(${scale})`;
  el.style.marginBottom = `${-(natural - natural * scale)}px`;
}

function packMeasured(root: HTMLElement, atoms: HTMLElement[], pageH: number): Page[] {
  const pages: NodePage[] = [];
  let cur: NodeSlice[] = [];
  const fullHeight = new Map<HTMLElement, number>();
  atoms.forEach((el) => fullHeight.set(el, Math.max(el.scrollHeight, el.offsetHeight)));

  const commit = () => {
    if (!cur.length) return;
    pages.push({ type: "nodes", slices: cur });
    cur = [];
  };

  const tooTall = () => root.scrollHeight > pageH + 2;

  for (const el of atoms) {
    const id = el.dataset.zspId;
    if (!id) continue;
    const full = fullHeight.get(el) || 0;
    if (full <= 1) continue;

    paint(atoms, [...cur, { id, top: 0, height: full, clip: false }]);
    const fitsWhole = !tooTall() && full <= pageH - 4;
    if (fitsWhole) {
      cur.push({ id, top: 0, height: full, clip: false });
      continue;
    }

    if (!canSlice(el)) {
      if (cur.length) commit();
      fitAtom(el, atoms, root, pageH);
      const scale = Number(el.dataset.zspScale || "1");
      cur = [{ id, top: 0, height: full, clip: false, scale: scale < 0.995 ? scale : undefined }];
      commit();
      continue;
    }

    let top = 0;
    let guard = 0;
    while (top < full - 2 && guard++ < 60) {
      paint(atoms, cur);
      let room = (cur.length ? pageH - root.scrollHeight : pageH) - 2;
      if (room < 48) {
        commit();
        room = pageH - 2;
      }
      let height = Math.min(Math.max(room, 48), full - top);
      const slice: NodeSlice = { id, top, height, clip: true };
      paint(atoms, [...cur, slice]);
      if (tooTall()) {
        height = Math.max(48, height - (root.scrollHeight - pageH) - 4);
        slice.height = height;
        paint(atoms, [...cur, slice]);
      }
      if (height < 36) height = Math.min(pageH - 4, full - top);
      slice.height = height;
      slice.clip = top > 0 || height < full - 4;
      cur.push(slice);
      top += height;
      if (top < full - 2) commit();
    }
  }
  commit();
  paint(atoms, null);

  if (!pages.length) {
    return [{ type: "nodes", slices: atoms.map((atom) => ({ id: atom.dataset.zspId || "", top: 0, height: fullHeight.get(atom) || 0, clip: false })).filter((slice) => slice.id) }];
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
  const { t } = useLanguage();
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<Page[]>([{ type: "nodes", slices: [] }]);
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
      el.style.height = "";
      el.style.overflow = "";
      el.scrollTop = 0;
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
    if (current?.type === "nodes") paint(atoms, current.slices);
    else paint(atoms, null);

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
            <p className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--bx-ink, #1c1916)" }}>
              {textOverlay}
            </p>
          </div>
        )}
        {pageCount > 1 && (
          <>
            <button
              type="button"
              aria-label={t("common.prev", "पिछला पृष्ठ")}
              onClick={(event) => {
                event.stopPropagation();
                go(-1);
              }}
              disabled={atStart}
              className="absolute left-0 top-0 bottom-0 w-[14%] z-20 bg-transparent disabled:opacity-0"
            />
            <button
              type="button"
              aria-label={t("common.next", "अगला पृष्ठ")}
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
        <div className="bx-pagebar shrink-0 z-[45] flex items-center justify-between gap-2 px-2 py-1 border-t" data-zsp-chrome="1">
          <button type="button" onClick={() => go(-1)} disabled={atStart} className="bx-navbtn">
            <ChevronLeft className="w-4 h-4" />
            <span>{t("common.prev", "पिछला")}</span>
          </button>
          <div className="bx-kicker tabular-nums truncate">
            {label ? `${label} · ` : ""}{t("common.page", "पृष्ठ")} {page + 1} / {pageCount}
          </div>
          <button type="button" onClick={() => go(1)} disabled={atEnd} className="bx-navbtn bx-navbtn-solid">
            <span>{t("common.next", "अगला")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ZeroScrollPager;

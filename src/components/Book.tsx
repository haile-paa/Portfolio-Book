import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop";

export interface BookPage {
  label: string;
  /** Wide two-page spread on desktop (e.g. profile+timeline, live demos).
   *  Ignored on phone — every page is single-width there. */
  spread?: boolean;
  content: ReactNode;
}

interface BookProps {
  pages: BookPage[];
  current: number;
  onChange: (index: number) => void;
}

/**
 * A book with real paper physics, built from stacked, absolutely-positioned
 * "leaves" that rotate around a shared left-hand spine (transform-origin: left).
 *
 * Responsive behavior:
 *  - Desktop (>=768px): pages flagged `spread` render as a wide, two-page
 *    open-book layout with a center spine line and page numbers — the
 *    content itself is a two-column grid (see Profile.tsx / Experience.tsx).
 *    Non-spread pages (Cover, Contact) stay single and centered, like a
 *    physical front/back cover.
 *  - Phone (<768px): every page renders single-width, full content stacked
 *    vertically, sized to fit the viewport — no side-by-side spreads.
 */
export default function Book({ pages, current, onChange }: BookProps) {
  const isDesktop = useIsDesktop();
  const total = pages.length;
  const activeSpread = Boolean(pages[current]?.spread) && isDesktop;

  // Tracks the *previous* current index so we can tell, per page, whether
  // it is the one actually turning this render (vs. one that was already
  // settled flipped/unflipped and shouldn't replay its fold-shadow).
  const prevCurrentRef = useRef(current);
  useEffect(() => {
    prevCurrentRef.current = current;
  }, [current]);

  const goTo = (index: number) => {
    if (index < 0 || index > total - 1) return;
    onChange(index);
  };

  // Stage dimensions: desktop pages get a taller fixed frame; spread pages
  // get roughly double the width of a single page. Phone pages fill the
  // viewport width (capped) with a taller aspect ratio.
  const height = isDesktop ? 620 : Math.min(600, window.innerHeight * 0.72);
  const singleWidth = isDesktop ? 460 : Math.min(420, window.innerWidth - 32);
  const width = activeSpread ? singleWidth * 2 - 8 : singleWidth;

  return (
    <div className='w-full flex flex-col items-center gap-6'>
      <div
        className='book-stage relative'
        style={{
          width,
          height,
          transition: "width 0.5s cubic-bezier(0.45,0.05,0.15,1)",
        }}
      >
        {pages.map((page, i) => {
          const flipped = i < current;
          const wasFlipped = i < prevCurrentRef.current;
          const isTurningNow = flipped !== wasFlipped;
          const isThisSpread = Boolean(page.spread) && isDesktop;
          return (
            <motion.div
              key={i}
              className='page-3d absolute inset-0 rounded-2xl overflow-hidden shadow-page border border-gold-dark/30 bg-panel'
              style={{
                transformOrigin: "left center",
                zIndex: flipped ? i : total - i,
              }}
              animate={{ rotateY: flipped ? -178 : 0 }}
              transition={{ duration: 0.6, ease: [0.45, 0, 0.2, 1] }}
            >
              {/* Fold shadow that sweeps across the page mid-turn, synced
                  to the same duration so it peaks as the page passes 90°.
                  Only the page actually turning this render gets it — every
                  other settled page stays untouched (no flash). */}
              {isTurningNow && (
                <motion.div
                  className='absolute inset-0 bg-black pointer-events-none z-20'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.45, 0] }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                  }}
                />
              )}

              {/* Spine shading, left edge */}
              <div className='absolute inset-y-0 left-0 w-10 shadow-spine pointer-events-none z-10' />

              {/* Center spine line + page numbers for open two-page spreads */}
              {isThisSpread && (
                <>
                  <div className='absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-10 bg-gradient-to-r from-black/20 via-black/5 to-black/20' />
                  <span className='absolute bottom-3 left-[calc(50%-2.4rem)] text-[10px] text-parchment/30 eyebrow z-10'>
                    {i * 2 + 1}
                  </span>
                  <span className='absolute bottom-3 left-[calc(50%+1.6rem)] text-[10px] text-parchment/30 eyebrow z-10'>
                    {i * 2 + 2}
                  </span>
                </>
              )}

              <div className='w-full h-full gold-scroll overflow-y-auto'>
                {page.content}
              </div>
            </motion.div>
          );
        })}

        {/* Prev / Next — icon-only, pinned to either side of the book so
            they read as book controls rather than a text toolbar. On
            desktop they float just outside the spine edges; on phone they
            sit just inside so they stay reachable on small screens. */}
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          aria-label='Previous page'
          className='absolute top-1/2 -translate-y-1/2 left-2 md:-left-14 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-ink/70 backdrop-blur-sm border border-gold-dark/50 text-parchment/70 hover:text-gold hover:border-gold transition-colors disabled:opacity-20 disabled:pointer-events-none'
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === total - 1}
          aria-label='Next page'
          className='absolute top-1/2 -translate-y-1/2 right-2 md:-right-14 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-ink/70 backdrop-blur-sm border border-gold-dark/50 text-parchment/70 hover:text-gold hover:border-gold transition-colors disabled:opacity-20 disabled:pointer-events-none'
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Page dots only */}
      <div className='flex items-center gap-2'>
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to ${pages[i].label}`}
            className={`h-1.5 rounded-full transition-all ${
              i === current
                ? "w-6 bg-gold"
                : "w-1.5 bg-parchment/25 hover:bg-parchment/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

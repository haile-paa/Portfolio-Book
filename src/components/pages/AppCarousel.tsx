import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AppCarouselProps {
  /** Public paths, e.g. ['/carousels/hulu/1.jpg', ...] */
  images: string[]
  alt: string
}

const SWIPE_THRESHOLD = 60

/**
 * A LinkedIn-carousel-style, swipe-through image viewer inside a phone
 * frame. Entirely self-contained — swiping here never touches the book's
 * own page-turn state, it just advances slide index locally.
 */
export default function AppCarousel({ images, alt }: AppCarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Only the current slide is actually mounted in the DOM (see below), so
  // without this every swipe would trigger a fresh network fetch the first
  // time you land on that slide. Warming the browser's image cache for the
  // whole set up front means every swipe after the first paint is instant.
  // Kept in a ref (not state) purely to hold a reference so the Image
  // objects aren't garbage-collected mid-download.
  const preloadRef = useRef<HTMLImageElement[]>([])
  useEffect(() => {
    preloadRef.current = images.map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
  }, [images])

  const go = (next: number) => {
    if (next < 0 || next > images.length - 1) return
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x < -SWIPE_THRESHOLD) go(index + 1)
    else if (info.offset.x > SWIPE_THRESHOLD) go(index - 1)
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative w-full max-w-[260px] md:max-w-[320px] aspect-[4/5] rounded-2xl border-4 border-bronze/40 bg-black overflow-hidden shadow-page select-none">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={index}
            src={images[index]}
            alt={`${alt} — slide ${index + 1}`}
            className="absolute inset-0 w-full h-full object-contain bg-black cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            custom={direction}
            initial={{ x: direction >= 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -60 : 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            draggable={false}
            loading="eager"
            decoding="async"
          />
        </AnimatePresence>

        {/* left / right tap zones for click-through navigation */}
        <button
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className="absolute left-0 top-0 h-full w-1/3"
        />
        <button
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className="absolute right-0 top-0 h-full w-1/3"
        />
      </div>

      {/* controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="text-parchment/50 hover:text-gold disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-4 bg-gold' : 'w-1.5 bg-parchment/25 hover:bg-parchment/50'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(index + 1)}
          disabled={index === images.length - 1}
          className="text-parchment/50 hover:text-gold disabled:opacity-20 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
import { useState } from "react";
import AppCarousel from "./AppCarousel";

/**
 * Each app shows its own swipeable slide carousel (screenshots exported
 * from your LinkedIn carousel PDFs, or any screenshots you want to walk
 * through) inside a phone frame — visitors swipe through it right here,
 * no download or embed needed.
 *
 * Drop numbered images (1.jpg, 2.jpg, ...) into:
 *   public/carousels/<id>/
 * and list them in the `images` array below. Hulu Service is already
 * wired up from your LinkedIn carousel PDF.
 */
const apps = [
  {
    id: "hulu",
    name: "Hulu Service",
    tag: "ሁሉ ሰርቪስ",
    stack: "Go · Gin · MongoDB · React Native (Expo) · TypeScript",
    description:
      "An Amharic-language service marketplace connecting customers with local providers across Addis Ababa. Admin console, mobile app, and a Telegram Mini App — one backend, three surfaces.",
    images: Array.from({ length: 8 }, (_, i) => `/carousels/hulu/${i + 1}.jpg`),
  },
  {
    id: "yova",
    name: "YoVA",
    tag: "Productivity + AI",
    stack: "Go · MongoDB · React Native (Expo) · Groq Llama 3.3",
    description:
      "Tasks, notes, and scheduling with a built-in AI assistant. Shipped with a full code audit and released via EAS.",
    // TODO: add your own screenshots to public/carousels/yova/1.jpg ...
    images: Array.from({ length: 8 }, (_, i) => `/carousels/yova/${i + 1}.png`),
  },
  {
    id: "pedal",
    name: "Pedal Delivery",
    tag: "Food delivery platform",
    stack: "Go · Gin · MongoDB · WebSockets · React Native (Expo)",
    description:
      "A food delivery platform for Bahir Dar — one app, two interfaces: a customer-facing ordering flow and a dedicated driver app, sharing one real-time backend.",
    // TODO: add your own screenshots to public/carousels/pedal/1.jpg ...
    images: ["/carousels/pedal/1.jpg"],
  },
];

export default function Experience() {
  const [active, setActive] = useState(apps[0].id);
  const app = apps.find((a) => a.id === active)!;

  return (
    <div className='w-full h-full bg-panel grid grid-cols-1 md:grid-cols-2'>
      {/* Left page — controls + description */}
      <div className='p-6 flex flex-col gap-4 overflow-y-auto gold-scroll border-b md:border-b-0 md:border-r border-parchment/10'>
        <div>
          <span className='eyebrow text-gold'>Experience</span>
          <h2 className='font-display text-xl mt-1'>Swipe through the work</h2>
          <p className='text-xs text-parchment/60 mt-1'>
            Real screens, swipeable right here — like flipping through a
            carousel post.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          {apps.map((a) => (
            <button
              key={a.id}
              onClick={() => setActive(a.id)}
              className={`text-left text-sm px-3 py-2.5 rounded-lg border transition ${
                active === a.id
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-parchment/15 text-parchment/60 hover:border-parchment/30"
              }`}
            >
              <span className='font-semibold'>{a.name}</span>
              <span className='block text-[11px] text-parchment/40 mt-0.5'>
                {a.tag}
              </span>
            </button>
          ))}
        </div>

        <div>
          <p className='text-xs text-parchment/60 leading-relaxed'>
            {app.description}
          </p>
          <p className='eyebrow text-parchment/35 mt-3'>{app.stack}</p>
        </div>
      </div>

      {/* Right page — swipeable carousel in a phone frame */}
      <div className='p-6 flex flex-col items-center justify-center gap-3'>
        <AppCarousel key={app.id} images={app.images} alt={app.name} />
      </div>
    </div>
  );
}

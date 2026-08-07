import CoverScene from "../CoverScene";

interface CoverProps {
  onViewProjects: () => void;
  onContact: () => void;
}

export default function Cover({ onViewProjects, onContact }: CoverProps) {
  return (
    <div className='relative w-full h-full flex flex-col items-center justify-center px-8 text-center bg-gradient-to-b from-panel to-[#0d0b12]'>
      <CoverScene />

      <div className='relative z-10 flex flex-col items-center gap-5'>
        <span className='eyebrow text-gold-light'>Portfolio · 2026</span>

        <h1 className='font-display text-4xl sm:text-5xl leading-tight'>
          Haileyesus <span className='italic text-gold'>Eyasu</span>
        </h1>

        <p className='eyebrow text-parchment/70'>
          Full-Stack &amp; AI Automation Developer
        </p>

        <p className='max-w-xs text-sm text-parchment/70 leading-relaxed'>
          Building React Native apps, Go backends, and AI-driven workflows —
          from a food-delivery platform to an Amharic service marketplace.
        </p>

        <div className='flex flex-col gap-3 mt-2 w-52'>
          <button
            onClick={onViewProjects}
            className='bg-gold-fade text-ink font-semibold text-sm py-2.5 rounded-full tracking-wide hover:brightness-110 transition'
          >
            View Projects
          </button>
          <button
            onClick={onContact}
            className='border border-gold-dark/60 text-parchment/80 text-sm py-2.5 rounded-full tracking-wide hover:border-gold hover:text-gold transition'
          >
            Contact Me
          </button>
        </div>
      </div>
    </div>
  );
}

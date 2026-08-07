import { Github, Linkedin, Mail, Send } from "lucide-react";

const timeline = [
  {
    range: "2026 — Present",
    role: "Independent Full-Stack Developer",
    detail:
      "Building Hulu Service, an Amharic-language service marketplace, on Go/Gin/MongoDB with a React Native + Expo mobile app and a React admin dashboard.",
  },
  {
    range: "2025",
    role: "Pedal Delivery — Full-Stack Build",
    detail:
      "A food delivery platform for Bahir Dar: one app, two interfaces (customer + driver), Go/Gin/MongoDB backend on Render with real-time driver tracking over WebSockets.",
  },
  {
    range: "2025",
    role: "YoVA — Productivity App",
    detail:
      "Shipped end-to-end: Go/MongoDB backend, React Native/Expo frontend, and a Groq-powered AI assistant, built through a full code audit and EAS release.",
  },
];

const skills = [
  "Go",
  "React Native",
  "MongoDB",
  "React",
  "TypeScript",
  "WebSockets",
];

export default function Profile() {
  return (
    <div className='w-full h-full bg-parchment text-ink flex flex-col md:grid md:grid-cols-2'>
      {/* Left page — bio.
          NOTE: no independent overflow/scroll here — see Experience.tsx
          for why that clips content in a Grid/Flex row on mobile. Book.tsx's
          page wrapper is the only scroll container. */}
      <div className='p-8 flex flex-col items-center text-center gap-3 border-b md:border-b-0 md:border-r border-ink/10 flex-shrink-0'>
        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center font-display text-3xl text-ink'>
          HE
        </div>
        <h2 className='font-display text-2xl'>Haileyesus Eyasu</h2>
        <p className='text-sm text-bronze font-semibold eyebrow'>
          Full-Stack Developer
        </p>

        <div className='flex gap-3 mt-1'>
          <a
            href='https://github.com/haile-paa'
            target='_blank'
            rel='noopener noreferrer'
            className='w-9 h-9 rounded-full bg-ink/5 flex items-center justify-center text-bronze hover:bg-gold hover:text-ink transition'
          >
            <Github size={16} />
          </a>
          <a
            href='https://www.linkedin.com/in/haileyesus-404795264'
            target='_blank'
            rel='noopener noreferrer'
            className='w-9 h-9 rounded-full bg-ink/5 flex items-center justify-center text-bronze hover:bg-gold hover:text-ink transition'
          >
            <Linkedin size={16} />
          </a>
          <a
            href='https://t.me/paDevelopments'
            target='_blank'
            rel='noopener noreferrer'
            className='w-9 h-9 rounded-full bg-ink/5 flex items-center justify-center text-bronze hover:bg-gold hover:text-ink transition'
          >
            <Send size={16} />
          </a>
          <a
            href='mailto:Haileyesuseyasu@gmail.com'
            className='w-9 h-9 rounded-full bg-ink/5 flex items-center justify-center text-bronze hover:bg-gold hover:text-ink transition'
          >
            <Mail size={16} />
          </a>
        </div>

        <p className='text-sm text-ink/70 leading-relaxed max-w-xs'>
          I build Go backends, React Native apps, and AI automations for
          products that need to ship fast in the Ethiopian market and stay
          maintainable long after.
        </p>

        <div className='flex flex-wrap justify-center gap-1.5 mt-2'>
          {skills.map((s) => (
            <span
              key={s}
              className='text-[11px] px-2.5 py-1 rounded-full border border-bronze/30 text-bronze bg-ink/[0.03]'
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Right page — work timeline */}
      <div className='p-8'>
        <h3 className='font-display text-lg mb-5'>Work &amp; Projects</h3>
        <div className='relative pl-6'>
          <div className='absolute left-[7px] top-1 bottom-1 w-px bg-bronze/30' />
          <div className='flex flex-col gap-6'>
            {timeline.map((item, i) => (
              <div key={i} className='relative'>
                <div className='absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-gold border-2 border-parchment' />
                <p className='eyebrow text-bronze'>{item.range}</p>
                <p className='font-semibold text-sm mt-0.5'>{item.role}</p>
                <p className='text-xs text-ink/60 mt-1 leading-relaxed'>
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

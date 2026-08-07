import { Github, Linkedin, Mail, Send } from "lucide-react";

export default function Contact() {
  return (
    <div className='w-full h-full bg-gradient-to-b from-panel to-[#0d0b12] flex flex-col items-center justify-center text-center px-8 gap-5'>
      <span className='eyebrow text-gold-light'>Let's build something</span>
      <h2 className='font-display text-3xl'>Get in touch</h2>
      <p className='text-sm text-parchment/60 max-w-xs leading-relaxed'>
        Open to full-stack, mobile, and AI-automation work — reach out and I'll
        get back within a day.
      </p>

      <a
        href='mailto:Haileyesuseyasu@gmail.com'
        className='bg-gold-fade text-ink font-semibold text-sm py-2.5 px-8 rounded-full tracking-wide hover:brightness-110 transition'
      >
        Email Me
      </a>

      <div className='flex gap-4 mt-2'>
        <a
          href='https://github.com/haile-paa'
          target='_blank'
          rel='noopener noreferrer'
          className='w-10 h-10 rounded-full border border-gold-dark/50 flex items-center justify-center text-parchment/70 hover:border-gold hover:text-gold transition'
        >
          <Github size={16} />
        </a>
        <a
          href='https://www.linkedin.com/in/haileyesus-404795264'
          target='_blank'
          rel='noopener noreferrer'
          className='w-10 h-10 rounded-full border border-gold-dark/50 flex items-center justify-center text-parchment/70 hover:border-gold hover:text-gold transition'
        >
          <Linkedin size={16} />
        </a>
        <a
          href='https://t.me/paDevelopments'
          target='_blank'
          rel='noopener noreferrer'
          className='w-10 h-10 rounded-full border border-gold-dark/50 flex items-center justify-center text-parchment/70 hover:border-gold hover:text-gold transition'
        >
          <Send size={16} />
        </a>
        <a
          href='mailto:Haileyesuseyasu@gmail.com'
          className='w-10 h-10 rounded-full border border-gold-dark/50 flex items-center justify-center text-parchment/70 hover:border-gold hover:text-gold transition'
        >
          <Mail size={16} />
        </a>
      </div>
    </div>
  );
}

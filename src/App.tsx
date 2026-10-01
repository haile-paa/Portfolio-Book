import { useRef, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import Scene from "./components/Scene";
import Chat from "./components/Chat";
import { CONTACT, PROJECTS, RESUME, STACK } from "./data";

const ease = [0.2, 0.7, 0.2, 1] as const;
const stagger: Variants = { show: { transition: { staggerChildren: 0.14 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
const wrap = "px-6 md:px-12 max-w-[1280px] mx-auto";
const amberBtn = { background: "var(--ac)", color: "#14201C" };

function Tilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const b = ref.current!.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5,
      y = (e.clientY - b.top) / b.height - 0.5;
    ref.current!.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  };
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => (ref.current!.style.transform = "")}
      className='transition-transform duration-200 will-change-transform'
    >
      {children}
    </div>
  );
}

function Hero() {
  return (
    <header id='top' className='hero'>
      <nav className='flex items-center justify-between px-6 md:px-12 py-6'>
        <a
          href='#top'
          className='disp font-extrabold text-xl'
          aria-label='Home'
        >
          HE
        </a>
        <div className='flex gap-6 text-sm text-[#B9C7C0]'>
          {["Work", "Stack", "Contact"].map((l) => (
            <a
              key={l}
              href={"#" + l.toLowerCase()}
              className='hover:text-white transition-colors'
            >
              {l}
            </a>
          ))}
        </div>
      </nav>
      <div className={wrap + " pb-10 grid md:grid-cols-2 items-center gap-4"}>
        <motion.div variants={stagger} initial='hidden' animate='show'>
          <motion.h1
            variants={rise}
            className='disp font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[.98]'
          >
            Haileyesus
            <br />
            Eyasu
          </motion.h1>
          <motion.p
            variants={rise}
            className='mt-6 text-lg md:text-xl text-[#C5D1CB] max-w-md'
          >
            Full-stack developer. I build mobile apps and the web platforms
            behind them.
          </motion.p>
          <motion.div variants={rise} className='mt-9 flex flex-wrap gap-3'>
            <a href='#work' className='btn' style={amberBtn}>
              See my work
            </a>
            <a
              href={RESUME}
              target='_blank'
              rel='noopener noreferrer'
              className='btn border border-[#41594F] hover:bg-white/5'
            >
              View Resume
            </a>
            <a
              href='#contact'
              className='btn border border-[#41594F] hover:bg-white/5'
            >
              Get in touch
            </a>
          </motion.div>
        </motion.div>
        <Scene />
      </div>
    </header>
  );
}

function Work() {
  return (
    <section id='work' className={wrap + " py-24"}>
      <h2 className='disp font-extrabold text-4xl md:text-5xl'>
        Selected work
      </h2>
      <p className='mut mt-3 max-w-md'>
        Three apps I designed and built, each with its own blog.
      </p>
      <div className='mt-12'>
        {PROJECTS.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease }}
            className='grid md:grid-cols-12 gap-8 md:gap-12 items-center py-14 border-t ln'
          >
            <div className={"md:col-span-7 " + (i % 2 ? "md:order-2" : "")}>
              <Tilt>
                <a
                  href={p.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={`Open the ${p.name} site`}
                  className='block overflow-hidden rounded-2xl border ln shadow-xl'
                >
                  <img
                    src={p.img}
                    alt={`${p.name} app cover`}
                    loading='lazy'
                    className='w-full block'
                  />
                </a>
              </Tilt>
            </div>
            <div className='md:col-span-5'>
              <p className='mut text-sm'>{p.kind}</p>
              <h3 className='disp font-extrabold text-4xl mt-1'>{p.name}</h3>
              <p className='mt-4 leading-relaxed max-w-md'>{p.desc}</p>
              <p className='mut text-sm mt-4'>{p.tags}</p>
              <a
                href={p.url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block mt-6 font-semibold pb-1 border-b-2'
                style={{ borderColor: "var(--ac)" }}
              >
                Read the build blog
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section id='stack' className={wrap + " pb-24"}>
      <h2 className='disp font-extrabold text-4xl md:text-5xl'>Stack</h2>
      <p className='mut mt-3 max-w-lg'>
        I take a product from the phone screen to the server, the database and
        the site that explains it.
      </p>
      <div className='mt-10'>
        {STACK.map((g) => (
          <div
            key={g.group}
            className='grid sm:grid-cols-[14rem_1fr] gap-4 sm:gap-6 py-6 border-t ln'
          >
            <h3 className='font-semibold'>{g.group}</h3>
            <motion.ul
              variants={stagger}
              initial='hidden'
              whileInView='show'
              viewport={{ once: true }}
              className='flex flex-wrap gap-3'
            >
              {g.items.map(({ name, Icon, color }) => (
                <motion.li
                  key={name}
                  variants={rise}
                  whileHover={{ y: -4, rotate: -2 }}
                  className='flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ln'
                >
                  <Icon size={22} color={color} aria-hidden />
                  <span className='text-sm font-medium'>{name}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <footer id='contact' className='hero px-6 md:px-12 py-24'>
      <div className='max-w-[1280px] mx-auto'>
        <h2 className='disp font-extrabold text-4xl md:text-6xl max-w-2xl leading-[1.02]'>
          Have an app in mind? Let's build it.
        </h2>
        <div className='mt-9 flex flex-wrap gap-3'>
          <a className='btn' style={amberBtn} href={"mailto:" + CONTACT.email}>
            Email me
          </a>
          <a
            className='btn border border-[#41594F] hover:bg-white/5'
            href={CONTACT.linkedin}
            target='_blank'
            rel='noopener noreferrer'
          >
            LinkedIn
          </a>
          <a
            className='btn border border-[#41594F] hover:bg-white/5'
            href={CONTACT.github}
            target='_blank'
            rel='noopener noreferrer'
          >
            GitHub
          </a>
        </div>
        <p className='mt-20 text-sm text-[#93A39B]'>© 2026 Haileyesus Eyasu</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <main>
        <Hero />
        <Work />
        <Stack />
        <Contact />
      </main>
      <Chat />
    </>
  );
}

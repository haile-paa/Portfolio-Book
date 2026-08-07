import { useState } from "react";
import Book, { BookPage } from "./components/Book";
import Logo from "./components/Logo";
import Cover from "./components/pages/Cover";
import Profile from "./components/pages/Profile";
import Experience from "./components/pages/Experience";
import Contact from "./components/pages/Contact";

const PAGE_INDEX = {
  cover: 0,
  profile: 1,
  experience: 2,
  contact: 3,
};

export default function App() {
  const [current, setCurrent] = useState(0);

  const pages: BookPage[] = [
    {
      label: "Cover",
      spread: false,
      content: (
        <Cover
          onViewProjects={() => setCurrent(PAGE_INDEX.experience)}
          onContact={() => setCurrent(PAGE_INDEX.contact)}
        />
      ),
    },
    { label: "Profile & Work", spread: true, content: <Profile /> },
    { label: "Experience", spread: true, content: <Experience /> },
    { label: "Contact", spread: false, content: <Contact /> },
  ];

  return (
    <main className='min-h-screen w-full bg-ink flex flex-col items-center justify-center py-10 px-4'>
      <div className='text-center mb-6 flex flex-col items-center gap-2'>
        <Logo size={40} />
        <p className='eyebrow text-gold-dark'>PA Dev's</p>
        <p className='eyebrow text-parchment/40 mt-0.5'>
          {pages[current].label}
        </p>
      </div>
      <Book pages={pages} current={current} onChange={setCurrent} />
    </main>
  );
}

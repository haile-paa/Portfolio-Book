import type { IconType } from "react-icons";
import {
  SiReact,
  SiTypescript,
  SiGo,
  SiMongodb,
  SiThreedotjs,
  SiGit,
  SiGithub,
  SiExpo,
  SiGooglemaps,
  SiTailwindcss,
} from "react-icons/si";

export const CONTACT = {
  email: "haileyesuseyasu@gmail.com",
  github: "https://github.com/haile-paa",
  linkedin: "https://www.linkedin.com/in/haileyesus-404795264",
};

export interface Project {
  id: string;
  name: string;
  kind: string;
  url: string;
  img: string;
  desc: string;
  tags: string;
}
// Order: Pedal Delivery, Hulu Service, YOVA
export const PROJECTS: Project[] = [
  {
    id: "pedal",
    name: "Pedal Delivery",
    kind: "Food delivery for Bahir Dar",
    url: "https://pedal-delivery.vercel.app",
    img: "/images/pedal.jpg",
    desc: "Browse local restaurants, order, and pay with TeleBirr, CBE bank transfer or cash on delivery.",
    tags: "Mobile app, Delivery, Payments",
  },
  {
    id: "hulu",
    name: "Hulu Service",
    kind: "Local service marketplace",
    url: "https://hulu-service.vercel.app",
    img: "/images/hulu.jpg",
    desc: "Find electricians, plumbers, cleaners and tutors and book them in Amharic or English, with a direct APK download.",
    tags: "Mobile app, Marketplace, Amharic and English",
  },
  {
    id: "yova",
    name: "YOVA",
    kind: "Virtual assistant app",
    url: "https://yova-virtual-assistant.vercel.app",
    img: "/images/yova.jpg",
    desc: "Your schedule, notes, tasks and an AI assistant on one calm dashboard. The blog documents how it was built.",
    tags: "Mobile app, AI assistant, Dashboard",
  },
];

export interface Tech {
  name: string;
  Icon: IconType;
  color?: string;
}
export const STACK: { group: string; items: Tech[] }[] = [
  {
    group: "Mobile",
    items: [
      { name: "React Native", Icon: SiReact, color: "#61DAFB" },
      { name: "Expo Go", Icon: SiExpo },
      { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
    ],
  },
  {
    group: "Web",
    items: [
      { name: "React JS", Icon: SiReact, color: "#61DAFB" },
      { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Three.js", Icon: SiThreedotjs },
    ],
  },
  {
    group: "Backend and data",
    items: [
      { name: "Golang", Icon: SiGo, color: "#00ADD8" },
      { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
    ],
  },
  {
    group: "Tools",
    items: [
      { name: "Git", Icon: SiGit, color: "#F05032" },
      { name: "GitHub", Icon: SiGithub },
      { name: "Google Maps", Icon: SiGooglemaps, color: "#4285F4" },
    ],
  },
];

// Resume opened by the hero "View Resume" button (regenerate with scripts/make_resume.py)
export const RESUME = "/resume.pdf";

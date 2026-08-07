const groups = [
  {
    title: 'Backend',
    items: ['Go', 'Gin', 'MongoDB', 'MySQL', 'WebSockets (Gorilla)', 'JWT Auth'],
  },
  {
    title: 'Mobile & Web',
    items: ['React Native (Expo)', 'React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    title: 'AI & Tooling',
    items: ['Groq / LLM APIs', 'Render Deployment', 'EAS Build', 'REST design'],
  },
]

export default function Skills() {
  return (
    <div className="w-full h-full bg-panel p-8 flex flex-col gap-6 overflow-y-auto gold-scroll">
      <div>
        <span className="eyebrow text-gold">Toolkit</span>
        <h2 className="font-display text-xl mt-1">What I build with</h2>
      </div>

      {groups.map((group) => (
        <div key={group.title}>
          <p className="eyebrow text-parchment/50 mb-2">{group.title}</p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className="text-xs px-3 py-1.5 rounded-full border border-gold-dark/40 text-parchment/80 bg-panel2"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

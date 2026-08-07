/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07070A',        // near-black backdrop
        panel: '#121017',      // book page / panel background
        panel2: '#1A1720',     // secondary panel
        parchment: '#F3EEE2',  // ivory text on dark
        gold: {
          DEFAULT: '#C9A24B',
          light: '#E4C77B',
          dark: '#8B6F3E',
        },
        bronze: '#5C4A2E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        spine: 'inset 12px 0 24px -12px rgba(0,0,0,0.6)',
        page: '0 30px 60px -20px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'gold-fade': 'linear-gradient(135deg, #E4C77B 0%, #C9A24B 45%, #8B6F3E 100%)',
      },
    },
  },
  plugins: [],
}

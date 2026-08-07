interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * The site mark — an open-book glyph in the same gold gradient used
 * throughout the portfolio. Used both as the in-app header logo
 * (see App.tsx) and as the source for the generated favicon
 * (public/favicon.svg / public/apple-touch-icon.png).
 */
export default function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 100 100'
      className={className}
      aria-hidden='true'
    >
      <rect width='100' height='100' rx='26' fill='#121017' />
      <g
        transform='translate(22.4,22.4) scale(2.3)'
        stroke='url(#logo-gold)'
        strokeWidth='1.6'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 7v14' />
        <path d='M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z' />
      </g>
      <defs>
        <linearGradient id='logo-gold' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#E4C77B' />
          <stop offset='0.45' stopColor='#C9A24B' />
          <stop offset='1' stopColor='#8B6F3E' />
        </linearGradient>
      </defs>
    </svg>
  );
}

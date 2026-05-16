import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rtl = require('tailwindcss-rtl');

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — calm trust-evoking blue
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        allay: {
          blue:   '#2563eb',
          indigo: '#4f46e5',
          dark:   '#0f172a',
          muted:  '#64748b',
        },
      },
      fontFamily: {
        // Heebo: best Latin+Hebrew dual-script sans-serif
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [rtl],
};

export default config;

/** @type {import('tailwindcss').Config} */
const { withUt } = require('uploadthing/tw');

module.exports = withUt({
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      dropShadow: {
        customBlack: '0px 4px 6px rgba(0, 0, 0, 1)',
      },
      height: {
        'screen-offset': 'calc(100vh - 4rem)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        bg0: '#202224',
        bg1: '#181a1c',
        bg2: '#3d4349',
      },
      animation: {
        slowPulse: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontFamily: {
        sans: ['var(--font-tomorrow)', 'sans-serif'],
        tomorrow: ['var(--font-tomorrow)', 'sans-serif'],
        barlow: ['var(--font-barlow font-bold)', 'sans-serif'],
      },
    },
  },
  safelist: [
    'bg-slate-400',
    'bg-gray-400',
    'bg-zinc-400',
    'bg-neutral-400',
    'bg-stone-400',
    'bg-red-400',
    'bg-orange-400',
    'bg-amber-400',
    'bg-yellow-400',
    'bg-lime-400',
    'bg-green-400',
    'bg-emerald-400',
    'bg-teal-400',
    'bg-cyan-400',
    'bg-sky-400',
    'bg-blue-400',
    'bg-indigo-400',
    'bg-violet-400',
    'bg-purple-400',
    'bg-fuchsia-400',
    'bg-pink-400',
    'bg-rose-400',
    'bg-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-white',
    'bg-slate-500',
    'bg-pink-500',
    'bg-black',
  ],
  plugins: [],
});

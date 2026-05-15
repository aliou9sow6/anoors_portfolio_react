/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'], // Utilise la variable CSS --font-corps
      },
      colors: {
        // Mappe les classes Tailwind aux variables CSS
        'bg-deep': 'var(--bg-deep)',
        'bg-card': 'var(--bg-card)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-input': 'var(--bg-input)',
        'border': 'var(--border)',
        'border-focus': 'var(--border-focus)',

        'accent': 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        'accent-dim': 'var(--accent-dim)',
        'danger': 'var(--danger)',
        'danger-dim': 'var(--danger-dim)',
        'success': 'var(--success)',
        'success-dim': 'var(--success-dim)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
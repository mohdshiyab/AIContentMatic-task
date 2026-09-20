/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0E14',
          card: '#121824',
          cardHover: '#182030',
          border: '#1F293D',
          accent: '#3B82F6',
          green: '#10B981',
          red: '#EF4444',
          muted: '#64748B',
          text: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}

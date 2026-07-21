/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        panel: 'var(--color-panel)',
        panelBorder: 'var(--color-border)',
        textMain: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        primary: '#3b82f6',
        accent: '#f43f5e',
        success: '#10b981'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

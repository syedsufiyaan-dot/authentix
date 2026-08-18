/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#070B14',
        surface: '#0D1320',
        card: '#111827',
        border: '#1F2937',
        primary: '#3B82F6',
        cyan: '#22D3EE',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: '#F8FAFC',
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      keyframes: {
        'scan-line': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'scan-line': 'scan-line 2s linear infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

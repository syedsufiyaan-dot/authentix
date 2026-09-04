/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          darkest: '#05080D',
          darker: '#070B14',
          card: '#0B111C',
          glass: 'rgba(11, 17, 28, 0.75)',
          panel: 'rgba(15, 23, 38, 0.85)',
          border: 'rgba(54, 225, 204, 0.15)',
          borderHover: 'rgba(54, 225, 204, 0.35)',
        },
        accent: {
          teal: '#36E1CC',
          cyan: '#20B8FF',
          blue: '#1E6BFF',
        },
        text: {
          primary: '#F4F8FC',
          muted: '#8496A8',
          dim: '#4F6174',
        },
        status: {
          success: '#39E58C',
          warning: '#FFB84D',
          critical: '#FF5C6C',
          info: '#20B8FF'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'teal-glow': '0 0 25px rgba(54, 225, 204, 0.25)',
        'cyan-glow': '0 0 25px rgba(32, 184, 255, 0.25)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'scan-laser': 'scan 3s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)', opacity: '0.8' },
          '100%': { transform: 'translateY(100%)', opacity: '0.2' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

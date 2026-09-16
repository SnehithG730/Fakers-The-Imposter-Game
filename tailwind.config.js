/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './client/index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        prudhvi: {
          bg: '#051811',
          card: '#0a261c',
          border: '#10b981',
          accent: '#34d399',
          glow: 'rgba(16, 185, 129, 0.25)',
          amber: '#d97706'
        },
        vayu: {
          bg: '#041824',
          card: '#082b3d',
          border: '#06b6d4',
          accent: '#38bdf8',
          glow: 'rgba(6, 182, 212, 0.25)'
        },
        jal: {
          bg: '#06132b',
          card: '#0d224d',
          border: '#3b82f6',
          accent: '#60a5fa',
          glow: 'rgba(59, 130, 246, 0.25)'
        },
        aakash: {
          bg: '#110c28',
          card: '#1b143d',
          border: '#8b5cf6',
          accent: '#c084fc',
          glow: 'rgba(139, 92, 246, 0.25)'
        },
        agni: {
          bg: '#1c0808',
          card: '#300f0f',
          border: '#ef4444',
          accent: '#f97316',
          glow: 'rgba(239, 68, 68, 0.25)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cinzel', 'Outfit', 'serif', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px currentColor)' },
          '100%': { filter: 'drop-shadow(0 0 20px currentColor)' },
        }
      }
    },
  },
  plugins: [],
};

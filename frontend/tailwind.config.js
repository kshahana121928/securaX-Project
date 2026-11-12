/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        secura: {
          navy: '#0B1F3A',
          dark: '#071629',
          blue: '#2563EB',
          cyan: '#06B6D4',
          red: '#DC2626',
          green: '#16A34A',
          amber: '#F59E0B',
          light: '#F4F7FB',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'beacon': 'beacon 2s infinite',
      },
      keyframes: {
        beacon: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 20px rgba(220, 38, 38, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)' },
        }
      }
    },
  },
  plugins: [],
}

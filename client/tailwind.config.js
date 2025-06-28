/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom dark mode colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Custom checkbox styling plugin
    function({ addUtilities }) {
      addUtilities({
        '.checkbox-custom': {
          'appearance': 'none',
          'background-color': 'white',
          'border': '1px solid #d1d5db',
          'border-radius': '0.25rem',
          'width': '1rem',
          'height': '1rem',
          'position': 'relative',
          'cursor': 'pointer',
          'transition': 'all 0.2s ease-in-out',
        },
        '.dark .checkbox-custom': {
          'background-color': '#334155',
          'border-color': '#475569',
        },
        '.checkbox-custom:checked': {
          'background-color': '#2563eb',
          'border-color': '#2563eb',
        },
        '.checkbox-custom:checked::after': {
          'content': '""',
          'position': 'absolute',
          'left': '0.125rem',
          'top': '0.0625rem',
          'width': '0.25rem',
          'height': '0.5rem',
          'border': '2px solid white',
          'border-top': 'none',
          'border-left': 'none',
          'transform': 'rotate(45deg)',
        },
        '.checkbox-custom:focus': {
          'outline': 'none',
          'box-shadow': '0 0 0 3px rgba(37, 99, 235, 0.1)',
        },
      });
    }
  ],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#FF385C', // Primary Airbnb coral red
          600: '#E00B41', // Hover state
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 6px 16px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 28px rgba(0, 0, 0, 0.12)',
        'dropdown': '0 10px 30px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}

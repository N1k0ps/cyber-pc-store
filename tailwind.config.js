/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Добавляем кастомную киберпанк-палитру, которую мы использовали в верстке
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          950: '#2e1065',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        }
      },
    },
  },
  plugins: [],
};
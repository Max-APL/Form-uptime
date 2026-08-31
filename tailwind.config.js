/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bmsc: {
          dark: '#0f172a',
          primary: '#1e293b',
          accent: '#0284c7',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          tableHeader: '#7F7F7F',
          tableSubheader: '#D9D9D9',
          tableGreen: '#D9EAD3'
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        producer: {
          light: '#2196F3',
          dark: '#1976D2'
        },
        consumer: {
          light: '#4CAF50',
          dark: '#388E3C'
        },
        buffer: {
          empty: '#F5F5F5',
          occupied: '#FF9800'
        },
        semaphore: {
          available: '#4CAF50',
          blocked: '#F44336',
          waiting: '#FFC107'
        },
        critical: '#9C27B0'
      }
    },
  },
  plugins: [],
}
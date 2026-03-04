// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // මේ import එක අනිවාර්යයි

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // මේ line එක plugins array එකේ තියෙන්න ඕන
  ],
})
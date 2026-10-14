import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/takvim/', // <--- Bu satırı mutlaka ekle (repo adın neyse başa ve sona slash koyarak)
})
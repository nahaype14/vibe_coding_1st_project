import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves this repo from /vibe_coding_1st_project/, so the
  // production build needs that base path; the dev server stays at /.
  base: command === 'build' ? '/vibe_coding_1st_project/' : '/',
}))

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // /api 요청은 API 서버(server/index.js, npm run server = wrangler dev)로 넘긴다. 포트는 package.json 의 --port 와 같아야 함
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// 배포 빌드에 꼭 있어야 하는 공개 주소 (.env.production). 빠지면 화면이 깨진 채 배포되므로 빌드를 멈춤
const REQUIRED_FOR_BUILD = ['VITE_API_URL', 'VITE_NEON_AUTH_URL']

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd())
    const missing = REQUIRED_FOR_BUILD.filter((key) => !env[key])
    if (missing.length) throw new Error(`빌드에 필요한 환경 변수가 없습니다: ${missing.join(', ')} (.env.production 확인)`)
  }

  return {
    plugins: [react()],
    // /api 요청은 API 서버(server/index.js, npm run server = wrangler dev)로 넘긴다. 포트는 package.json 의 --port 와 같아야 함
    server: {
      proxy: { '/api': 'http://localhost:3001' },
    },
  }
})

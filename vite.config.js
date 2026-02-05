import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 브라우저에서 /api로 시작하는 요청을 보내면 아래 target 주소로 가로채서 보냅니다.
      '/api': {
        target: 'http://192.168.0.81:8097', // 실제 백엔드 주소
        changeOrigin: true,             // 호스트 헤더를 target 주소로 변경 (CORS 해결 핵심)
        secure: false,                  // https가 아닐 경우 false
        rewrite: (path) => path.replace(/^\/api/, '/api') // 경로 유지
      }
    }
  }
})
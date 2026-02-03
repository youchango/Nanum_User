import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 외부 접속 허용
    allowedHosts: true // [중요] 모든 호스트 허용 (주소가 바뀌어도 에러 안 남)
  }
})
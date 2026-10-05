import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Estas dos se leen de process.env, NO de .env (los archivos .env solo se cargan
// despues de evaluar este archivo). Sin prefijo VITE_ a proposito: asi Vite no
// las expone en el bundle que llega al navegador.
//   PROXY_TARGET  - local  -> default de abajo: backend con `bash mvnw spring-boot:run`
//                - docker -> lo inyecta docker-compose.yml (servicio `web`)
//   USE_POLLING   - "true" para compilar los eventos de los bind mounts de Docker,
//                   sin los cuales el HMR se congela.
const proxyTarget = process.env.PROXY_TARGET || 'http://localhost:8081'
const usePolling = process.env.USE_POLLING === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    watch: { usePolling },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
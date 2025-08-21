import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: 'localhost',
      strictPort: true,
      // Remove headers to avoid Cross-Origin issues
      // The browser will handle CORS naturally
    },
    define: {
      // Expose environment variables to the client
      __APP_ENV__: JSON.stringify(env.APP_ENV || 'development'),
    },
    // Ensure environment variables are properly loaded
    envPrefix: 'VITE_',
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.jsx',
    },
  }
}) 
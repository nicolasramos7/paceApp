import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode ?? 'test', process.cwd(), '')
  return {
    test: {
      environment: 'node',
      testTimeout: 30000,
      env,
    },
  }
})

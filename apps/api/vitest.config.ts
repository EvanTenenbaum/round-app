import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'prisma'],
    },
  },
  resolve: {
    alias: {
      '@round/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
})

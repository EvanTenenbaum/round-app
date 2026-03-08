// Test setup — runs before each test file
// Uses a real test DB (separate from dev DB)
import { execSync } from 'child_process'
import { beforeAll, afterAll } from 'vitest'

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://round:round_local@localhost:5432/round_test'

beforeAll(async () => {
  // Apply migrations to test DB
  try {
    execSync('prisma db push --force-reset --skip-generate', {
      env: { ...process.env },
      stdio: 'pipe',
    })
  } catch {
    // DB might already be set up
  }
})

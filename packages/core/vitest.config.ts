import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Only the sources. The build output under lib/ contains compiled copies of
    // these same tests, and running both reports every result twice.
    include: ['src/**/*.test.ts'],
  },
})

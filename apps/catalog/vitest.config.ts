import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const storybookDir = fileURLToPath(new URL('.storybook', import.meta.url))

/**
 * Every story runs in a real browser as a test.
 *
 * There is no separate suite to keep in step: writing the catalog *is* writing the
 * regression tests. A story that throws fails here, a play function that cannot
 * find its button fails here, and the accessibility rules run over each one.
 */
export default defineConfig({
  plugins: [storybookTest({ configDir: storybookDir })],
  test: {
    name: 'catalog',
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
})

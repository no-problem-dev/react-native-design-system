import type { StorybookConfig } from '@storybook/react-native-web-vite'

/**
 * The framework rewrites every `react-native` import to `react-native-web`. That
 * rewrite keeps the bare name, so it is looked up from whichever package did the
 * importing — which is why the design system carries `react-native-web` as a dev
 * dependency of its own. Without it the rewrite lands nowhere and the build stops
 * on a package that never mentions the web implementation.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
}

export default config

import { ThemeProvider, useTheme } from '@no-problem/design-system'
import type { Preview } from '@storybook/react-native-web-vite'
import type { ReactNode } from 'react'
import { View } from 'react-native'

/** Paints the page the theme's own background, so contrast is judged fairly. */
function Stage({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return (
    <View style={{ backgroundColor: theme.colors.background, padding: 24, gap: 16, minHeight: 160 }}>
      {children}
    </View>
  )
}

const preview: Preview = {
  parameters: {
    // Accessibility findings fail the run rather than sit in a panel nobody opens.
    a11y: { test: 'error' },
    layout: 'fullscreen',
  },

  globalTypes: {
    appearance: {
      description: 'Light or dark',
      toolbar: {
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: { appearance: 'light' },

  decorators: [
    (Story, context) => (
      <ThemeProvider appearance={context.globals['appearance'] as 'light' | 'dark'} colorSource="brand">
        <Stage>
          <Story />
        </Stage>
      </ThemeProvider>
    ),
  ],
}

export default preview

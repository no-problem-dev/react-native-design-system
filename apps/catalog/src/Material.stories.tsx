import type { MaterialAdapter, MaterialCapabilities } from '@no-problem/design-system'
import { MaterialProvider, Surface, useTheme } from '@no-problem/design-system'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

/**
 * Stands in for a platform that draws glass. The real one lives in the Expo
 * adapter and can only answer on a device — but everything downstream of the
 * answer is ordinary code, and this is where it gets checked.
 */
function offering(capabilities: MaterialCapabilities): MaterialAdapter {
  return {
    capabilities,
    GlassSurface: ({ style, children }) => (
      <View style={[style, { backgroundColor: 'rgba(255,255,255,0.45)' }]}>{children}</View>
    ),
  }
}

function Label({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return <Text style={{ color: theme.colors.onSurface, fontSize: 14 }}>{children}</Text>
}

function Case({ title, adapter }: { title: string; adapter: MaterialAdapter }) {
  return (
    <MaterialProvider adapter={adapter}>
      <Surface elevation="overlay" padding="lg" radius="md">
        <Label>{title}</Label>
      </Surface>
    </MaterialProvider>
  )
}

const meta = { title: 'Material' } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * The whole ladder, in one frame.
 *
 * These four panels are what a device decides between. Seeing them together is
 * the reason the material is a value rather than a branch inside the component:
 * a browser can render every outcome a phone would.
 */
export const TheLadder: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Case
        title="platform offers interactive glass"
        adapter={offering({ glass: { available: true, interactive: true }, reduceTransparency: false })}
      />
      <Case
        title="offers the material, not the interaction"
        adapter={offering({ glass: { available: true, interactive: false }, reduceTransparency: false })}
      />
      <Case
        title="reader asked for less transparency"
        adapter={offering({ glass: { available: true, interactive: true }, reduceTransparency: true })}
      />
      <Case
        title="platform offers nothing"
        adapter={offering({ glass: { available: false, interactive: false }, reduceTransparency: false })}
      />
    </View>
  ),
}

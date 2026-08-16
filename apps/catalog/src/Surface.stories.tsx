import type { Elevation, ResolvedMaterial } from '@no-problem/design-system'
import { Surface, SurfaceCore, useTheme } from '@no-problem/design-system'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { Text, View } from 'react-native'

const elevations: Elevation[] = ['flat', 'raised', 'floating', 'overlay']

function Label({ children }: { children: string }) {
  const theme = useTheme()
  return <Text style={{ color: theme.colors.onSurface, fontSize: 14 }}>{children}</Text>
}

const meta = {
  title: 'Surface',
  component: Surface,
  args: { elevation: 'raised', padding: 'lg', radius: 'md' },
} satisfies Meta<typeof Surface>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Surface {...args}>
      <Label>A panel</Label>
    </Surface>
  ),
}

/** Every height, side by side, so a change to one is visible against the others. */
export const EveryElevation: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      {elevations.map((elevation) => (
        <Surface key={elevation} {...args} elevation={elevation}>
          <Label>{elevation}</Label>
        </Surface>
      ))}
    </View>
  ),
}

/**
 * The point of splitting a component at the material: the glass outcome is a plain
 * value, so it renders in a browser that has no glass at all. What a device still
 * has to answer is only whether the platform really offered it.
 */
export const GlassOutcome: Story = {
  render: () => {
    const theme = useTheme()
    const glass: ResolvedMaterial = {
      kind: 'glass',
      interactive: true,
      tintColor: undefined,
      borderColor: theme.colors.outline,
    }
    return (
      <View style={{ gap: 16 }}>
        <SurfaceCore material={glass} radius="md" padding="lg">
          <Label>resolved as glass</Label>
        </SurfaceCore>
        <SurfaceCore
          material={{
            kind: 'fill',
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            shadow: undefined,
          }}
          radius="md"
          padding="lg"
        >
          <Label>resolved as fill</Label>
        </SurfaceCore>
      </View>
    )
  },
}

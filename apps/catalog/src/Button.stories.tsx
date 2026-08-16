import type { ButtonSize, ButtonVariant } from '@no-problem/design-system'
import { Button } from '@no-problem/design-system'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { View } from 'react-native'

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger']
const sizes: ButtonSize[] = ['small', 'medium', 'large']

const meta = {
  title: 'Button',
  component: Button,
  args: { variant: 'primary', size: 'medium', children: 'Continue', onPress: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every variant against the same background, which is where a weak pairing shows. */
export const EveryVariant: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </View>
  ),
}

export const EverySize: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      {sizes.map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </View>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
}

/** A press has to reach the caller, and must not when the button is disabled. */
export const Pressing: Story = {
  args: { children: 'Press me' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Press me'))
    await expect(args.onPress).toHaveBeenCalledOnce()
  },
}

export const DisabledDoesNotFire: Story = {
  args: { disabled: true, children: 'Unavailable' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Unavailable'), { pointerEventsCheck: 0 })
    await expect(args.onPress).not.toHaveBeenCalled()
  },
}

/**
 * The parts a product owns.
 *
 * A design system that fixes the shape and the typeface leaves a product no way to
 * look like itself except to override the component from outside — at which point
 * the component is decoration. The colours stay here, because those are what keeps
 * a label readable on its fill.
 */
export const ShapedByTheProduct: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button radius="md" labelStyle={{ fontWeight: '800', letterSpacing: 1 }}>
        Squared off
      </Button>
      <Button variant="secondary" radius="none">
        No radius at all
      </Button>
      <Button variant="ghost" radius="lg">
        Ghost, softly rounded
      </Button>
    </View>
  ),
}

/**
 * A button that floats over content.
 *
 * The fill still comes from the variant — a floating button is not a panel, and
 * taking the whole material would repaint it in the surface colour. Only the
 * shadow follows the height.
 */
export const Floating: Story = {
  args: { elevation: 'floating', children: 'Compare all' },
}

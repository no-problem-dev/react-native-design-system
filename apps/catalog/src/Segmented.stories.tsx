import type { SegmentedOption } from '@no-problem/design-system'
import { SegmentedCore } from '@no-problem/design-system'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { useState } from 'react'
import { View } from 'react-native'
import { expect, userEvent, within } from 'storybook/test'

/**
 * What a browser can show of a control the platforms lend.
 *
 * On a device this is `UISegmentedControl` or Material's segmented buttons. Neither
 * exists here, so what runs is the drawing the design system falls back to — which
 * takes the same props, which is what makes the fallback worth having: the caller
 * writes one thing, and the choices behave the same everywhere.
 */
const ranges: readonly SegmentedOption<string>[] = [
  { value: 'week', label: '1W' },
  { value: 'month', label: '1M' },
  { value: 'quarter', label: '3M' },
  { value: 'year', label: '1Y' },
]

function Example({ initial = 'month' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <View style={{ gap: 12 }}>
      <SegmentedCore options={ranges} value={value} onChange={setValue} accessibilityLabel="Range" />
    </View>
  )
}

const meta = { title: 'Segmented', component: Example } satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Ranges: Story = {}

/** Only one segment is ever chosen, and choosing another lets the first go. */
export const ChoosingOne: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('3M'))
    await expect(canvas.getByText('3M').closest('[role="tab"]')).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(canvas.getByText('1M').closest('[role="tab"]')).toHaveAttribute(
      'aria-selected',
      'false',
    )
  },
}

import type { Theme } from '../../theme/types.js'

/** What the button is for, not what colour it is. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'

export type ButtonState = {
  pressed: boolean
  disabled: boolean
}

export type ResolvedButton = {
  backgroundColor: string
  labelColor: string
  borderColor: string | undefined
  paddingVertical: number
  paddingHorizontal: number
  fontSize: number
  minHeight: number
  opacity: number
}

const sizing: Readonly<
  Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; minHeight: number }>
> = {
  small: { paddingVertical: 4, paddingHorizontal: 12, fontSize: 14, minHeight: 32 },
  medium: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 16, minHeight: 44 },
  large: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 18, minHeight: 56 },
}

/**
 * Colours come from the control layer, not from the semantic one.
 *
 * The semantic `primary` is the brand's blue; a button fills a large area and puts
 * text on top of it, and that same blue with white on it measures 3.68:1 — below
 * what a reader with low vision needs. The control tokens hold a step of the same
 * hue chosen so every pair clears 4.5:1, which `contrast.test.ts` checks.
 */
function palette(variant: ButtonVariant, theme: Theme) {
  const { colors, control } = theme
  switch (variant) {
    case 'primary':
      return { backgroundColor: control.primaryFill, labelColor: control.primaryLabel, borderColor: undefined }
    case 'secondary':
      return { backgroundColor: control.secondaryFill, labelColor: control.secondaryLabel, borderColor: undefined }
    case 'danger':
      return { backgroundColor: control.dangerFill, labelColor: control.dangerLabel, borderColor: undefined }
    case 'ghost':
      return { backgroundColor: 'transparent', labelColor: control.ghostLabel, borderColor: colors.outline }
  }
}

/**
 * Pure, so every combination of variant, size and state can be rendered in a
 * browser and checked without a device.
 *
 * `medium` and `large` clear the 44pt touch target both platforms ask for.
 * `small` is below it on purpose and is meant for use inside a larger tappable row.
 */
export function resolveButton(
  variant: ButtonVariant,
  size: ButtonSize,
  state: ButtonState,
  theme: Theme,
): ResolvedButton {
  const { backgroundColor, labelColor, borderColor } = palette(variant, theme)
  const metrics = sizing[size]

  const opacity = state.disabled ? 0.38 : state.pressed ? 0.72 : 1

  return { backgroundColor, labelColor, borderColor, ...metrics, opacity }
}

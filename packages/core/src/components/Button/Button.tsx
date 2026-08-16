import type { ReactNode } from 'react'
import { useState } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'

import type { RadiusKey } from '@no-problem/design-tokens'

import type { Elevation } from '../../material/types.js'
import { useShadow } from '../../material/useMaterial.js'
import { useTheme } from '../../theme/ThemeProvider.js'
import { ButtonCore } from './ButtonCore.js'
import type { ButtonSize, ButtonVariant } from './resolveButton.js'
import { resolveButton } from './resolveButton.js'

export type ButtonProps = {
  variant?: ButtonVariant | undefined
  size?: ButtonSize | undefined
  onPress?: (() => void) | undefined
  disabled?: boolean | undefined
  accessibilityLabel?: string | undefined
  style?: StyleProp<ViewStyle> | undefined
  /** How round. Defaults to a capsule, which is what both platforms draw. */
  radius?: RadiusKey | undefined
  /** The label's typeface. Its size and colour stay with the design system. */
  labelStyle?: StyleProp<TextStyle> | undefined
  /**
   * How far above the page the button sits. Flat by default: most buttons are part
   * of the page, and one that floats over content is making a claim about itself.
   */
  elevation?: Elevation | undefined
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
  radius,
  labelStyle,
  elevation = 'flat',
  children,
}: ButtonProps) {
  const theme = useTheme()
  const shadow = useShadow(elevation)
  const [pressed, setPressed] = useState(false)
  const appearance = resolveButton(variant, size, { pressed, disabled }, theme, radius)

  return (
    <ButtonCore
      appearance={appearance}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={[shadow, style]}
      labelStyle={labelStyle}
    >
      {children}
    </ButtonCore>
  )
}

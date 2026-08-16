import type { ReactNode } from 'react'
import { useState } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

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
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
  children,
}: ButtonProps) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)
  const appearance = resolveButton(variant, size, { pressed, disabled }, theme)

  return (
    <ButtonCore
      appearance={appearance}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      {children}
    </ButtonCore>
  )
}

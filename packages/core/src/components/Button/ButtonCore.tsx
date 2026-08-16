import { radius as radiusScale } from '@no-problem/design-tokens'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { Pressable, StyleSheet, Text } from 'react-native'

import type { ResolvedButton } from './resolveButton.js'

export type ButtonCoreProps = {
  /** Already decided for this variant, size and state. */
  appearance: ResolvedButton
  onPress?: (() => void) | undefined
  onPressIn?: (() => void) | undefined
  onPressOut?: (() => void) | undefined
  disabled?: boolean | undefined
  accessibilityLabel?: string | undefined
  style?: StyleProp<ViewStyle> | undefined
  children: ReactNode
}

export function ButtonCore({
  appearance,
  onPress,
  onPressIn,
  onPressOut,
  disabled = false,
  accessibilityLabel,
  style,
  children,
}: ButtonCoreProps) {
  const container: ViewStyle = {
    backgroundColor: appearance.backgroundColor,
    paddingVertical: appearance.paddingVertical,
    paddingHorizontal: appearance.paddingHorizontal,
    minHeight: appearance.minHeight,
    borderRadius: radiusScale.full,
    opacity: appearance.opacity,
    alignItems: 'center',
    justifyContent: 'center',
    ...(appearance.borderColor === undefined
      ? null
      : { borderWidth: StyleSheet.hairlineWidth, borderColor: appearance.borderColor }),
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...(accessibilityLabel === undefined ? null : { accessibilityLabel })}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[container, style]}
    >
      {typeof children === 'string' ? (
        <Text style={{ color: appearance.labelColor, fontSize: appearance.fontSize, fontWeight: '600' }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

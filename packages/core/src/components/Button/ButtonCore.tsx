import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
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
  /**
   * The label's typeface, for a product that has one.
   *
   * Size and colour still come from the resolved appearance — those are what keeps
   * the label readable on its fill. What a product supplies here is the family and
   * the weight, which no design system can know for it.
   */
  labelStyle?: StyleProp<TextStyle> | undefined
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
  labelStyle,
  children,
}: ButtonCoreProps) {
  const container: ViewStyle = {
    backgroundColor: appearance.backgroundColor,
    paddingVertical: appearance.paddingVertical,
    paddingHorizontal: appearance.paddingHorizontal,
    minHeight: appearance.minHeight,
    borderRadius: appearance.borderRadius,
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
        <Text
          style={[{ color: appearance.labelColor, fontSize: appearance.fontSize, fontWeight: '600' }, labelStyle]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

import type { StyleProp, ViewStyle } from 'react-native'
import { Pressable, Text, View } from 'react-native'

import { useTheme } from '../../theme/ThemeProvider.js'
import type { SegmentedOption } from './resolveSegmented.js'
import { resolveSegmented } from './resolveSegmented.js'

export type SegmentedCoreProps<T extends string | number> = {
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  accessibilityLabel?: string | undefined
  style?: StyleProp<ViewStyle> | undefined
}

/**
 * A segmented control drawn from the theme.
 *
 * This is what runs where the platform has no control of its own to lend — the
 * web catalog, and anywhere the native one cannot be reached. Because it takes the
 * same props as the platform-backed one, a story renders here and a device renders
 * there, and neither the caller nor the test has to know which.
 */
export function SegmentedCore<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedCoreProps<T>) {
  const theme = useTheme()
  const look = resolveSegmented(theme)

  return (
    <View
      accessibilityRole="tablist"
      {...(accessibilityLabel === undefined ? null : { accessibilityLabel })}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: look.trackColor,
          borderRadius: look.borderRadius,
          padding: 2,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const chosen = option.value === value
        const segment = chosen ? look.selected : look.unselected
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="tab"
            // Both spellings on purpose: the older one is what the native
            // platforms read, the newer one is what a browser reads, and this
            // component has to be right in a story as well as on a device.
            accessibilityState={{ selected: chosen }}
            aria-selected={chosen}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 32,
              paddingHorizontal: theme.spacing.sm,
              borderRadius: look.borderRadius,
              backgroundColor: segment.backgroundColor,
            }}
          >
            <Text style={{ color: segment.labelColor, fontSize: 13, fontWeight: '600' }}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

import type { GlassSurfaceProps, MaterialCapabilities } from '@no-problem/design-system'
import { resolveSegmented, useTheme } from '@no-problem/design-system'
import { Host, Picker, Text } from '@expo/ui/swift-ui'
import { pickerStyle, tag, tint } from '@expo/ui/swift-ui/modifiers'
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import { useEffect, useMemo, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

import { capabilitiesFrom } from './capabilities.js'
import type { PlatformBindings, PlatformSegmentedProps } from './platform.types.js'

function useReduceTransparency(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    let current = true
    void AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (current) setReduced(value)
    })
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduced)
    return () => {
      current = false
      subscription.remove()
    }
  }, [])

  return reduced
}

function useCapabilities(): MaterialCapabilities {
  const reduceTransparency = useReduceTransparency()

  return useMemo(
    () =>
      capabilitiesFrom({
        liquidGlassAvailable: isLiquidGlassAvailable(),
        glassEffectApiAvailable: isGlassEffectAPIAvailable(),
        reduceTransparency,
      }),
    [reduceTransparency],
  )
}

/**
 * Fading this out has to go through the glass style, not through opacity.
 * Setting opacity to zero switches the material off outright, which reads as the
 * panel vanishing rather than dissolving — a trap worth absorbing here so that
 * nobody using the design system has to know about it.
 */
function GlassSurface({ style, tintColor, interactive, children }: GlassSurfaceProps) {
  return (
    <GlassView
      style={style}
      glassEffectStyle="regular"
      {...(tintColor === undefined ? null : { tintColor })}
      isInteractive={interactive ?? false}
    >
      {children}
    </GlassView>
  )
}

/**
 * The platform's own segmented control.
 *
 * SwiftUI draws it from a `Picker` told to use the segmented style, which is the
 * real `UISegmentedControl`: the sliding capsule, the press behaviour, and the
 * "1 of 3" a screen reader announces. `Host` is the bridge into SwiftUI, and
 * `matchContents` lets the control keep the height SwiftUI decides rather than one
 * written down here — a height written down is a height that is wrong under a
 * larger text setting.
 */
function Segmented({ options, value, onChange, accessibilityLabel, style }: PlatformSegmentedProps) {
  const theme = useTheme()
  const look = resolveSegmented(theme)

  return (
    <Host matchContents={{ vertical: true }} colorScheme={theme.appearance} style={style}>
      <Picker
        selection={value}
        onSelectionChange={onChange}
        modifiers={[pickerStyle('segmented'), tint(look.tintColor)]}
        {...(accessibilityLabel === undefined ? null : { label: accessibilityLabel })}
      >
        {options.map((option) => (
          <Text key={String(option.value)} modifiers={[tag(option.value)]}>
            {option.label}
          </Text>
        ))}
      </Picker>
    </Host>
  )
}

/** Colours come from the design system on this platform; nothing is offered. */
const useDynamicColors: PlatformBindings['useDynamicColors'] = () => undefined

export const bindings: PlatformBindings = { useCapabilities, useDynamicColors, GlassSurface, Segmented }

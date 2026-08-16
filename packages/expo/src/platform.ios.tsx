import type { GlassSurfaceProps, MaterialCapabilities } from '@no-problem/design-system'
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import { useEffect, useMemo, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

import { capabilitiesFrom } from './capabilities.js'
import type { PlatformBindings } from './platform.types.js'

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

/** Colours come from the design system on this platform; nothing is offered. */
const useDynamicColors: PlatformBindings['useDynamicColors'] = () => undefined

export const bindings: PlatformBindings = { useCapabilities, useDynamicColors, GlassSurface }

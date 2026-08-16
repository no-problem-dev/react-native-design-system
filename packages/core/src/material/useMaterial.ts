import type { StyleProp, ViewStyle } from 'react-native'

import { useTheme } from '../theme/ThemeProvider.js'
import { fillStyle } from './fillStyle.js'
import { useMaterialAdapter } from './MaterialProvider.js'
import { resolveMaterial } from './resolve.js'
import type { Elevation, ResolvedMaterial } from './types.js'

/**
 * What a surface at this height is made of, here, right now.
 *
 * `Surface` is the answer when the panel is a panel. This is the answer when it
 * cannot be — when the element has to be a `Pressable`, a `ScrollView`, an
 * animated view — because those own their own element and cannot be handed one.
 * Without this, such a caller has no way to reach the decision and ends up writing
 * a shadow by hand, which is how a second set of values gets started.
 */
export function useMaterial(elevation: Elevation = 'raised'): ResolvedMaterial {
  const theme = useTheme()
  const { capabilities } = useMaterialAdapter()
  return resolveMaterial(elevation, theme, capabilities)
}

/**
 * The same decision, already flattened into a style.
 *
 * Glass has no style form — it is a component the platform draws — so a caller
 * that only wants a style gets the fill that stands in for it. A caller that can
 * render glass should reach for `Surface`, or read `useMaterial` and branch.
 */
export function useMaterialStyle(elevation: Elevation = 'raised'): StyleProp<ViewStyle> {
  const theme = useTheme()
  const { capabilities } = useMaterialAdapter()
  const material = resolveMaterial(elevation, theme, {
    ...capabilities,
    // Ask for the form that has one. This is not "pretend the platform is worse":
    // the fill is what a glass surface falls back to everywhere already, so the
    // two paths cannot drift.
    glass: { available: false, interactive: false },
  })

  return material.kind === 'fill' ? fillStyle(material) : null
}

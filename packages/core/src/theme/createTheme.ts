import { iconSize, radius, scheme, spacing } from '@no-problem/design-tokens'
import type { ColorScheme } from '@no-problem/design-tokens'

import type { Appearance, ColorSource, Theme } from './types.js'

/** The colours this package ships, for one appearance. */
export function brandColors(appearance: Appearance): ColorScheme {
  return scheme[appearance]
}

/**
 * Build a theme.
 *
 * `dynamicColors` is whatever the platform offered, or `undefined` when it offered
 * nothing. Resolving that here — rather than inside each component — keeps the
 * decision in one testable place.
 */
export function createTheme(options: {
  appearance: Appearance
  colorSource?: ColorSource
  dynamicColors?: ColorScheme | undefined
}): Theme {
  const { appearance, colorSource = 'auto', dynamicColors } = options

  const colors =
    colorSource === 'brand'
      ? brandColors(appearance)
      : colorSource === 'dynamic'
        ? (dynamicColors ?? brandColors(appearance))
        : (dynamicColors ?? brandColors(appearance))

  return { appearance, colors, spacing, radius, iconSize }
}

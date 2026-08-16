import { control, iconSize, radius, scheme, spacing } from '@no-problem/design-tokens'
import type { ColorScheme, ControlTokens } from '@no-problem/design-tokens'

import { contrastMinimum, ensureContrast } from '../a11y/contrast.js'
import type { Appearance, ColorSource, Theme } from './types.js'

/** The colours this package ships, for one appearance. */
export function brandColors(appearance: Appearance): ColorScheme {
  return scheme[appearance]
}

/**
 * Work out the control values for a set of colours.
 *
 * A control fills a large area and puts text on top of it, so the colour a brand
 * names is not always a colour its label can be read on — the two are chosen for
 * different jobs. Each fill is nudged away from its label until the pair clears
 * the threshold, which keeps the brand recognisable and the label readable
 * without anyone having to notice the conflict.
 *
 * The shipped values already pass, so nothing moves when no brand is supplied.
 */
function controlFor(colors: ColorScheme, base: ControlTokens): ControlTokens {
  const readable = (fill: string, label: string) => ensureContrast(fill, label, contrastMinimum.normalText)

  return {
    ...base,
    primaryFill: readable(colors.primary, base.primaryLabel),
    secondaryFill: readable(colors.secondary, base.secondaryLabel),
    dangerFill: readable(colors.error, base.dangerLabel),
    // A ghost control has no fill of its own, so its label is measured against the
    // page it sits on.
    ghostLabel: readable(colors.primary, colors.background),
  }
}

/**
 * Build a theme.
 *
 * Three things can decide the colours, in order of how specific they are:
 *
 *   `brand`         what this product looks like. Overrides whatever it names.
 *   `dynamicColors` what the platform offered, used when `colorSource` allows it.
 *   the shipped set everything neither of them mentioned.
 *
 * Resolving that here — rather than inside each component — keeps the decision in
 * one testable place.
 */
export function createTheme(options: {
  appearance: Appearance
  colorSource?: ColorSource
  dynamicColors?: ColorScheme | undefined
  /** This product's own colours. Anything left out keeps the shipped value. */
  brand?: Partial<ColorScheme> | undefined
}): Theme {
  const { appearance, colorSource = 'auto', dynamicColors, brand } = options

  const platform = colorSource === 'brand' ? undefined : dynamicColors
  const colors: ColorScheme = { ...brandColors(appearance), ...platform, ...brand }

  return {
    appearance,
    colors,
    control: controlFor(colors, control[appearance]),
    spacing,
    radius,
    iconSize,
  }
}

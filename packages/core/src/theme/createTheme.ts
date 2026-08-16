import { control, iconSize, radius, scheme, spacing } from '@no-problem/design-tokens'
import type { ColorScheme, ControlTokens } from '@no-problem/design-tokens'

import { contrastMinimum, ensureContrast } from '../a11y/contrast.js'
import type { Appearance, ColorSource, Theme } from './types.js'

/** A product's own colours, either one set or one per appearance. */
export type BrandColors = Partial<ColorScheme> | ((appearance: Appearance) => Partial<ColorScheme>)

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
 * A container is its role's colour, quieter.
 *
 * Shipped as a literal, because a design system has to have one. But the literal is
 * made from *this package's* primary, and a product that supplies its own primary
 * and says nothing about the container then gets a selection pill, a chip and a
 * badge in a hue it does not use — visible on Android, where the tab bar's pill is
 * drawn from exactly this role.
 *
 * So a container the consumer did not name is rebuilt from the colour it belongs to.
 * One the consumer *did* name is left alone: they meant it.
 */
function containersFrom(colors: ColorScheme, named: ReadonlySet<string>): Partial<ColorScheme> {
  const quiet = (color: string) => `${color.slice(0, 7)}1F`
  const derived: Record<string, string> = {}

  for (const role of ['primary', 'secondary', 'error'] as const) {
    const container = `${role}Container`
    const onContainer = `on${container.charAt(0).toUpperCase()}${container.slice(1)}`
    if (!named.has(role)) continue
    if (!named.has(container)) derived[container] = quiet(colors[role])
    if (!named.has(onContainer)) derived[onContainer] = colors[role]
  }

  return derived as Partial<ColorScheme>
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
  /**
   * This product's own colours. Anything left out keeps the shipped value.
   *
   * A function when the product looks different in the dark — which it should,
   * since a palette that reads well on white rarely reads well on black. Passing
   * one set for both is the shape that quietly produces an unreadable dark mode.
   */
  brand?: BrandColors | undefined
}): Theme {
  const { appearance, colorSource = 'auto', dynamicColors, brand } = options

  const product = typeof brand === 'function' ? brand(appearance) : brand
  const platform = colorSource === 'brand' ? undefined : dynamicColors
  const supplied: ColorScheme = { ...brandColors(appearance), ...platform, ...product }

  // What was actually named, as opposed to what the shipped set already had.
  const named = new Set([...Object.keys(platform ?? {}), ...Object.keys(product ?? {})])
  const colors: ColorScheme = { ...supplied, ...containersFrom(supplied, named) }

  return {
    appearance,
    colors,
    control: controlFor(colors, control[appearance]),
    spacing,
    radius,
    iconSize,
  }
}

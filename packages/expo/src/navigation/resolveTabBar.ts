import type { ColorScheme } from '@no-problem/design-tokens'

/**
 * Only the colours are needed, so only the colours are asked for. A narrower
 * parameter is easier to satisfy from a test, and says plainly what is read.
 */
type Palette = { colors: ColorScheme }

/**
 * What the tab bar should be told, for one platform and one theme.
 *
 * A value rather than a component, for the same reason the material is: the
 * decision can then be checked without a device, and the component that takes it
 * has no branches left in it.
 */
export type ResolvedTabBar = {
  tintColor: string
  /**
   * Left undefined where the platform draws its own material. Painting a colour
   * over it is exactly how an app loses the material it was given.
   */
  backgroundColor: string | undefined
  /** Android's selection pill. Undefined where the platform has no such thing. */
  indicatorColor: string | undefined
  rippleColor: string | undefined
  /**
   * Whether every item keeps its label, or only the chosen one.
   *
   * Undefined where the platform does not ask.
   */
  labels: 'always' | 'selected' | undefined
}

/**
 * Decide how the tab bar should be dressed.
 *
 * The two platforms disagree about who owns the background, and that disagreement
 * is the whole of this function:
 *
 * - iOS draws a material behind the bar. Setting a background colour replaces it
 *   with a flat fill — the app opts out of the platform's own surface without
 *   ever meaning to. So: no colour, only a tint for the selected item.
 * - Android expects the app to supply the surface it sits on, and gives the
 *   selected item a pill and a ripple that both want colours.
 *
 * Everything supplied comes from the theme, so a product that changed its accent
 * changed its tab bar with it, and nothing here had to be told.
 */
export function resolveTabBar(theme: Palette, platform: 'ios' | 'android' | 'other'): ResolvedTabBar {
  if (platform === 'ios') {
    return {
      tintColor: theme.colors.primary,
      backgroundColor: undefined,
      indicatorColor: undefined,
      rippleColor: undefined,
      labels: undefined,
    }
  }

  if (platform === 'android') {
    return {
      tintColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      indicatorColor: theme.colors.primaryContainer,
      rippleColor: theme.colors.primaryContainer,
      // Material asks for labels on every destination. The platform's own default
      // drops them from all but the chosen one once there are four, which leaves a
      // reader decoding three glyphs to find out where they can go.
      labels: 'always',
    }
  }

  return {
    tintColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    indicatorColor: undefined,
    rippleColor: undefined,
    labels: undefined,
  }
}

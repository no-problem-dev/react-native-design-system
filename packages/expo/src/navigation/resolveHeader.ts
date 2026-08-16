import type { ColorScheme } from '@no-problem/design-tokens'

type Palette = { colors: ColorScheme }

/**
 * What the navigation header should be told, for one platform and one theme.
 *
 * Notice how little there is. The header already knows where to put the title,
 * how the back control should look and read, how it behaves when the title is
 * long, and what happens under a large text setting — all of it differs between
 * the platforms and all of it is already right. Supplying anything beyond
 * colours would be overriding a decision that was made correctly.
 */
export type ResolvedHeader = {
  /** Undefined where the platform draws a material behind the bar. */
  backgroundColor: string | undefined
  /** The back control and any action items. */
  tintColor: string
  titleColor: string
}

/**
 * Decide how the header should be dressed.
 *
 * The split is the same one the tab bar has, for the same reason: iOS draws its
 * own material and a background colour replaces it; Android expects the app to
 * supply the surface its top app bar sits on.
 */
export function resolveHeader(theme: Palette, platform: 'ios' | 'android' | 'other'): ResolvedHeader {
  if (platform === 'ios') {
    // Nothing but colours. The bar's own background is already the system
    // material — naming a blur, or floating the bar over the content, replaces a
    // correct default with one every screen then has to handle insets for.
    return {
      backgroundColor: undefined,
      tintColor: theme.colors.primary,
      titleColor: theme.colors.onSurface,
    }
  }

  return {
    backgroundColor: theme.colors.surface,
    tintColor: theme.colors.onSurface,
    titleColor: theme.colors.onSurface,
  }
}

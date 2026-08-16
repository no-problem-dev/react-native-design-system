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
  /**
   * iOS blurs whatever scrolls beneath the bar. Naming the system material —
   * rather than a colour — is what keeps the bar looking like part of the OS.
   */
  blurEffect: string | undefined
  /** The bar floats over the content, so the content can be seen through it. */
  transparent: boolean
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
    return {
      backgroundColor: undefined,
      tintColor: theme.colors.primary,
      titleColor: theme.colors.onSurface,
      blurEffect: 'systemChromeMaterial',
      transparent: true,
    }
  }

  return {
    backgroundColor: theme.colors.surface,
    tintColor: theme.colors.onSurface,
    titleColor: theme.colors.onSurface,
    blurEffect: undefined,
    transparent: false,
  }
}

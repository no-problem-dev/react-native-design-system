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
  /** What the reader has typed into the search field. */
  searchTextColor: string
  /** The placeholder, and the glyphs beside it. */
  searchHintColor: string
}

/**
 * Decide how the header should be dressed.
 *
 * The split is the same one the tab bar has, for the same reason: iOS draws its own
 * material and a background colour replaces it; Android expects the app to supply
 * the surface its top app bar sits on.
 *
 * A warning, because this looked wrong once and the wrong fix is the obvious one:
 * if the bar stays light while the page under it goes dark, the background is not
 * what is missing. The navigator's own theme is — its `dark` flag is what the
 * native stack turns into the bar's interface style, and an app that never supplies
 * one gets the light theme for the life of the process. Painting the bar hides that
 * and costs the material; `navigationTheme` is the fix.
 */
export function resolveHeader(theme: Palette, platform: 'ios' | 'android' | 'other'): ResolvedHeader {
  return {
    backgroundColor: platform === 'ios' ? undefined : theme.colors.surface,
    tintColor: platform === 'ios' ? theme.colors.primary : theme.colors.onSurface,
    titleColor: theme.colors.onSurface,
    // A search field inside the bar does not inherit the bar's colours. Left
    // alone it keeps the light appearance's ink, which on a dark bar is a
    // placeholder and a magnifier that are nearly invisible.
    searchTextColor: theme.colors.onSurface,
    searchHintColor: theme.colors.onSurfaceVariant,
  }
}

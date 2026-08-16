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
  backgroundColor: string
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
 * Both platforms are told the background. This was not the first answer: the bar
 * has a system material of its own, and letting it draw that seemed obviously
 * right. It is wrong here, and the way it is wrong is worth recording — a native
 * stack header left without a background keeps the *light* one in the dark
 * appearance, so the bar stays white while everything under it turns dark, and
 * the title, coloured for the theme, disappears into it.
 *
 * The blur is what is lost, and it is a real loss. Getting it back means floating
 * the bar over the content, which every screen then has to handle insets for — a
 * larger and more easily broken change than an opaque bar in the right colour.
 * The tab bar is untouched by this and keeps its material.
 *
 * What differs by platform is only which colour leads the controls: iOS tints its
 * bar buttons with the accent, Android draws them in the on-surface colour.
 */
export function resolveHeader(theme: Palette, platform: 'ios' | 'android' | 'other'): ResolvedHeader {
  return {
    backgroundColor: theme.colors.surface,
    tintColor: platform === 'ios' ? theme.colors.primary : theme.colors.onSurface,
    titleColor: theme.colors.onSurface,
    // A search field inside the bar does not inherit the bar's colours. Left
    // alone it keeps the light appearance's ink, which on a dark bar is a
    // placeholder and a magnifier that are nearly invisible.
    searchTextColor: theme.colors.onSurface,
    searchHintColor: theme.colors.onSurfaceVariant,
  }
}

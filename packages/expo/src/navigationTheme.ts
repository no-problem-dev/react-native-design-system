// Type-only, both of them: nothing is loaded at run time, so a function that only
// rearranges colours stays checkable in a plain test runner.
import type { ColorValue } from 'react-native'

/**
 * Only what this reads.
 *
 * Taking the whole theme would be simpler to write and worse to read: it would
 * suggest the navigator is given everything, when six colours and the appearance
 * are the entire contract.
 */
export type NavigationSource = {
  appearance: 'light' | 'dark'
  colors: {
    primary: string
    background: string
    surface: string
    onSurface: string
    outline: string
    error: string
  }
}

/**
 * The part of the navigator's theme this replaces.
 *
 * Named out in full rather than as an index of strings: these six are what the
 * navigator actually draws with, and a wider type would let a version that renames
 * one of them pass unnoticed.
 */
export type NavigationBaseTheme = {
  dark: boolean
  colors: {
    primary: ColorValue
    background: ColorValue
    card: ColorValue
    text: ColorValue
    border: ColorValue
    notification: ColorValue
  }
}

/**
 * The design system's colours, in the shape the navigator expects.
 *
 * The navigator keeps a theme of its own, and everything it draws for itself is
 * decided from that — not from anything the app renders. Two consequences are easy
 * to miss and both are severe:
 *
 * The `dark` flag is what the native stack turns into the navigation bar's
 * interface style. An app that never supplies a theme gets the light one, and the
 * bar is then pinned to the light appearance for the life of the process — white
 * behind a dark page, with a title coloured for the theme disappearing into it, and
 * a search field whose magnifier stays the dark glyph the light appearance uses.
 * None of that can be corrected by colouring the bar, because it is not the bar's
 * colours that are wrong; it is what the bar believes it is.
 *
 * The colours are what the navigator paints between screens and behind a
 * transition. Left at the default they are the light ones, which shows as a flash
 * of white during every push in the dark appearance.
 *
 * The base is passed in rather than imported. Reaching for the navigator's own
 * themes here would pull React Native into a function that only rearranges colours,
 * and a function that only rearranges colours should be checkable without it.
 * Everything the base carries beyond colours — fonts did exactly this — is kept, so
 * a version that adds to the theme keeps working.
 */
export function navigationTheme<T extends NavigationBaseTheme>(theme: NavigationSource, base: T) {
  return {
    ...base,
    dark: theme.appearance === 'dark',
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.error,
    },
  }
}

import type { ColorScheme } from '@no-problem/design-tokens'

/**
 * The subset of the platform palette this design system has a use for.
 *
 * Typed structurally rather than imported, so the pure mapping below stays
 * testable without the Android module being present.
 */
export type PlatformPalette = {
  primary: string
  onPrimary: string
  primaryContainer: string
  onPrimaryContainer: string
  secondary: string
  onSecondary: string
  secondaryContainer: string
  onSecondaryContainer: string
  tertiary: string
  onTertiary: string
  background: string
  onBackground: string
  surface: string
  onSurface: string
  surfaceVariant: string
  onSurfaceVariant: string
  surfaceContainer: string
  surfaceContainerHigh: string
  error: string
  onError: string
  errorContainer: string
  onErrorContainer: string
  outline: string
  outlineVariant: string
  scrim: string
}

/**
 * Fold a platform-supplied palette into this system's roles.
 *
 * Most roles line up, because both are built on the same set of names. Three do
 * not exist on the platform side at all — warning, success and info are product
 * ideas rather than platform ones — so they keep the values this package ships.
 * The result is a device that looks like itself, and a product that still says
 * "this went wrong" in the colour it always uses.
 */
export function fromPlatformPalette(palette: PlatformPalette, fallback: ColorScheme): ColorScheme {
  return {
    ...fallback,

    primary: palette.primary,
    onPrimary: palette.onPrimary,
    primaryContainer: palette.primaryContainer,
    onPrimaryContainer: palette.onPrimaryContainer,

    secondary: palette.secondary,
    onSecondary: palette.onSecondary,
    secondaryContainer: palette.secondaryContainer,
    onSecondaryContainer: palette.onSecondaryContainer,

    tertiary: palette.tertiary,
    onTertiary: palette.onTertiary,

    background: palette.background,
    onBackground: palette.onBackground,
    surface: palette.surface,
    onSurface: palette.onSurface,
    surfaceVariant: palette.surfaceVariant,
    onSurfaceVariant: palette.onSurfaceVariant,

    elevatedSurface: palette.surfaceContainer,
    elevatedSurfaceHigh: palette.surfaceContainerHigh,

    error: palette.error,
    onError: palette.onError,
    errorContainer: palette.errorContainer,
    onErrorContainer: palette.onErrorContainer,

    outline: palette.outline,
    outlineVariant: palette.outlineVariant,
    shadow: palette.scrim,
  }
}

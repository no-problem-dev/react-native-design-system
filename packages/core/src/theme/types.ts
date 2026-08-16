import type {
  ColorScheme,
  ControlTokens,
  IconSizeScale,
  RadiusScale,
  SpacingScale,
} from '@no-problem/design-tokens'

/** Light or dark. Kept separate from the colour values so a theme can be asked for either. */
export type Appearance = 'light' | 'dark'

/**
 * Everything a component may read.
 *
 * The scales come from the token package, so adding a token to the source and
 * forgetting to supply it here is a compile error rather than a runtime hole.
 */
export type Theme = {
  appearance: Appearance
  colors: ColorScheme
  /** Values only interactive controls use. See ControlTokens for why they exist. */
  control: ControlTokens
  spacing: SpacingScale
  radius: RadiusScale
  iconSize: IconSizeScale
}

/**
 * Where colours come from.
 *
 * - `brand`   — always the colours this package ships. The product looks the same everywhere.
 * - `dynamic` — colours the platform supplies (Android derives them from the wallpaper).
 *               The product looks like it belongs to the device.
 * - `auto`    — dynamic when the platform offers it, brand otherwise.
 *
 * This is a product decision, not a library one, so it is exposed rather than chosen here.
 */
export type ColorSource = 'brand' | 'dynamic' | 'auto'

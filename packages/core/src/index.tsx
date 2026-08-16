/**
 * A React Native design system.
 *
 * One component API; each platform gets the material it actually has. Nothing
 * here imports a platform effect — an adapter supplies those, and without one
 * every surface falls back to a plain fill that works anywhere.
 */

// Theme
export { ThemeProvider, useTheme } from './theme/ThemeProvider.js'
export type { ThemeProviderProps } from './theme/ThemeProvider.js'
export { brandColors, createTheme } from './theme/createTheme.js'
export type { Appearance, ColorSource, Theme } from './theme/types.js'
export type { BrandColors } from './theme/createTheme.js'

// Material
export { MaterialProvider, useMaterialAdapter } from './material/MaterialProvider.js'
export type { GlassSurfaceProps, MaterialAdapter } from './material/MaterialProvider.js'
export { fillStyle, shadowStyle } from './material/fillStyle.js'
export { resolveMaterial } from './material/resolve.js'
export { useMaterial, useMaterialStyle, useShadow } from './material/useMaterial.js'
export { elevationLevel, plainCapabilities } from './material/types.js'
export type { Elevation, MaterialCapabilities, ResolvedMaterial, ShadowSpec } from './material/types.js'

// Accessibility
export { contrastMinimum, contrastRatio, ensureContrast, luminance, meetsContrast } from './a11y/contrast.js'

// Components
export { SegmentedCore } from './components/Segmented/SegmentedCore.js'
export type { SegmentedCoreProps } from './components/Segmented/SegmentedCore.js'
export { resolveSegmented } from './components/Segmented/resolveSegmented.js'
export type { ResolvedSegmented, SegmentedOption } from './components/Segmented/resolveSegmented.js'
export { Surface } from './components/Surface/Surface.js'
export type { SurfaceProps } from './components/Surface/Surface.js'
export { SurfaceCore } from './components/Surface/SurfaceCore.js'
export type { SurfaceCoreProps } from './components/Surface/SurfaceCore.js'

export { Button } from './components/Button/Button.js'
export type { ButtonProps } from './components/Button/Button.js'
export { ButtonCore } from './components/Button/ButtonCore.js'
export type { ButtonCoreProps } from './components/Button/ButtonCore.js'
export { resolveButton } from './components/Button/resolveButton.js'
export type { ButtonSize, ButtonState, ButtonVariant, ResolvedButton } from './components/Button/resolveButton.js'

// Tokens, re-exported so a consumer needs one dependency rather than two.
export { control, iconSize, radius, scheme, spacing } from '@no-problem/design-tokens'
export type {
  ColorRole,
  ColorScheme,
  ControlTokens,
  IconSizeKey,
  RadiusKey,
  SpacingKey,
} from '@no-problem/design-tokens'

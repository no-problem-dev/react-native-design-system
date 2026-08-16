/**
 * Design tokens, in three layers.
 *
 *   primitive  raw values (a colour ramp, a spacing step)
 *   semantic   what a value means here (`spacing.lg`, `scheme.light.surface`)
 *   component  applied inside a component
 *
 * Only the semantic layer is exported. Primitives are generated — the build
 * needs them to resolve aliases — but they are deliberately not re-exported:
 * a rule that a layer "should not be used" is weaker than a layer that cannot
 * be reached.
 */
export { spacing, radius, iconSize, scheme, control } from './generated/tokens.js'

export type {
  ColorRole,
  ControlTokens,
  ColorScheme,
  ColorSchemeName,
  IconSizeKey,
  IconSizeScale,
  RadiusKey,
  RadiusScale,
  SpacingKey,
  SpacingScale,
} from './types.js'

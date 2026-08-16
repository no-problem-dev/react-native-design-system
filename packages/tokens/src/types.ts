/**
 * Types derived from the generated tokens.
 *
 * Nothing here is hand-written as a list of keys. If a token is added or removed,
 * these types change with it, and every theme that fails to supply the new value
 * stops compiling. A hand-written interface would let that omission through.
 */
import { iconSize, radius, scheme, spacing } from './generated/tokens.js'

export type SpacingKey = keyof typeof spacing
export type RadiusKey = keyof typeof radius
export type IconSizeKey = keyof typeof iconSize

/** Every spacing step a theme must supply. */
export type SpacingScale = Readonly<Record<SpacingKey, number>>
/** Every corner radius a theme must supply. */
export type RadiusScale = Readonly<Record<RadiusKey, number>>
/** Every icon size a theme must supply. */
export type IconSizeScale = Readonly<Record<IconSizeKey, number>>

/** The colour roles a theme must supply, named after their job rather than their hue. */
export type ColorRole = keyof (typeof scheme)['light']

/** A complete set of colours for one appearance. */
export type ColorScheme = Readonly<Record<ColorRole, string>>

export type ColorSchemeName = keyof typeof scheme

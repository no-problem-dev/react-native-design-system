import type { GlassSurfaceProps, MaterialCapabilities } from '@no-problem/design-system'
import type { ColorScheme } from '@no-problem/design-tokens'
import type { ComponentType } from 'react'

/**
 * What each platform has to answer.
 *
 * Three files implement this — `.ios`, `.android`, and a fallback for everywhere
 * else — and the bundler picks one. That is the whole of the platform split: a
 * handful of lines that *decide*, and no drawing at all. Anything longer than
 * this belongs in the shared core, where it can be seen in a browser.
 */
export type PlatformBindings = {
  /** Read once per render, from whatever the platform exposes. */
  useCapabilities: () => MaterialCapabilities
  /**
   * Colours the platform supplies, or `undefined` when it supplies none.
   * `null` is not used: absent and "the platform said nothing" are the same thing.
   */
  useDynamicColors: (appearance: 'light' | 'dark', fallback: ColorScheme) => ColorScheme | undefined
  /** Present only where a real glass material exists. */
  GlassSurface?: ComponentType<GlassSurfaceProps> | undefined
}

import type { GlassSurfaceProps, MaterialCapabilities, SegmentedCoreProps } from '@no-problem/design-system'
import type { ColorScheme } from '@no-problem/design-tokens'
import type { ComponentType } from 'react'

/**
 * The segmented control's props, with the value narrowed to what a native control
 * can carry. The public component keeps its own type parameter and widens once,
 * here, rather than making every platform file generic over something none of them
 * looks at.
 */
export type PlatformSegmentedProps = SegmentedCoreProps<string | number>

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
  /**
   * The platform's own segmented control, where it has one.
   *
   * Both platforms do, and they look nothing alike — a filled capsule inside a
   * track on one, an outlined row of buttons on the other. Rebuilding either by
   * hand produces something that resembles it on that platform and resembles
   * nothing on the other.
   */
  Segmented?: ComponentType<PlatformSegmentedProps> | undefined
}

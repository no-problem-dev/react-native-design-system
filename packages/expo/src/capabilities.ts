import type { MaterialCapabilities } from '@no-problem/design-system'

/**
 * What the platform told us, before it means anything.
 *
 * Kept as a separate shape so the reading and the decision can be tested apart:
 * the readings only exist on a device, the decision has to hold everywhere.
 */
export type PlatformReadings = {
  /** The platform can draw a glass material at all. */
  liquidGlassAvailable: boolean
  /** The richer interface is present too. Some releases ship the material without it. */
  glassEffectApiAvailable: boolean
  /** The reader asked for less transparency. */
  reduceTransparency: boolean
}

/**
 * Turn platform readings into capabilities.
 *
 * The interactive form needs both answers to be yes. Treating the material as
 * interactive on a release that only has the plain one is how an app ends up
 * calling into something that is not there.
 */
export function capabilitiesFrom(readings: PlatformReadings): MaterialCapabilities {
  return {
    glass: {
      available: readings.liquidGlassAvailable,
      interactive: readings.liquidGlassAvailable && readings.glassEffectApiAvailable,
    },
    reduceTransparency: readings.reduceTransparency,
  }
}

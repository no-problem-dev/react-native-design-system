import type { Theme } from '../theme/types.js'
import type { Elevation, MaterialCapabilities, ResolvedMaterial, ShadowSpec } from './types.js'
import { elevationLevel } from './types.js'

const shadowByLevel: Readonly<Record<number, ShadowSpec | undefined>> = {
  0: undefined,
  1: { color: '#000000', opacity: 0.08, radius: 3, offsetY: 1, androidElevation: 1 },
  3: { color: '#000000', opacity: 0.14, radius: 10, offsetY: 4, androidElevation: 6 },
  5: { color: '#000000', opacity: 0.2, radius: 20, offsetY: 8, androidElevation: 12 },
}

function fill(elevation: Elevation, theme: Theme): ResolvedMaterial {
  const level = elevationLevel[elevation]
  if (level === 0) {
    return { kind: 'fill', backgroundColor: theme.colors.surfaceVariant, borderColor: undefined, shadow: undefined }
  }
  return {
    kind: 'fill',
    backgroundColor: theme.colors.surface,
    borderColor: level === 1 ? theme.colors.outline : undefined,
    shadow: shadowByLevel[level],
  }
}

/**
 * Decide what a surface is made of.
 *
 * The steps go from richest to plainest, and each one only asks about a capability
 * the platform can actually answer. Checking the operating system version instead
 * would be wrong twice over: a version can ship without the interface, and a reader
 * can turn the effect off no matter what the device supports.
 *
 *   1. a flat surface never needs a material — it is part of the page
 *   2. the reader asked for less transparency → an opaque fill wins, always
 *   3. the platform offers glass → glass, interactive only if it said so
 *   4. otherwise → a fill, with the shadow that matches the intent
 *
 * Pure on purpose: every branch is reachable from a test without a device.
 */
export function resolveMaterial(
  elevation: Elevation,
  theme: Theme,
  capabilities: MaterialCapabilities,
): ResolvedMaterial {
  if (elevation === 'flat') return fill(elevation, theme)
  if (capabilities.reduceTransparency) return fill(elevation, theme)

  if (capabilities.glass.available) {
    return {
      kind: 'glass',
      interactive: capabilities.glass.interactive,
      tintColor: undefined,
      borderColor: theme.colors.outline,
    }
  }

  return fill(elevation, theme)
}

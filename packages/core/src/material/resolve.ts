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
 * Only `overlay` sits *over* other content. Everything below it is part of the
 * page, and that distinction decides whether a glass material can work at all —
 * see `resolveMaterial`.
 */
function overlaysContent(elevation: Elevation): boolean {
  return elevation === 'overlay'
}

/**
 * Decide what a surface is made of.
 *
 * The steps go from richest to plainest, and each one only asks about something
 * that can actually be answered here. Checking the operating system version would
 * be wrong twice over: a version can ship without the interface, and a reader can
 * turn the effect off no matter what the device supports.
 *
 *   1. the surface is part of the page → a fill, with the shadow that matches
 *   2. the reader asked for less transparency → an opaque fill wins, always
 *   3. the platform offers glass → glass, interactive only if it said so
 *   4. otherwise → a fill
 *
 * Step 1 is not about capability, and was learned from a device rather than
 * reasoned out. A glass material works by refracting what sits behind it; over a
 * plain page there is nothing to refract, so a glass panel comes out the same tone
 * as the page and the sense of height disappears entirely. Reserving it for
 * surfaces that overlay content is what the material is for, and it is why
 * `elevation` names an intent — the vocabulary already knew which surfaces float.
 *
 * Glass keeps a border regardless, so a panel is never invisible even where the
 * content behind it happens to be flat.
 *
 * Pure on purpose: every branch is reachable from a test without a device.
 */
export function resolveMaterial(
  elevation: Elevation,
  theme: Theme,
  capabilities: MaterialCapabilities,
): ResolvedMaterial {
  if (!overlaysContent(elevation)) return fill(elevation, theme)
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

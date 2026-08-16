import type { MaterialCapabilities } from '@no-problem/design-system'

import { capabilitiesFrom } from './capabilities.js'
import type { PlatformBindings } from './platform.types.js'

/**
 * Everywhere that is neither iOS nor Android — the web catalog, and any surface
 * a bundler reaches that has no platform build. Nothing is offered, so every
 * surface falls back to a fill and the page still renders.
 */
const nothingOffered: MaterialCapabilities = capabilitiesFrom({
  liquidGlassAvailable: false,
  glassEffectApiAvailable: false,
  reduceTransparency: false,
})

export const bindings: PlatformBindings = {
  useCapabilities: () => nothingOffered,
  useDynamicColors: () => undefined,
}

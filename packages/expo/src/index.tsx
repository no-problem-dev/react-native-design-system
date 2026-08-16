/**
 * The Expo adapter.
 *
 * Reports what the platform offers and renders its real materials. The design
 * system itself imports none of this — install the adapter and surfaces become
 * glass where glass exists; leave it out and they stay fills that work anywhere.
 */
export { DesignSystemProvider } from './DesignSystemProvider.js'
export type { DesignSystemProviderProps } from './DesignSystemProvider.js'

export { capabilitiesFrom } from './capabilities.js'
export type { PlatformReadings } from './capabilities.js'

export { fromPlatformPalette } from './materialColorScheme.js'
export type { PlatformPalette } from './materialColorScheme.js'

export type { PlatformBindings } from './platform.types.js'

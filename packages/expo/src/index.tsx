/**
 * The Expo adapter.
 *
 * Reports what the platform offers and renders its real materials. The design
 * system itself imports none of this — install the adapter and surfaces become
 * glass where glass exists; leave it out and they stay fills that work anywhere.
 */
export { useWindowBackground } from './windowBackground'
export { DesignSystemProvider } from './DesignSystemProvider.js'
export type { DesignSystemProviderProps } from './DesignSystemProvider.js'

export { capabilitiesFrom } from './capabilities.js'
export type { PlatformReadings } from './capabilities.js'

export { fromPlatformPalette } from './materialColorScheme.js'
export type { PlatformPalette } from './materialColorScheme.js'

export type { PlatformBindings } from './platform.types.js'

// Navigation chrome. The platform owns the material; this owns the translation
// from what a product means to what each platform calls it.
export { NavigationTabs } from './navigation/NavigationTabs.js'
export type { NavigationTabsProps, TabDefinition } from './navigation/NavigationTabs.js'
export { glyphsFor, icons } from './navigation/icons.js'
export type { IconGlyphs, IconName } from './navigation/icons.js'
export { resolveTabBar } from './navigation/resolveTabBar.js'
export type { ResolvedTabBar } from './navigation/resolveTabBar.js'
export { resolveHeader } from './navigation/resolveHeader.js'
export type { ResolvedHeader } from './navigation/resolveHeader.js'
export { useHeaderOptions } from './navigation/useHeaderOptions.js'
export type { HeaderOptions } from './navigation/useHeaderOptions.js'

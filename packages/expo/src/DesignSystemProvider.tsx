import type { Appearance, ColorSource, MaterialAdapter } from '@no-problem/design-system'
import { MaterialProvider, ThemeProvider, brandColors } from '@no-problem/design-system'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useColorScheme } from 'react-native'

// Deliberately without a file extension. This is the one import in the repository
// that must resolve to a different file per platform, and the bundler only offers
// `platform.ios` / `platform.android` / `platform` as candidates when it is asked
// for a module rather than for a named file.
// eslint-disable-next-line import/extensions
import { bindings } from './platform'

export type DesignSystemProviderProps = {
  children: ReactNode
  /** Omit to follow the device. */
  appearance?: Appearance | undefined
  colorSource?: ColorSource | undefined
}

/**
 * One provider for an Expo app: the theme, and whatever the platform turned out
 * to offer.
 *
 * Everything platform-specific was decided in `platform.*` before reaching here,
 * which is why this file has no branches in it.
 */
export function DesignSystemProvider({
  children,
  appearance,
  colorSource = 'auto',
}: DesignSystemProviderProps) {
  const device = useColorScheme()
  const resolved: Appearance = appearance ?? (device === 'dark' ? 'dark' : 'light')

  const capabilities = bindings.useCapabilities()
  const fallback = brandColors(resolved)
  const dynamicColors = bindings.useDynamicColors(resolved, fallback)

  const adapter = useMemo<MaterialAdapter>(
    () => ({ capabilities, GlassSurface: bindings.GlassSurface }),
    [capabilities],
  )

  return (
    <ThemeProvider
      appearance={resolved}
      colorSource={colorSource}
      {...(colorSource === 'brand' ? null : { dynamicColors })}
    >
      <MaterialProvider adapter={adapter}>{children}</MaterialProvider>
    </ThemeProvider>
  )
}

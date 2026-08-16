import type { ColorScheme } from '@no-problem/design-tokens'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { useColorScheme } from 'react-native'

import { createTheme } from './createTheme.js'
import type { Appearance, ColorSource, Theme } from './types.js'

const ThemeContext = createContext<Theme | null>(null)

export type ThemeProviderProps = {
  children: ReactNode
  /** Omit to follow the device. */
  appearance?: Appearance | undefined
  colorSource?: ColorSource | undefined
  /**
   * Colours supplied by the platform. Provided by the platform adapter package;
   * leave undefined and the theme falls back to the colours shipped here.
   */
  dynamicColors?: ColorScheme | undefined
}

export function ThemeProvider({
  children,
  appearance,
  colorSource = 'auto',
  dynamicColors,
}: ThemeProviderProps) {
  const deviceAppearance = useColorScheme()
  const resolvedAppearance: Appearance = appearance ?? (deviceAppearance === 'dark' ? 'dark' : 'light')

  const theme = useMemo(
    () => createTheme({ appearance: resolvedAppearance, colorSource, dynamicColors }),
    [resolvedAppearance, colorSource, dynamicColors],
  )

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

/**
 * Read the current theme.
 *
 * Throws when no provider is above it. A component silently rendering with
 * default colours is harder to notice than a crash during development.
 */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext)
  if (theme === null) {
    throw new Error('useTheme was called outside of a ThemeProvider. Wrap the app in <ThemeProvider>.')
  }
  return theme
}

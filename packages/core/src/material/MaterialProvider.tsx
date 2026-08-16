import type { ComponentType, ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import type { MaterialCapabilities } from './types.js'
import { plainCapabilities } from './types.js'

export type GlassSurfaceProps = {
  style?: StyleProp<ViewStyle>
  tintColor?: string | undefined
  interactive?: boolean | undefined
  children?: ReactNode
}

/**
 * The pieces a platform adapter supplies.
 *
 * This package never imports a platform effect directly. An adapter passes one in,
 * and without an adapter every surface falls back to a plain fill. That is what
 * lets the package install into a project that has none of those libraries.
 */
export type MaterialAdapter = {
  capabilities: MaterialCapabilities
  GlassSurface?: ComponentType<GlassSurfaceProps> | undefined
}

const plainAdapter: MaterialAdapter = { capabilities: plainCapabilities }

const MaterialContext = createContext<MaterialAdapter>(plainAdapter)

export function MaterialProvider({
  children,
  adapter,
}: {
  children: ReactNode
  adapter: MaterialAdapter
}) {
  const value = useMemo(() => adapter, [adapter])
  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>
}

export function useMaterialAdapter(): MaterialAdapter {
  return useContext(MaterialContext)
}

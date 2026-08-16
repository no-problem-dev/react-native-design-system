import type { RadiusKey, SpacingKey } from '@no-problem/design-tokens'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import { useMaterialAdapter } from '../../material/MaterialProvider.js'
import { resolveMaterial } from '../../material/resolve.js'
import type { Elevation } from '../../material/types.js'
import { useTheme } from '../../theme/ThemeProvider.js'
import { SurfaceCore } from './SurfaceCore.js'

export type SurfaceProps = {
  /** How far above the page this sits. Not how it is drawn. */
  elevation?: Elevation | undefined
  radius?: RadiusKey | undefined
  padding?: SpacingKey | undefined
  style?: StyleProp<ViewStyle> | undefined
  children?: ReactNode
}

/**
 * A panel that adopts whatever material the platform offers for the height it is at.
 *
 * On a device that draws a glass material, it is glass. Where the reader asked for
 * less transparency, or the platform has nothing to offer, it is a fill with the
 * shadow that reads as the same height. Callers see none of that.
 */
export function Surface({ elevation = 'raised', radius, padding, style, children }: SurfaceProps) {
  const theme = useTheme()
  const adapter = useMaterialAdapter()
  const material = resolveMaterial(elevation, theme, adapter.capabilities)

  return (
    <SurfaceCore
      material={material}
      radius={radius}
      padding={padding}
      style={style}
      GlassSurface={adapter.GlassSurface}
    >
      {children}
    </SurfaceCore>
  )
}

import type { RadiusKey, SpacingKey } from '@no-problem/design-tokens'
import { radius as radiusScale, spacing as spacingScale } from '@no-problem/design-tokens'
import type { ComponentType, ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'

import type { GlassSurfaceProps } from '../../material/MaterialProvider.js'
import type { ResolvedMaterial } from '../../material/types.js'

export type SurfaceCoreProps = {
  /** Already decided. This component never asks which platform it is on. */
  material: ResolvedMaterial
  radius?: RadiusKey | undefined
  padding?: SpacingKey | undefined
  style?: StyleProp<ViewStyle> | undefined
  children?: ReactNode
  /** Supplied by the platform adapter when the resolved material needs one. */
  GlassSurface?: ComponentType<GlassSurfaceProps> | undefined
}

function fillStyle(material: Extract<ResolvedMaterial, { kind: 'fill' }>): ViewStyle {
  const { shadow } = material
  return {
    backgroundColor: material.backgroundColor,
    ...(material.borderColor === undefined
      ? null
      : { borderWidth: StyleSheet.hairlineWidth, borderColor: material.borderColor }),
    ...(shadow === undefined
      ? null
      : {
          shadowColor: shadow.color,
          shadowOpacity: shadow.opacity,
          shadowRadius: shadow.radius,
          shadowOffset: { width: 0, height: shadow.offsetY },
          elevation: shadow.androidElevation,
        }),
  }
}

/**
 * Everything a surface looks like, and nothing about where it is running.
 *
 * Because the material arrives as a value, both platforms' outcomes can be
 * rendered side by side in one browser window — which is what keeps the
 * device-only part of the test suite small.
 */
export function SurfaceCore({
  material,
  radius = 'md',
  padding,
  style,
  children,
  GlassSurface,
}: SurfaceCoreProps) {
  const shape: ViewStyle = {
    borderRadius: radiusScale[radius],
    overflow: 'hidden',
    ...(padding === undefined ? null : { padding: spacingScale[padding] }),
  }

  if (material.kind === 'glass' && GlassSurface !== undefined) {
    return (
      <GlassSurface
        style={[shape, { borderWidth: StyleSheet.hairlineWidth, borderColor: material.borderColor }, style]}
        tintColor={material.tintColor}
        interactive={material.interactive}
      >
        {children}
      </GlassSurface>
    )
  }

  // A glass material with no renderer should not happen — the adapter that reports
  // the capability also supplies the renderer — but a missing panel is worse than
  // a plain one, so fall through to a border-only surface.
  if (material.kind === 'glass') {
    return (
      <View
        style={[shape, { borderWidth: StyleSheet.hairlineWidth, borderColor: material.borderColor }, style]}
      >
        {children}
      </View>
    )
  }

  return <View style={[shape, fillStyle(material), style]}>{children}</View>
}

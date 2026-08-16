import type { ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'

import type { ResolvedMaterial, ShadowSpec } from './types.js'

/**
 * The shadow alone.
 *
 * For a surface that already knows what colour it is — a button carrying its
 * variant's fill — but still has to read as being at a height.
 */
export function shadowStyle(shadow: ShadowSpec | undefined): ViewStyle | null {
  if (shadow === undefined) return null
  return {
    shadowColor: shadow.color,
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    shadowOffset: { width: 0, height: shadow.offsetY },
    elevation: shadow.androidElevation,
  }
}

/**
 * A fill, as React Native styles it.
 *
 * Kept apart from the components so that a surface which owns its own element —
 * a `Pressable`, a scroll view — is drawn by the same code as one that does not.
 * Two copies of this would drift the moment one of them gained a border.
 */
export function fillStyle(material: Extract<ResolvedMaterial, { kind: 'fill' }>): ViewStyle {
  const { shadow } = material
  return {
    backgroundColor: material.backgroundColor,
    ...(material.borderColor === undefined
      ? null
      : { borderWidth: StyleSheet.hairlineWidth, borderColor: material.borderColor }),
    ...shadowStyle(shadow),
  }
}

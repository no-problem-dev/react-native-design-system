import type { Theme } from '../../theme/types.js'

/** One choice. The value is whatever the caller wants back. */
export type SegmentedOption<T> = {
  value: T
  label: string
  /**
   * Present but not choosable.
   *
   * Removing it instead would be worse: the row would change width as data
   * arrives, and the reader would have no way to tell that a range exists at all
   * but has nothing behind it yet.
   */
  disabled?: boolean | undefined
}

export type ResolvedSegment = {
  backgroundColor: string
  labelColor: string
}

export type ResolvedSegmented = {
  /** The track the segments sit in. */
  trackColor: string
  selected: ResolvedSegment
  unselected: ResolvedSegment
  borderRadius: number
  /** What a platform control should be tinted with, where it takes one colour. */
  tintColor: string
}

/**
 * How a segmented control should look, for one theme.
 *
 * Both platforms draw this control themselves and draw it differently — a filled
 * capsule on one, an outlined row on the other. What is decided here is only what
 * neither of them can know: which of the product's colours the control is made of.
 *
 * The selected segment takes the surface colour rather than the accent. A segmented
 * control chooses between views of the same thing, not between actions, and an
 * accent-filled segment reads as the more important choice — which is a claim the
 * control is not in a position to make.
 */
export function resolveSegmented(theme: Theme): ResolvedSegmented {
  const { colors, radius } = theme

  return {
    trackColor: colors.surfaceVariant,
    selected: { backgroundColor: colors.surface, labelColor: colors.onSurface },
    unselected: { backgroundColor: 'transparent', labelColor: colors.onSurfaceVariant },
    borderRadius: radius.full,
    tintColor: colors.primary,
  }
}

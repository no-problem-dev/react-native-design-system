import type { SegmentedCoreProps, SegmentedOption } from '@no-problem/design-system'
import { SegmentedCore } from '@no-problem/design-system'

import { bindings } from '../platform'

/**
 * Choose between views of the same thing.
 *
 * Each platform lends its own control, and they do not resemble each other: a
 * capsule sliding inside a track on one, a row of outlined buttons on the other.
 * That difference is the reason to use them — a reader recognises the control they
 * already know, along with its size, its animation, and what a screen reader calls
 * it. Where no such control is offered, the design system draws one from the same
 * tokens, so a story in a browser and a device show the same choices.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ...rest
}: SegmentedCoreProps<T>) {
  const Platform = bindings.Segmented
  if (Platform === undefined) {
    return <SegmentedCore options={options} value={value} onChange={onChange} {...rest} />
  }

  // The platform files are not generic. Widening happens here, in one place, and
  // the value narrows again on the way back — it can only be one the caller gave.
  return (
    <Platform
      options={options as readonly SegmentedOption<string | number>[]}
      value={value}
      onChange={(chosen) => onChange(chosen as T)}
      {...rest}
    />
  )
}

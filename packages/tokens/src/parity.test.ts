/**
 * Parity with the SwiftUI design system.
 *
 * The two packages are separate implementations of one design language. If a
 * value drifts on either side, an app that ships both platforms stops looking
 * like one product — and the drift is invisible until someone puts two
 * screenshots next to each other.
 *
 * `reference/upstream-scales.json` records what the Swift side publishes.
 * Changing a token here means changing that file in the same commit, on purpose.
 */
import { describe, expect, it } from 'vitest'

import reference from '../reference/upstream-scales.json' with { type: 'json' }
import { iconSize, radius, scheme, spacing } from './generated/tokens.js'

const lower = (o: Record<string, string>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.toLowerCase()]))

describe('parity with the SwiftUI implementation', () => {
  it('spacing scale matches', () => {
    expect(spacing).toEqual(reference.spacing)
  })

  it('radius scale matches', () => {
    expect(radius).toEqual(reference.radius)
  })

  it('icon size scale matches', () => {
    expect(iconSize).toEqual(reference.iconSize)
  })

  it('light colour roles match', () => {
    expect(lower(scheme.light)).toEqual(reference.scheme.light)
  })

  it('dark colour roles match', () => {
    expect(lower(scheme.dark)).toEqual(reference.scheme.dark)
  })

  it('both appearances define the same roles', () => {
    expect(Object.keys(scheme.dark).sort()).toEqual(Object.keys(scheme.light).sort())
  })
})

describe('token hygiene', () => {
  it('every colour is a hex value, with or without an alpha channel', () => {
    for (const appearance of Object.values(scheme)) {
      for (const [role, value] of Object.entries(appearance)) {
        expect(value, role).toMatch(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)
      }
    }
  })

  it('spacing steps increase', () => {
    const values = Object.values(spacing)
    expect([...values].sort((a, b) => a - b)).toEqual(values)
  })

  it('radius steps increase', () => {
    const values = Object.values(radius)
    expect([...values].sort((a, b) => a - b)).toEqual(values)
  })
})

import { describe, expect, it } from 'vitest'

import { createTheme } from '../../../theme/createTheme.js'
import type { ButtonSize, ButtonVariant } from '../resolveButton.js'
import { resolveButton } from '../resolveButton.js'

const light = createTheme({ appearance: 'light', colorSource: 'brand' })
const dark = createTheme({ appearance: 'dark', colorSource: 'brand' })

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger']
const sizes: ButtonSize[] = ['small', 'medium', 'large']
const rest = { pressed: false, disabled: false }

describe('button colours', () => {
  it('pairs every fill with the role meant to sit on it', () => {
    expect(resolveButton('primary', 'medium', rest, light)).toMatchObject({
      backgroundColor: light.control.primaryFill,
      labelColor: light.control.primaryLabel,
    })
    expect(resolveButton('danger', 'medium', rest, light)).toMatchObject({
      backgroundColor: light.control.dangerFill,
      labelColor: light.control.dangerLabel,
    })
  })

  it('draws a ghost button with an outline instead of a fill', () => {
    const ghost = resolveButton('ghost', 'medium', rest, light)
    expect(ghost.backgroundColor).toBe('transparent')
    expect(ghost.borderColor).toBe(light.colors.outline)
    expect(ghost.labelColor).toBe(light.control.ghostLabel)
  })

  it('takes every colour from the theme it was given, never from a literal', () => {
    const palette = (theme: typeof light) =>
      new Set<string>([...Object.values(theme.colors), ...Object.values(theme.control), 'transparent'])

    for (const variant of variants) {
      for (const theme of [light, dark]) {
        const button = resolveButton(variant, 'medium', rest, theme)
        for (const colour of [button.backgroundColor, button.labelColor]) {
          expect(palette(theme).has(colour), `${theme.appearance} / ${variant}: ${colour}`).toBe(true)
        }
      }
    }
  })
})

describe('button metrics', () => {
  it('keeps medium and large above the 44pt touch target', () => {
    for (const size of ['medium', 'large'] as const) {
      expect(resolveButton('primary', size, rest, light).minHeight).toBeGreaterThanOrEqual(44)
    }
  })

  it('grows with the size', () => {
    const heights = sizes.map((size) => resolveButton('primary', size, rest, light).minHeight)
    expect([...heights].sort((a, b) => a - b)).toEqual(heights)
  })
})

describe('button states', () => {
  it('dims while pressed and dims further when disabled', () => {
    const base = resolveButton('primary', 'medium', rest, light).opacity
    const pressed = resolveButton('primary', 'medium', { pressed: true, disabled: false }, light).opacity
    const disabled = resolveButton('primary', 'medium', { pressed: false, disabled: true }, light).opacity
    expect(base).toBeGreaterThan(pressed)
    expect(pressed).toBeGreaterThan(disabled)
  })

  it('reads as disabled even while it is being pressed', () => {
    const both = resolveButton('primary', 'medium', { pressed: true, disabled: true }, light)
    const disabled = resolveButton('primary', 'medium', { pressed: false, disabled: true }, light)
    expect(both.opacity).toBe(disabled.opacity)
  })

  it('covers every variant and size without throwing', () => {
    for (const variant of variants) {
      for (const size of sizes) {
        expect(() => resolveButton(variant, size, rest, light)).not.toThrow()
      }
    }
  })
})

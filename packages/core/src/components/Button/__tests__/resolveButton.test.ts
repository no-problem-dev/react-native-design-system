import { describe, expect, it } from 'vitest'

import { contrastRatio } from '../../../a11y/contrast.js'
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
  it('dims while pressed', () => {
    const base = resolveButton('primary', 'medium', rest, light).opacity
    const pressed = resolveButton('primary', 'medium', { pressed: true, disabled: false }, light).opacity
    expect(base).toBeGreaterThan(pressed)
  })

  it('does not look pressed while it is disabled', () => {
    // A button that cannot be pressed must not report being pressed, whatever the
    // platform hands the component.
    const both = resolveButton('primary', 'medium', { pressed: true, disabled: true }, light)
    const disabled = resolveButton('primary', 'medium', { pressed: false, disabled: true }, light)
    expect(both).toEqual(disabled)
  })

  it('covers every variant and size without throwing', () => {
    for (const variant of variants) {
      for (const size of sizes) {
        expect(() => resolveButton(variant, size, rest, light)).not.toThrow()
      }
    }
  })
})

describe('the shape a product asks for', () => {
  it('is a capsule when nothing is asked, which is what both platforms draw', () => {
    expect(resolveButton('primary', 'medium', rest, light).borderRadius).toBe(light.radius.full)
  })

  it('takes the step it was given, from the theme rather than from a number', () => {
    // A product that hardcoded the value here would stop following its own scale
    // the moment that scale moved.
    expect(resolveButton('primary', 'medium', rest, light, 'md').borderRadius).toBe(light.radius.md)
  })

  it('does not let the shape change what the label sits on', () => {
    const round = resolveButton('danger', 'large', rest, dark, 'full')
    const square = resolveButton('danger', 'large', rest, dark, 'none')
    expect(square.backgroundColor).toBe(round.backgroundColor)
    expect(square.labelColor).toBe(round.labelColor)
  })
})

describe('a button that cannot be pressed', () => {
  const off = { pressed: false, disabled: true }

  it('steps down to a neutral pair rather than fading the brand colour', () => {
    // A faded brand colour reads as "loading" — it keeps promising the action is
    // about to happen.
    for (const theme of [light, dark]) {
      const disabled = resolveButton('primary', 'medium', off, theme)
      expect(disabled.backgroundColor).toBe(theme.colors.surfaceVariant)
      expect(disabled.backgroundColor).not.toBe(theme.control.primaryFill)
    }
  })

  it('stays readable, because which control is unavailable is the point', () => {
    for (const theme of [light, dark]) {
      for (const variant of variants) {
        const disabled = resolveButton(variant, 'medium', off, theme)
        const behind = disabled.backgroundColor === 'transparent'
          ? theme.colors.surface
          : disabled.backgroundColor
        expect({ variant, ok: contrastRatio(disabled.labelColor, behind) >= 4.5 }).toEqual({
          variant,
          ok: true,
        })
      }
    }
  })

  it('is not additionally dimmed — the colours already carry it', () => {
    expect(resolveButton('primary', 'medium', off, light).opacity).toBe(1)
  })
})

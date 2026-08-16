/**
 * Contrast is checked here, in milliseconds, as well as by the accessibility rules
 * that run over the catalog in a browser. The browser is the honest check; this one
 * is the fast one, and it names the exact pair that broke rather than the element.
 */
import { describe, expect, it } from 'vitest'

import type { ButtonSize, ButtonVariant } from '../../components/Button/resolveButton.js'
import { resolveButton } from '../../components/Button/resolveButton.js'
import { createTheme } from '../../theme/createTheme.js'
import type { Appearance } from '../../theme/types.js'
import { contrastMinimum, contrastRatio } from '../contrast.js'

const appearances: Appearance[] = ['light', 'dark']
const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger']
const sizes: ButtonSize[] = ['small', 'medium', 'large']
const rest = { pressed: false, disabled: false }

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for a colour on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#3b82f6', '#3b82f6')).toBeCloseTo(1, 5)
  })

  it('ignores an alpha channel rather than refusing the colour', () => {
    expect(contrastRatio('#d1d5db80', '#ffffff')).toBeCloseTo(contrastRatio('#d1d5db', '#ffffff'), 5)
  })
})

describe('every button label is readable on its own fill', () => {
  for (const appearance of appearances) {
    const theme = createTheme({ appearance, colorSource: 'brand' })

    for (const variant of variants) {
      for (const size of sizes) {
        it(`${appearance} / ${variant} / ${size}`, () => {
          const button = resolveButton(variant, size, rest, theme)
          const behind = button.backgroundColor === 'transparent' ? theme.colors.background : button.backgroundColor
          const ratio = contrastRatio(button.labelColor, behind)

          // 18pt is 24px; nothing in the scale reaches it, so every label is
          // measured against the stricter of the two thresholds.
          expect(button.fontSize).toBeLessThan(24)
          expect(ratio, `${button.labelColor} on ${behind}`).toBeGreaterThanOrEqual(contrastMinimum.normalText)
        })
      }
    }
  }
})

describe('surface text is readable', () => {
  for (const appearance of appearances) {
    const theme = createTheme({ appearance, colorSource: 'brand' })

    it(`${appearance}: the on-roles clear the threshold for their own surfaces`, () => {
      const pairs: [string, string][] = [
        [theme.colors.onSurface, theme.colors.surface],
        [theme.colors.onBackground, theme.colors.background],
        [theme.colors.onSurfaceVariant, theme.colors.surfaceVariant],
      ]
      for (const [foreground, background] of pairs) {
        expect(
          contrastRatio(foreground, background),
          `${foreground} on ${background}`,
        ).toBeGreaterThanOrEqual(contrastMinimum.normalText)
      }
    })

    it(`${appearance}: the outline is visible against the surface it borders`, () => {
      expect(contrastRatio(theme.colors.outline, theme.colors.surface)).toBeGreaterThanOrEqual(1.3)
    })
  }
})

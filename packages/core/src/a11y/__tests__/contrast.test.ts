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
import { contrastMinimum, contrastRatio, ensureContrast, luminance } from '../contrast.js'

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

describe('making a supplied colour readable', () => {
  it('leaves a colour alone when it already passes', () => {
    expect(ensureContrast('#1d4ed8', '#ffffff')).toBe('#1d4ed8')
  })

  it('moves a colour that does not pass until it does', () => {
    // A brand blue that measures 3.91:1 against white — recognisable, not readable.
    const fixed = ensureContrast('#2f6bff', '#ffffff')
    expect(fixed).not.toBe('#2f6bff')
    expect(contrastRatio(fixed, '#ffffff')).toBeGreaterThanOrEqual(contrastMinimum.normalText)
  })

  it('moves away from the text: darker under light text, lighter under dark text', () => {
    // The same colour, failing in both directions, so the direction is what is tested
    // rather than which threshold happened to be met already.
    expect(luminance(ensureContrast('#e5484d', '#ffffff'))).toBeLessThan(luminance('#e5484d'))
    expect(luminance(ensureContrast('#1d4ed8', '#111827'))).toBeGreaterThan(luminance('#1d4ed8'))
  })

  it('stops as soon as the threshold is met, rather than going to the extreme', () => {
    const fixed = ensureContrast('#2f6bff', '#ffffff')
    expect(fixed).not.toBe('#000000')
    expect(contrastRatio(fixed, '#ffffff')).toBeLessThan(9)
  })

  it('always reaches the threshold, whatever it is given', () => {
    for (const colour of ['#808080', '#2f6bff', '#e5484d', '#ffff00', '#00ff00']) {
      for (const against of ['#ffffff', '#111827']) {
        expect(
          contrastRatio(ensureContrast(colour, against), against),
          `${colour} on ${against}`,
        ).toBeGreaterThanOrEqual(contrastMinimum.normalText)
      }
    }
  })
})

describe('a product supplying its own colours', () => {
  // The palette a real product handed over. Its blue misses 4.5:1 against white by
  // a hair, its red misses it outright, and nobody had noticed either.
  const brand = { primary: '#2f6bff', error: '#e5484d', background: '#f4f6f8', surface: '#ffffff' }

  it('keeps every control readable, without the product having to know', () => {
    for (const appearance of appearances) {
      const theme = createTheme({ appearance, colorSource: 'brand', brand })

      for (const variant of variants) {
        const button = resolveButton(variant, 'medium', rest, theme)
        const behind = button.backgroundColor === 'transparent' ? theme.colors.background : button.backgroundColor
        expect(
          contrastRatio(button.labelColor, behind),
          `${appearance} / ${variant}`,
        ).toBeGreaterThanOrEqual(contrastMinimum.normalText)
      }
    }
  })

  it('still uses the colours it was given everywhere they are safe', () => {
    const theme = createTheme({ appearance: 'light', colorSource: 'brand', brand })
    expect(theme.colors.primary).toBe(brand.primary)
    expect(theme.colors.surface).toBe(brand.surface)
  })

  it('keeps what it was not told about', () => {
    const theme = createTheme({ appearance: 'light', colorSource: 'brand', brand })
    const shipped = createTheme({ appearance: 'light', colorSource: 'brand' })
    expect(theme.colors.success).toBe(shipped.colors.success)
  })
})

describe('the shapes a colour is written in', () => {
  it('reads the short forms, which React Native accepts too', () => {
    expect(luminance('#fff')).toBeCloseTo(luminance('#ffffff'), 10)
    expect(luminance('#000f')).toBeCloseTo(luminance('#000000'), 10)
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 1)
  })

  it('still refuses something that is not a colour', () => {
    expect(() => luminance('rebeccapurple')).toThrow(/Not a hex colour/)
    expect(() => luminance('#12345')).toThrow(/Not a hex colour/)
  })
})

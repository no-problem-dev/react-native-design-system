/**
 * What a product's own values turn into.
 *
 * The generator is the seam between "a product decides its values" and "a toolchain
 * reads them", so what is pinned here is the shape each consumer receives — not the
 * values, which belong to whichever product is being built.
 */
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { rgbChannels, kebab, tailwindArtifacts, typeScriptModule } = require('./brand-artifacts.cjs')

const radiusScale = { sm: 4, md: 12, lg: 20 }

const brand = {
  fonts: { body: 'Body-Regular', bodyBold: 'Body-Bold' },
  radiusRoles: { chip: 'sm', card: 'md' },
  scheme: {
    light: { surface: '#FFFFFF', onSurface: '#111111' },
    dark: { surface: '#101010', onSurface: '#EEEEEE' },
  },
  product: {
    light: { veil: 'rgba(0,0,0,0.1)' },
    dark: { veil: 'rgba(255,255,255,0.1)' },
  },
}

describe('a colour becomes the form its consumer can use', () => {
  it('a plain hex becomes three channels, so an alpha modifier still works', () => {
    expect(rgbChannels('#2D65F3')).toBe('45 101 243')
    expect(rgbChannels('#fff')).toBe('255 255 255')
  })

  it('a colour that already carries alpha is left whole', () => {
    // Splitting it apart to re-attach a second alpha would change the colour.
    expect(rgbChannels('rgba(0,0,0,0.1)')).toBeNull()
  })
})

describe('the Tailwind artifacts', () => {
  const { theme, base } = tailwindArtifacts(brand, radiusScale)

  it('names colours through a variable, so a class follows the appearance', () => {
    expect(theme.colors.surface).toBe('rgb(var(--color-surface) / <alpha-value>)')
  })

  it('drops the alpha modifier for a colour that has its own', () => {
    expect(theme.colors.veil).toBe('var(--color-veil)')
  })

  it('gives the dark appearance its own values, under the query the OS answers', () => {
    expect(base[':root']['--color-surface']).toBe('255 255 255')
    expect(base['@media (prefers-color-scheme: dark)'][':root']['--color-surface']).toBe('16 16 16')
  })

  it('resolves a radius role to the step it names', () => {
    expect(theme.borderRadius).toEqual({ chip: '4px', card: '12px' })
  })

  it('gives a font family the name a class would spell', () => {
    expect(kebab('bodyBold')).toBe('body-bold')
    expect(theme.fontFamily['body-bold']).toEqual(['Body-Bold'])
  })
})

describe('what it refuses', () => {
  it('an appearance that is missing a colour the other one has', () => {
    const uneven = { ...brand, scheme: { light: brand.scheme.light, dark: { surface: '#101010' } } }
    expect(() => tailwindArtifacts(uneven, radiusScale)).toThrow(/same colours/)
  })

  it('a product colour that shadows a role', () => {
    const clashing = {
      ...brand,
      product: { light: { surface: '#000000' }, dark: { surface: '#000000' } },
    }
    expect(() => tailwindArtifacts(clashing, radiusScale)).toThrow(/re-uses colour names/)
  })

  it('a radius role naming a step that does not exist', () => {
    const wrong = { ...brand, radiusRoles: { card: 'enormous' } }
    expect(() => tailwindArtifacts(wrong, radiusScale)).toThrow(/does not exist/)
  })
})

describe('the TypeScript module', () => {
  const source = typeScriptModule(brand)

  it('writes the values out, rather than importing the JSON back', () => {
    // Every bundler in this ecosystem resolves a JSON import slightly differently.
    expect(source).not.toMatch(/import/)
    expect(source).toContain('"surface": "#FFFFFF"')
  })

  it('keeps both appearances, so the dark side is reachable from TypeScript too', () => {
    expect(source).toContain('"surface": "#101010"')
  })
})

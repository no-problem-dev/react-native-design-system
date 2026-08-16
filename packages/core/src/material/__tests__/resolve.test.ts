import { describe, expect, it } from 'vitest'

import { createTheme } from '../../theme/createTheme.js'
import { resolveMaterial } from '../resolve.js'
import type { MaterialCapabilities } from '../types.js'
import { plainCapabilities } from '../types.js'

const theme = createTheme({ appearance: 'light', colorSource: 'brand' })

const withGlass = (over: Partial<MaterialCapabilities['glass']> = {}): MaterialCapabilities => ({
  glass: { available: true, interactive: true, ...over },
  reduceTransparency: false,
})

describe('the material ladder', () => {
  it('keeps every surface that is part of the page a fill, even where glass exists', () => {
    for (const elevation of ['flat', 'raised', 'floating'] as const) {
      expect(resolveMaterial(elevation, theme, withGlass()).kind, elevation).toBe('fill')
    }
  })

  it('uses glass for a surface that overlays content, when the platform offers it', () => {
    const material = resolveMaterial('overlay', theme, withGlass())
    expect(material).toMatchObject({ kind: 'glass', interactive: true })
  })

  it('keeps the material but drops the interaction when only the effect is offered', () => {
    const material = resolveMaterial('overlay', theme, withGlass({ interactive: false }))
    expect(material).toMatchObject({ kind: 'glass', interactive: false })
  })

  it('falls back to a fill when the platform offers nothing', () => {
    const material = resolveMaterial('overlay', theme, plainCapabilities)
    expect(material.kind).toBe('fill')
  })

  it('always gives glass a border, so a panel is never invisible', () => {
    const material = resolveMaterial('overlay', theme, withGlass())
    if (material.kind !== 'glass') throw new Error('expected glass')
    expect(material.borderColor).toBe(theme.colors.outline)
  })

  it('lets reduced transparency win over an available glass material', () => {
    const material = resolveMaterial('overlay', theme, { ...withGlass(), reduceTransparency: true })
    expect(material.kind).toBe('fill')
  })
})

describe('the fill fallback', () => {
  it('reads its colours from the theme rather than from constants', () => {
    const material = resolveMaterial('raised', theme, plainCapabilities)
    if (material.kind !== 'fill') throw new Error('expected a fill')
    expect(material.backgroundColor).toBe(theme.colors.surface)
    expect(material.borderColor).toBe(theme.colors.outline)
  })

  it('sits a flat surface on the variant colour, with nothing above the page', () => {
    const material = resolveMaterial('flat', theme, plainCapabilities)
    if (material.kind !== 'fill') throw new Error('expected a fill')
    expect(material.backgroundColor).toBe(theme.colors.surfaceVariant)
    expect(material.shadow).toBeUndefined()
    expect(material.borderColor).toBeUndefined()
  })

  it('grows the shadow as the intent rises', () => {
    const radii = (['raised', 'floating', 'overlay'] as const).map((elevation) => {
      const material = resolveMaterial(elevation, theme, plainCapabilities)
      if (material.kind !== 'fill') throw new Error('expected a fill')
      return material.shadow?.radius ?? 0
    })
    expect([...radii].sort((a, b) => a - b)).toEqual(radii)
  })

  it('follows the appearance it was given', () => {
    const dark = createTheme({ appearance: 'dark', colorSource: 'brand' })
    const material = resolveMaterial('raised', dark, plainCapabilities)
    if (material.kind !== 'fill') throw new Error('expected a fill')
    expect(material.backgroundColor).toBe(dark.colors.surface)
    expect(material.backgroundColor).not.toBe(theme.colors.surface)
  })
})

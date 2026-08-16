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
  it('never uses a material for a flat surface, even when glass is available', () => {
    const material = resolveMaterial('flat', theme, withGlass())
    expect(material.kind).toBe('fill')
  })

  it('uses glass when the platform offers it', () => {
    const material = resolveMaterial('floating', theme, withGlass())
    expect(material).toMatchObject({ kind: 'glass', interactive: true })
  })

  it('keeps the material but drops the interaction when only the effect is offered', () => {
    const material = resolveMaterial('floating', theme, withGlass({ interactive: false }))
    expect(material).toMatchObject({ kind: 'glass', interactive: false })
  })

  it('falls back to a fill when the platform offers nothing', () => {
    const material = resolveMaterial('floating', theme, plainCapabilities)
    expect(material.kind).toBe('fill')
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

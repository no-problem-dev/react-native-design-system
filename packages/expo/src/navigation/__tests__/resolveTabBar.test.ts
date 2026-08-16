// Deliberately not through the package's entry point: that pulls in React Native,
// which this has no need for and cannot be parsed outside a bundler.
import { scheme } from '@no-problem/design-tokens'
import { describe, expect, it } from 'vitest'

import { glyphsFor, icons } from '../icons.js'
import { resolveHeader } from '../resolveHeader.js'
import { resolveTabBar } from '../resolveTabBar.js'

const theme = { colors: scheme.light }

describe('dressing the platform tab bar', () => {
  it('leaves the background alone on the platform that draws its own material', () => {
    // Painting over it is how an app loses the material without ever meaning to.
    expect(resolveTabBar(theme, 'ios').backgroundColor).toBeUndefined()
  })

  it('supplies the surface on the platform that expects the app to', () => {
    expect(resolveTabBar(theme, 'android').backgroundColor).toBe(theme.colors.surface)
  })

  it('only asks for a selection pill where there is one', () => {
    expect(resolveTabBar(theme, 'android').indicatorColor).toBeDefined()
    expect(resolveTabBar(theme, 'ios').indicatorColor).toBeUndefined()
  })

  it('tints the selected item with the product colour everywhere', () => {
    for (const platform of ['ios', 'android', 'other'] as const) {
      expect(resolveTabBar(theme, platform).tintColor, platform).toBe(theme.colors.primary)
    }
  })

  it('takes every colour from the theme, so changing the accent changes the bar', () => {
    const other = { colors: { ...scheme.light, primary: '#7b2d8e' } }
    expect(resolveTabBar(other, 'ios').tintColor).toBe('#7b2d8e')
    expect(resolveTabBar(other, 'ios').tintColor).not.toBe(resolveTabBar(theme, 'ios').tintColor)
  })

  it('never invents a colour of its own', () => {
    const palette = new Set<string>(Object.values(theme.colors))
    for (const platform of ['ios', 'android', 'other'] as const) {
      const bar = resolveTabBar(theme, platform)
      for (const [key, value] of Object.entries(bar)) {
        if (value === undefined) continue
        expect(palette.has(value), `${platform}.${key}: ${value}`).toBe(true)
      }
    }
  })
})

describe('the icon vocabulary', () => {
  it('gives every name a glyph on both platforms', () => {
    for (const [name, glyphs] of Object.entries(icons)) {
      expect(glyphs.sf, name).toMatch(/\S/)
      expect(glyphs.material, name).toMatch(/\S/)
    }
  })

  it('does not hand the same glyph to two different ideas', () => {
    const sf = Object.values(icons).map((glyph) => glyph.sf)
    const material = Object.values(icons).map((glyph) => glyph.material)
    expect(new Set(sf).size).toBe(sf.length)
    expect(new Set(material).size).toBe(material.length)
  })

  it('answers for every name it declares', () => {
    for (const name of Object.keys(icons) as (keyof typeof icons)[]) {
      expect(glyphsFor(name)).toBe(icons[name])
    }
  })
})

describe('dressing the platform header', () => {
  it('supplies the background on both platforms', () => {
    // Left without one, a native stack header keeps the light background in the
    // dark appearance: the bar stays white while the page under it turns dark,
    // and the title — coloured for the theme — disappears into it.
    for (const platform of ['ios', 'android'] as const) {
      expect(resolveHeader(theme, platform).backgroundColor).toBe(theme.colors.surface)
    }
  })

  it('follows the appearance, which is the whole reason it names a colour', () => {
    const dark = { colors: scheme.dark }
    expect(resolveHeader(dark, 'ios').backgroundColor).toBe(scheme.dark.surface)
    expect(resolveHeader(dark, 'ios').backgroundColor).not.toBe(scheme.light.surface)
  })

  it('says nothing about where the title goes or how the back control looks', () => {
    // Both differ between platforms and both are already right. The moment this
    // object grows an alignment or a glyph, the app has started overriding the OS.
    for (const platform of ['ios', 'android'] as const) {
      expect(Object.keys(resolveHeader(theme, platform)).sort()).toEqual([
        'backgroundColor',
        'tintColor',
        'titleColor',
      ])
    }
  })

  it('never invents a colour of its own', () => {
    const palette = new Set<string>(Object.values(theme.colors))
    for (const platform of ['ios', 'android', 'other'] as const) {
      const header = resolveHeader(theme, platform)
      for (const value of [header.backgroundColor, header.tintColor, header.titleColor]) {
        if (value === undefined) continue
        expect(palette.has(value), `${platform}: ${value}`).toBe(true)
      }
    }
  })
})

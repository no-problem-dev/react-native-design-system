// Deliberately not through the package's entry point: that pulls in React Native,
// which this has no need for and cannot be parsed outside a bundler.
import { scheme } from '@no-problem/design-tokens'
import { describe, expect, it } from 'vitest'

import { glyphsFor, icons } from '../icons.js'
import { resolveHeader } from '../resolveHeader.js'
import { resolveTabBar } from '../resolveTabBar.js'
import { navigationTheme } from '../../navigationTheme.js'

const theme = { colors: scheme.light }

/** Stands in for whatever the navigator ships. */
const navBase = {
  dark: false,
  colors: {
    primary: '#000',
    background: '#fff',
    card: '#fff',
    text: '#000',
    border: '#ccc',
    notification: '#f00',
  },
  fonts: {},
}

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
    // Only the keys that name a colour: the bar also carries a decision or two
    // that are not colours at all, and those have their own tests.
    const palette = new Set<string>(Object.values(theme.colors))
    for (const platform of ['ios', 'android', 'other'] as const) {
      const bar = resolveTabBar(theme, platform)
      for (const [key, value] of Object.entries(bar)) {
        if (value === undefined || !/Color$/.test(key)) continue
        expect(palette.has(value as string), `${platform}.${key}: ${value}`).toBe(true)
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
  it('leaves the bar itself to the platform that draws its own material', () => {
    expect(resolveHeader(theme, 'ios').backgroundColor).toBeUndefined()
  })

  it('supplies the surface on the platform that expects it', () => {
    expect(resolveHeader(theme, 'android').backgroundColor).toBe(theme.colors.surface)
    expect(resolveHeader({ colors: scheme.dark }, 'android').backgroundColor).toBe(scheme.dark.surface)
  })

  it('says nothing about where the title goes or how the back control looks', () => {
    // Both differ between platforms and both are already right. The moment this
    // object grows an alignment, a glyph or a size, the app has started overriding
    // the OS — so what is checked is that every key it has is a colour, rather
    // than a list of names that has to be edited whenever a colour is added.
    for (const platform of ['ios', 'android'] as const) {
      for (const key of Object.keys(resolveHeader(theme, platform))) {
        expect({ platform, key, namesAColour: /Color$/.test(key) }).toEqual({
          platform,
          key,
          namesAColour: true,
        })
      }
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

describe('the search field inside the header', () => {
  it('is told its colours, because it does not inherit the bar’s', () => {
    // Left alone it keeps the light appearance's ink, which on a dark bar is a
    // placeholder and a magnifier nobody can see.
    const dark = { colors: scheme.dark }
    const header = resolveHeader(dark, 'ios')
    expect(header.searchTextColor).toBe(scheme.dark.onSurface)
    expect(header.searchHintColor).toBe(scheme.dark.onSurfaceVariant)
    expect(header.searchTextColor).not.toBe(scheme.light.onSurface)
  })

  it('keeps the hint quieter than the text the reader typed', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const header = resolveHeader({ colors: scheme[appearance] }, 'ios')
      expect(header.searchHintColor).not.toBe(header.searchTextColor)
    }
  })
})

describe('the theme handed to the navigator', () => {
  it('says which appearance it is, which is what pins the bar’s interface style', () => {
    // An app that never supplies a theme gets the light one, and the navigation
    // bar then stays in the light appearance for the life of the process.
    expect(navigationTheme({ appearance: 'dark', colors: scheme.dark }, navBase).dark).toBe(true)
    expect(navigationTheme({ appearance: 'light', colors: scheme.light }, navBase).dark).toBe(false)
  })

  it('paints what the navigator draws between screens in the theme’s own colours', () => {
    // Left at the default these are the light ones, which shows as a flash of
    // white behind every push in the dark appearance.
    const { colors } = navigationTheme({ appearance: 'dark', colors: scheme.dark }, navBase)
    expect(colors.background).toBe(scheme.dark.background)
    expect(colors.card).toBe(scheme.dark.surface)
    expect(colors.text).toBe(scheme.dark.onSurface)
  })

  it('keeps whatever else the navigator’s own theme carries', () => {
    // A version that adds to the theme — fonts did exactly this — must keep working.
    expect(navigationTheme({ appearance: 'light', colors: scheme.light }, navBase)).toHaveProperty(
      'fonts',
    )
  })
})

describe('what the tab bar says about where a reader can go', () => {
  it('keeps every label on the platform whose guidance asks for them', () => {
    // Material's own default drops the labels from all but the chosen item once
    // there are four destinations, which leaves three glyphs to decode.
    expect(resolveTabBar(theme, 'android').labels).toBe('always')
  })

  it('says nothing on the platform that does not ask', () => {
    expect(resolveTabBar(theme, 'ios').labels).toBeUndefined()
  })
})

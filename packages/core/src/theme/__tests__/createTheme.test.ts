/**
 * What a product gets when it supplies some of its own colours.
 *
 * The interesting cases are all about the ones it did *not* supply: which of those
 * follow what it did say, and which stay as they shipped.
 */
import { describe, expect, it } from 'vitest'

import { createTheme } from '../createTheme.js'

describe('the quieter forms of a colour', () => {
  it('follows a product that supplied its own primary', () => {
    // Android draws the tab bar's selection pill from primaryContainer. Left at
    // the shipped literal it is made from *this package's* blue, so a product with
    // its own blue gets a pill in a hue it does not use.
    const theme = createTheme({
      appearance: 'light',
      colorSource: 'brand',
      brand: { primary: '#2D65F3' },
    })
    expect(theme.colors.primaryContainer.toUpperCase()).toBe('#2D65F31F')
    expect(theme.colors.onPrimaryContainer).toBe('#2D65F3')
  })

  it('leaves a container the product named alone', () => {
    const theme = createTheme({
      appearance: 'light',
      colorSource: 'brand',
      brand: { primary: '#2D65F3', primaryContainer: '#EEF3FF' },
    })
    expect(theme.colors.primaryContainer).toBe('#EEF3FF')
  })

  it('does not move a container whose role the product never mentioned', () => {
    const shipped = createTheme({ appearance: 'light', colorSource: 'brand' })
    const branded = createTheme({
      appearance: 'light',
      colorSource: 'brand',
      brand: { primary: '#2D65F3' },
    })
    expect(branded.colors.secondaryContainer).toBe(shipped.colors.secondaryContainer)
  })

  it('changes nothing at all when the product supplies nothing', () => {
    const shipped = createTheme({ appearance: 'dark', colorSource: 'brand' })
    expect(shipped.colors.primaryContainer).toBeDefined()
    expect(shipped.colors.primaryContainer).toBe(
      createTheme({ appearance: 'dark', colorSource: 'brand' }).colors.primaryContainer,
    )
  })
})

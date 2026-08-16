import { scheme } from '@no-problem/design-tokens'
import { describe, expect, it } from 'vitest'

import { capabilitiesFrom } from '../capabilities.js'
import type { PlatformPalette } from '../materialColorScheme.js'
import { fromPlatformPalette } from '../materialColorScheme.js'

describe('reading capabilities from a platform', () => {
  it('offers the interactive material only when both answers are yes', () => {
    expect(
      capabilitiesFrom({
        liquidGlassAvailable: true,
        glassEffectApiAvailable: true,
        reduceTransparency: false,
      }).glass,
    ).toEqual({ available: true, interactive: true })
  })

  it('keeps the material but not the interaction on a release that ships only the plain one', () => {
    expect(
      capabilitiesFrom({
        liquidGlassAvailable: true,
        glassEffectApiAvailable: false,
        reduceTransparency: false,
      }).glass,
    ).toEqual({ available: true, interactive: false })
  })

  it('never claims an interactive material when the material itself is absent', () => {
    expect(
      capabilitiesFrom({
        liquidGlassAvailable: false,
        glassEffectApiAvailable: true,
        reduceTransparency: false,
      }).glass,
    ).toEqual({ available: false, interactive: false })
  })

  it('passes the reader’s transparency preference through untouched', () => {
    for (const reduceTransparency of [true, false]) {
      expect(
        capabilitiesFrom({
          liquidGlassAvailable: true,
          glassEffectApiAvailable: true,
          reduceTransparency,
        }).reduceTransparency,
      ).toBe(reduceTransparency)
    }
  })
})

const palette: PlatformPalette = {
  primary: '#11223344',
  onPrimary: '#22334455',
  primaryContainer: '#33445566',
  onPrimaryContainer: '#44556677',
  secondary: '#55667788',
  onSecondary: '#66778899',
  secondaryContainer: '#778899aa',
  onSecondaryContainer: '#8899aabb',
  tertiary: '#99aabbcc',
  onTertiary: '#aabbccdd',
  background: '#bbccddee',
  onBackground: '#ccddeeff',
  surface: '#ddeeff00',
  onSurface: '#eeff0011',
  surfaceVariant: '#ff001122',
  onSurfaceVariant: '#00112233',
  surfaceContainer: '#10203040',
  surfaceContainerHigh: '#20304050',
  error: '#30405060',
  onError: '#40506070',
  errorContainer: '#50607080',
  onErrorContainer: '#60708090',
  outline: '#708090a0',
  outlineVariant: '#8090a0b0',
  scrim: '#90a0b0c0',
}

describe('folding a platform palette into the system roles', () => {
  const folded = fromPlatformPalette(palette, scheme.light)

  it('takes every role the platform actually supplies', () => {
    expect(folded.primary).toBe(palette.primary)
    expect(folded.surface).toBe(palette.surface)
    expect(folded.outlineVariant).toBe(palette.outlineVariant)
    expect(folded.shadow).toBe(palette.scrim)
  })

  it('keeps the product’s own meaning for roles the platform has no idea about', () => {
    expect(folded.warning).toBe(scheme.light.warning)
    expect(folded.success).toBe(scheme.light.success)
    expect(folded.info).toBe(scheme.light.info)
  })

  it('leaves no role undefined, whatever the platform sent', () => {
    for (const [role, value] of Object.entries(folded)) {
      expect(value, role).toMatch(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)
    }
  })

  it('produces exactly the roles a theme expects', () => {
    expect(Object.keys(folded).sort()).toEqual(Object.keys(scheme.light).sort())
  })
})

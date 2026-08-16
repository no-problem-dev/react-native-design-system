import {
  Host,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose'
import type { MaterialCapabilities } from '@no-problem/design-system'
import type { ColorScheme } from '@no-problem/design-tokens'
import { useMemo } from 'react'

import { capabilitiesFrom } from './capabilities.js'
import { fromPlatformPalette } from './materialColorScheme.js'
import type { PlatformBindings, PlatformSegmentedProps } from './platform.types.js'

/**
 * No glass material here. Height is carried by tone and shadow instead, which the
 * shared fill already does — so this is a constant rather than a lookup.
 */
function useCapabilities(): MaterialCapabilities {
  return useMemo(
    () =>
      capabilitiesFrom({
        liquidGlassAvailable: false,
        glassEffectApiAvailable: false,
        reduceTransparency: false,
      }),
    [],
  )
}

/**
 * The platform derives a palette from the reader's wallpaper. Taking it is what
 * makes an app look like it belongs to the device rather than to a brand guide.
 * Whether that is wanted is the product's call, so the theme decides whether to
 * use what is returned here.
 */
function useDynamicColors(appearance: 'light' | 'dark', fallback: ColorScheme): ColorScheme | undefined {
  const palette = useMaterialColors({ colorScheme: appearance })
  return useMemo(() => fromPlatformPalette(palette, fallback), [palette, fallback])
}

/**
 * Material's own segmented buttons.
 *
 * Not the same shape as the other platform's — an outlined row where each chosen
 * segment shows a check — and that is the point. A reader here recognises this one.
 * The colours are left to Material, which already has them from the same dynamic
 * palette this file reports upward.
 */
function Segmented({ options, value, onChange, style }: PlatformSegmentedProps) {
  return (
    <Host matchContents={{ vertical: true }} style={style}>
      <SingleChoiceSegmentedButtonRow>
        {options.map((option) => (
          <SegmentedButton
            key={String(option.value)}
            selected={option.value === value}
            enabled={option.disabled !== true}
            onClick={() => onChange(option.value)}
          >
            {/* The label goes in its own slot. A bare child is accepted and then
                never drawn, which reads on a device as four empty outlines. */}
            <SegmentedButton.Label>
              <Text>{option.label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
    </Host>
  )
}

export const bindings: PlatformBindings = { useCapabilities, useDynamicColors, Segmented }

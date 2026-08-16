/**
 * A surface is asked for an *intent*, never for a platform effect.
 *
 * `elevation="floating"` says "this sits above the page". What that means —
 * a blurred glass panel, a tonal step, a drop shadow — is decided per platform.
 * If this type ever grows a word like `blurAmount`, the API has leaked.
 */
export type Elevation = 'flat' | 'raised' | 'floating' | 'overlay'

/** Kept alongside the intents so the mapping stays visible and reviewable. */
export const elevationLevel: Readonly<Record<Elevation, number>> = {
  flat: 0,
  raised: 1,
  floating: 3,
  overlay: 5,
}

export type ShadowSpec = {
  color: string
  opacity: number
  radius: number
  offsetY: number
  /** Android draws shadows from a single elevation value rather than the parts above. */
  androidElevation: number
}

/**
 * The outcome of asking "what should this surface be made of, here, right now".
 *
 * Deliberately a plain value. A story can hand any of these to the renderer, so
 * the way a surface looks on either platform can be checked in a browser — the
 * only thing left for a device is whether the platform really offered glass.
 */
export type ResolvedMaterial =
  | {
      kind: 'glass'
      interactive: boolean
      tintColor: string | undefined
      borderColor: string
    }
  | {
      kind: 'fill'
      backgroundColor: string
      borderColor: string | undefined
      shadow: ShadowSpec | undefined
    }

/** What the platform actually offers. Supplied by an adapter, never sniffed here. */
export type MaterialCapabilities = {
  glass: {
    /** The platform can draw a glass material at all. */
    available: boolean
    /** The glass can react to touch. Some versions offer the material but not the interaction. */
    interactive: boolean
  }
  /** The reader asked for less transparency. Overrides everything below it. */
  reduceTransparency: boolean
}

/** Nothing beyond plain views. The default, and what the web falls back to. */
export const plainCapabilities: MaterialCapabilities = {
  glass: { available: false, interactive: false },
  reduceTransparency: false,
}

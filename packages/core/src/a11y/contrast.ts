/**
 * Contrast, as WCAG defines it.
 *
 * Small enough to keep in the package rather than take a dependency for, and worth
 * having here rather than only in a browser test: a rule that runs in milliseconds
 * on every commit is one that never gets skipped.
 */

function channel(value: number): number {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

/**
 * Expand `#rgb` and `#rgba` to their six-digit form.
 *
 * Both are ordinary ways to write a colour and React Native accepts them, so a
 * palette will contain them sooner or later. Refusing them would make this
 * throw on perfectly valid input.
 */
function sixDigits(color: string): string {
  const hex = color.replace('#', '')
  const expanded = hex.length === 3 || hex.length === 4 ? [...hex].map((c) => c + c).join('') : hex
  return expanded.slice(0, 6)
}

/** Relative luminance of a hex colour. Any alpha channel is ignored. */
export function luminance(color: string): number {
  const hex = sixDigits(color)
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Not a hex colour: ${color}`)
  const [r, g, b] = [0, 2, 4].map((i) => channel(Number.parseInt(hex.slice(i, i + 2), 16) / 255)) as [
    number,
    number,
    number,
  ]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  const lighter = Math.max(x, y)
  const darker = Math.min(x, y)
  return (lighter + 0.05) / (darker + 0.05)
}

/** What WCAG asks for, by level and text size. */
export const contrastMinimum = {
  /** Body text at any size. */
  normalText: 4.5,
  /** Text at 18pt, or 14pt bold and above. */
  largeText: 3,
  /** Borders, icons and other non-text marks. */
  nonText: 3,
} as const

export function meetsContrast(
  foreground: string,
  background: string,
  minimum: number = contrastMinimum.normalText,
): boolean {
  return contrastRatio(foreground, background) >= minimum
}

function toRgb(color: string): [number, number, number] {
  const hex = sixDigits(color)
  return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`
}

function mix(from: [number, number, number], to: number, amount: number): [number, number, number] {
  return from.map((value) => value + (to - value) * amount) as [number, number, number]
}

/**
 * Move a colour just far enough that text on it can be read.
 *
 * A brand hands over the colour it wants, not the colour that happens to clear
 * 4.5:1 — and the two are usually not the same. Rather than refusing the brand or
 * ignoring the reader, this walks the colour away from the text until the pair
 * passes, keeping as much of the original as the threshold allows.
 *
 * Direction follows the text: light text pushes the surface toward black, dark
 * text pushes it toward white. Hue is left alone, so the result still reads as the
 * colour it started from.
 */
export function ensureContrast(
  color: string,
  against: string,
  minimum: number = contrastMinimum.normalText,
): string {
  if (contrastRatio(color, against) >= minimum) return color

  const target = luminance(against) > 0.5 ? 0 : 255
  const start = toRgb(color)

  for (let step = 1; step <= 40; step += 1) {
    const candidate = toHex(mix(start, target, step / 40))
    if (contrastRatio(candidate, against) >= minimum) return candidate
  }

  // Nothing in that direction was enough — which only happens when the two are
  // near the same lightness. Black or white always clears any real threshold.
  return target === 0 ? '#000000' : '#ffffff'
}

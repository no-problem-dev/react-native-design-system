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

/** Relative luminance of a `#rrggbb` or `#rrggbbaa` colour. Alpha is ignored. */
export function luminance(color: string): number {
  const hex = color.replace('#', '').slice(0, 6)
  if (hex.length !== 6) throw new Error(`Not a hex colour: ${color}`)
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

import type MaterialIcons from '@expo/vector-icons/MaterialIcons'
import type { ComponentProps } from 'react'
import type { SFSymbol } from 'sf-symbols-typescript'

/** The glyph names Android actually has, as the icon set spells them. */
type MaterialGlyph = ComponentProps<typeof MaterialIcons>['name']

/**
 * One name per idea, and the glyph each platform already has for it.
 *
 * A product says "this tab is favourites". It should not have to know that iOS
 * calls that `heart.fill` and Android calls it `favorite` — and it certainly
 * should not ship one drawing to both, which is the usual way out and the one
 * that produces an app belonging to neither platform.
 *
 * Both columns are typed against the real glyph sets, so a name that does not
 * exist is a compile error rather than a blank square on someone's phone.
 *
 * Keeping the table here is the point: the vocabulary is the package's job, the
 * choice of which tabs exist is the product's.
 */
export type IconName =
  | 'home'
  | 'search'
  | 'favorite'
  | 'settings'
  | 'profile'
  | 'notifications'
  | 'list'
  | 'chart'
  | 'add'
  | 'history'
  | 'bookmark'
  | 'compare'

export type IconGlyphs = {
  sf: SFSymbol
  material: MaterialGlyph
}

export const icons: Readonly<Record<IconName, IconGlyphs>> = {
  home: { sf: 'house.fill', material: 'home' },
  search: { sf: 'magnifyingglass', material: 'search' },
  favorite: { sf: 'heart.fill', material: 'favorite' },
  settings: { sf: 'gearshape.fill', material: 'settings' },
  profile: { sf: 'person.crop.circle.fill', material: 'account-circle' },
  notifications: { sf: 'bell.fill', material: 'notifications' },
  list: { sf: 'list.bullet', material: 'list' },
  chart: { sf: 'chart.line.uptrend.xyaxis', material: 'show-chart' },
  add: { sf: 'plus', material: 'add' },
  history: { sf: 'clock.arrow.circlepath', material: 'history' },
  bookmark: { sf: 'bookmark.fill', material: 'bookmark' },
  compare: { sf: 'square.on.square', material: 'compare-arrows' },
}

export function glyphsFor(name: IconName): IconGlyphs {
  return icons[name]
}

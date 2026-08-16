import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@no-problem/design-system'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { Platform } from 'react-native'

import type { IconName } from './icons.js'
import { glyphsFor } from './icons.js'
import { resolveTabBar } from './resolveTabBar.js'

export type TabDefinition = {
  /** The route this tab shows. */
  name: string
  label: string
  icon: IconName
}

export type NavigationTabsProps = {
  tabs: readonly TabDefinition[]
  /** Font family for the labels, when the product has one. */
  fontFamily?: string | undefined
}

/**
 * The platform's own tab bar, dressed in the product's colours.
 *
 * A tab bar drawn in JavaScript can be made to look like either platform, and it
 * will still be neither: iOS 26 draws a material behind it that shrinks as you
 * scroll and animates the selection like a drop of water; Android draws a
 * Material 3 bar with a selection pill and a ripple. Both handle hit testing,
 * the screen reader, and text scaling. None of that is styling, and none of it
 * can be reached from a view you drew yourself.
 *
 * So this renders the real one, and the only thing it adds is translation: the
 * product names a tab and an idea, and this turns those into the glyph and the
 * colours each platform expects.
 */
export function NavigationTabs({ tabs, fontFamily }: NavigationTabsProps) {
  const theme = useTheme()
  const bar = resolveTabBar(theme, Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'other')

  return (
    <NativeTabs
      tintColor={bar.tintColor}
      {...(bar.backgroundColor === undefined ? null : { backgroundColor: bar.backgroundColor })}
      {...(bar.indicatorColor === undefined ? null : { indicatorColor: bar.indicatorColor })}
      {...(bar.rippleColor === undefined ? null : { rippleColor: bar.rippleColor })}
      {...(fontFamily === undefined ? null : { labelStyle: { fontFamily } })}
    >
      {tabs.map((tab) => {
        const glyphs = glyphsFor(tab.icon)
        return (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={glyphs.sf}
              src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name={glyphs.material} />}
            />
          </NativeTabs.Trigger>
        )
      })}
    </NativeTabs>
  )
}

import { useTheme } from '@no-problem/design-system'
import { Platform } from 'react-native'

import { resolveHeader } from './resolveHeader.js'

export type HeaderOptions = {
  title: string
  /** A font the product uses for titles. */
  fontFamily?: string | undefined
  /** iOS shows a large title that collapses as the reader scrolls. */
  large?: boolean | undefined
}

/**
 * Options for the platform's own navigation header.
 *
 * Drawing this by hand is the usual thing to do and it costs more than it looks.
 * The back control alone carries a swipe gesture, a label that shortens to fit,
 * a longer hit area than it appears to have, and a name the screen reader
 * announces — before the header has a material, or a title that collapses as the
 * page scrolls. A row with a circle and a centred label has none of that.
 *
 * So: say what the screen is called, and let the platform draw its own bar.
 *
 * ```tsx
 * <Stack.Screen options={useHeaderOptions({ title: 'Rankings' })} />
 * ```
 */
export function useHeaderOptions(options: HeaderOptions) {
  const theme = useTheme()
  const header = resolveHeader(
    theme,
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'other',
  )

  return {
    headerShown: true,
    title: options.title,
    headerTintColor: header.tintColor,
    headerTitleStyle: {
      color: header.titleColor,
      ...(options.fontFamily === undefined ? null : { fontFamily: options.fontFamily }),
    },
    ...(header.backgroundColor === undefined
      ? null
      : { headerStyle: { backgroundColor: header.backgroundColor } }),
    // Only iOS has this idea, and passing it elsewhere is ignored rather than wrong.
    ...(options.large === true ? { headerLargeTitle: true } : null),
  } as const
}

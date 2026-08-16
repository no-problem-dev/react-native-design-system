import { useTheme } from '@no-problem/design-system'
import { Platform } from 'react-native'

import { resolveHeader } from './resolveHeader.js'

export type HeaderOptions = {
  title: string
  /** A font the product uses for titles. */
  fontFamily?: string | undefined
  /** iOS shows a large title that collapses as the reader scrolls. */
  large?: boolean | undefined
  /**
   * What the back control says.
   *
   * `minimal` is the default here, against the platform's own — and for a reason.
   * The platform default shows the *previous screen's* title, which is a good
   * idea right up until the previous screen is a layout group, at which point the
   * bar reads something like `(tabs)`: an implementation detail presented to the
   * reader as the name of where they came from.
   *
   * Set it to `default` on screens whose parent genuinely has a name worth
   * showing, or `generic` for the platform's own word for going back.
   */
  back?: 'minimal' | 'generic' | 'default' | undefined
  /**
   * Put a search field in the bar.
   *
   * The platform's own field is not a text input with an icon next to it. It
   * brings a cancel affordance, dictation, the clear control, the keyboard's
   * search key, the screen reader's word for "search field", and — on the
   * platform that does it — the way it tucks away as the reader scrolls and
   * comes back when they reach for it. Rebuilding that in a `TextInput` produces
   * something that looks similar and behaves like nothing in particular.
   */
  search?:
    | {
        placeholder: string
        onChangeText: (text: string) => void
        /** Hide the field until the reader scrolls up to it. */
        hideWhenScrolling?: boolean | undefined
        autoFocus?: boolean | undefined
      }
    | undefined
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
    headerBackButtonDisplayMode: options.back ?? 'minimal',
    headerTitleStyle: {
      color: header.titleColor,
      ...(options.fontFamily === undefined ? null : { fontFamily: options.fontFamily }),
    },
    headerStyle: { backgroundColor: header.backgroundColor },
    // Only iOS has this idea, and passing it elsewhere is ignored rather than wrong.
    ...(options.large === true ? { headerLargeTitle: true } : null),
    ...(options.search === undefined
      ? null
      : {
          headerSearchBarOptions: {
            placeholder: options.search.placeholder,
            textColor: header.searchTextColor,
            hintTextColor: header.searchHintColor,
            headerIconColor: header.searchHintColor,
            tintColor: header.tintColor,
            // The native field reports through an event; callers want the text.
            onChangeText: (event: { nativeEvent: { text: string } }) =>
              options.search?.onChangeText(event.nativeEvent.text),
            hideWhenScrolling: options.search.hideWhenScrolling ?? false,
            autoCapitalize: 'none' as const,
            ...(options.search.autoFocus === undefined ? null : { autoFocus: options.search.autoFocus }),
          },
        }),
  } as const
}

import { useEffect } from 'react'
import * as SystemUI from 'expo-system-ui'

/**
 * Paint the window behind the app in the theme's own background.
 *
 * The window is not usually visible, which is why this is easy to miss. It shows
 * through wherever a system bar is translucent — and on both platforms the
 * navigation bar and the tab bar are translucent by default, precisely so the
 * content can be seen moving under them. A window left at whatever colour the
 * launch screen happened to use then appears as a band of the wrong colour at the
 * top or bottom of every screen, and only in one appearance, which reads as a
 * header that "did not follow dark mode".
 *
 * Kept apart from the launch screen's own colour on purpose: that one is fixed
 * when the app is built, and the app can already be running in the other
 * appearance by the time the first screen is drawn.
 */
export function useWindowBackground(color: string): void {
  useEffect(() => {
    // Fire and forget: the call reaches native on the next frame and there is
    // nothing useful to do if it fails — the window keeps the colour it had.
    void SystemUI.setBackgroundColorAsync(color)
  }, [color])
}

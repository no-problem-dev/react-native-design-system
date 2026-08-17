/**
 * What makes up each thing you can copy.
 *
 * Sources are read from the installed packages rather than from a snapshot built
 * ahead of time. A snapshot is one more thing that can fall out of step with the
 * code it describes; reading the real files means the copy is whatever the version
 * you installed actually contains.
 */

export type Origin = 'core' | 'tokens' | 'expo'

export type FileSpec = {
  origin: Origin
  /** Path inside that package's `src`. */
  from: string
  /** Path under the destination directory. */
  to: string
}

export type Item = {
  name: string
  description: string
  /** Other items this one cannot work without. */
  needs: string[]
  files: FileSpec[]
}

/**
 * Where every source file lands, keyed by the package it comes from and its path
 * inside that package's `src`.
 *
 * The destination layout is not the source layout — the platform package's files are
 * grouped under `adapter/`, and its Segmented sits beside the core one — so a
 * relative import written in `src` can name nothing at all once copied. This is what
 * lets those imports be re-pointed instead of the two layouts having to agree.
 */
export function layout(): Map<string, string> {
  const map = new Map<string, string>()
  for (const item of Object.values(manifest)) {
    for (const spec of item.files) map.set(`${spec.origin}:${spec.from}`, spec.to)
  }
  return map
}

const tokenFiles: FileSpec[] = [
  // The values as data, so a build tool that is not TypeScript can read the same
  // file rather than keep its own copy.
  { origin: 'tokens', from: 'generated/tokens.json', to: 'tokens/tokens.json' },
  { origin: 'tokens', from: 'generated/tokens.ts', to: 'tokens/tokens.ts' },
  { origin: 'tokens', from: 'types.ts', to: 'tokens/types.ts' },
  { origin: 'tokens', from: 'index.ts', to: 'tokens/index.ts' },
  // Turns whatever values the product decided on into the forms its toolchain reads.
  // Copied rather than run from here: the product's build has to be able to run it,
  // and a build step that reaches back into a package it only copied from is exactly
  // the dependency this distribution avoids.
  { origin: 'tokens', from: 'brand-artifacts.cjs', to: 'tokens/brand-artifacts.cjs' },
]

export const manifest: Record<string, Item> = {
  tokens: {
    name: 'tokens',
    description: 'Colour roles, spacing, radii and the control values, as plain constants.',
    needs: [],
    files: tokenFiles,
  },

  theme: {
    name: 'theme',
    description: 'The theme, its provider, and the three ways colours can be sourced.',
    // Building a theme forces its colours to a readable contrast, so the rules for
    // measuring that come with it rather than being something to remember.
    needs: ['tokens', 'a11y'],
    files: [
      { origin: 'core', from: 'theme/types.ts', to: 'theme/types.ts' },
      { origin: 'core', from: 'theme/createTheme.ts', to: 'theme/createTheme.ts' },
      { origin: 'core', from: 'theme/ThemeProvider.tsx', to: 'theme/ThemeProvider.tsx' },
    ],
  },

  material: {
    name: 'material',
    description: 'What a surface is made of, and the adapter that reports what the platform offers.',
    needs: ['theme'],
    files: [
      { origin: 'core', from: 'material/types.ts', to: 'material/types.ts' },
      { origin: 'core', from: 'material/resolve.ts', to: 'material/resolve.ts' },
      { origin: 'core', from: 'material/fillStyle.ts', to: 'material/fillStyle.ts' },
      { origin: 'core', from: 'material/useMaterial.ts', to: 'material/useMaterial.ts' },
      { origin: 'core', from: 'material/MaterialProvider.tsx', to: 'material/MaterialProvider.tsx' },
    ],
  },

  a11y: {
    name: 'a11y',
    description: 'Contrast, as WCAG defines it.',
    needs: [],
    files: [{ origin: 'core', from: 'a11y/contrast.ts', to: 'a11y/contrast.ts' }],
  },

  surface: {
    name: 'surface',
    description: 'A panel that adopts whatever material suits the height it is at.',
    needs: ['material'],
    files: [
      { origin: 'core', from: 'components/Surface/SurfaceCore.tsx', to: 'components/Surface/SurfaceCore.tsx' },
      { origin: 'core', from: 'components/Surface/Surface.tsx', to: 'components/Surface/Surface.tsx' },
    ],
  },

  'expo-adapter': {
    name: 'expo-adapter',
    description: 'Reports what an Expo app’s platform offers, and renders its real materials.',
    needs: ['material'],
    files: [
      { origin: 'expo', from: 'capabilities.ts', to: 'adapter/capabilities.ts' },
      { origin: 'expo', from: 'materialColorScheme.ts', to: 'adapter/materialColorScheme.ts' },
      { origin: 'expo', from: 'platform.types.ts', to: 'adapter/platform.types.ts' },
      { origin: 'expo', from: 'platform.tsx', to: 'adapter/platform.tsx' },
      { origin: 'expo', from: 'platform.ios.tsx', to: 'adapter/platform.ios.tsx' },
      { origin: 'expo', from: 'platform.android.tsx', to: 'adapter/platform.android.tsx' },
      { origin: 'expo', from: 'windowBackground.ts', to: 'adapter/windowBackground.ts' },
      { origin: 'expo', from: 'navigationTheme.ts', to: 'adapter/navigationTheme.ts' },
      { origin: 'expo', from: 'DesignSystemProvider.tsx', to: 'adapter/DesignSystemProvider.tsx' },
    ],
  },

  navigation: {
    name: 'navigation',
    description: 'The platform’s own tab bar and header, dressed in the product’s colours.',
    needs: ['theme'],
    files: [
      { origin: 'expo', from: 'navigation/icons.ts', to: 'navigation/icons.ts' },
      { origin: 'expo', from: 'navigation/resolveTabBar.ts', to: 'navigation/resolveTabBar.ts' },
      { origin: 'expo', from: 'navigation/NavigationTabs.tsx', to: 'navigation/NavigationTabs.tsx' },
      { origin: 'expo', from: 'navigation/resolveHeader.ts', to: 'navigation/resolveHeader.ts' },
      { origin: 'expo', from: 'navigation/useHeaderOptions.ts', to: 'navigation/useHeaderOptions.ts' },
    ],
  },

  segmented: {
    name: 'segmented',
    description: 'Choosing between views of the same thing, with each platform’s own control.',
    // The platform-backed one reads its control out of the adapter's bindings, so
    // copying this without the adapter leaves an import with nothing on the end of it.
    needs: ['theme', 'expo-adapter'],
    files: [
      { origin: 'core', from: 'components/Segmented/resolveSegmented.ts', to: 'components/Segmented/resolveSegmented.ts' },
      { origin: 'core', from: 'components/Segmented/SegmentedCore.tsx', to: 'components/Segmented/SegmentedCore.tsx' },
      { origin: 'expo', from: 'components/Segmented.tsx', to: 'components/Segmented/Segmented.tsx' },
    ],
  },

  button: {
    name: 'button',
    description: 'A button whose colours come from the control layer, so its label stays readable.',
    // A raised button carries the shadow that matches its height, which is the
    // material layer's answer rather than the theme's.
    needs: ['material'],
    files: [
      { origin: 'core', from: 'components/Button/resolveButton.ts', to: 'components/Button/resolveButton.ts' },
      { origin: 'core', from: 'components/Button/ButtonCore.tsx', to: 'components/Button/ButtonCore.tsx' },
      { origin: 'core', from: 'components/Button/Button.tsx', to: 'components/Button/Button.tsx' },
    ],
  },
}

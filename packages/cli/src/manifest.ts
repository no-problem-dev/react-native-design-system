/**
 * What makes up each thing you can copy.
 *
 * Sources are read from the installed packages rather than from a snapshot built
 * ahead of time. A snapshot is one more thing that can fall out of step with the
 * code it describes; reading the real files means the copy is whatever the version
 * you installed actually contains.
 */

export type Origin = 'core' | 'tokens'

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

const tokenFiles: FileSpec[] = [
  { origin: 'tokens', from: 'generated/tokens.ts', to: 'tokens/tokens.ts' },
  { origin: 'tokens', from: 'types.ts', to: 'tokens/types.ts' },
  { origin: 'tokens', from: 'index.ts', to: 'tokens/index.ts' },
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
    needs: ['tokens'],
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

  button: {
    name: 'button',
    description: 'A button whose colours come from the control layer, so its label stays readable.',
    needs: ['theme'],
    files: [
      { origin: 'core', from: 'components/Button/resolveButton.ts', to: 'components/Button/resolveButton.ts' },
      { origin: 'core', from: 'components/Button/ButtonCore.tsx', to: 'components/Button/ButtonCore.tsx' },
      { origin: 'core', from: 'components/Button/Button.tsx', to: 'components/Button/Button.tsx' },
    ],
  },
}

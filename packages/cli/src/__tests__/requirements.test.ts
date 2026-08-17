import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { prepare } from '../copy.js'
import { manifest } from '../manifest.js'
import { declarationsNear, missingRequirements, requirements } from '../requirements.js'

const require = createRequire(import.meta.url)

describe('what a copy needs from the project it lands in', () => {
  it('reads the packages out of the files, not out of a list', () => {
    const files = [
      { path: 'a.ts', content: "import { View } from 'react-native'\nimport { x } from './local'\n" },
      { path: 'b.ts', content: "import { readFileSync } from 'node:fs'\nimport y from 'expo-system-ui'\n" },
    ]
    expect(requirements(files)).toEqual(['expo-system-ui', 'react-native'])
  })

  it('treats a deep path as the package it is in', () => {
    const files = [
      { path: 'a.ts', content: "import { Host } from '@expo/ui/swift-ui'\nimport z from 'expo-router/build/x'\n" },
    ]
    expect(requirements(files)).toEqual(['@expo/ui', 'expo-router'])
  })

  it('sees a side-effect import and a require', () => {
    const files = [
      { path: 'a.ts', content: "import 'react-native-gesture-handler'\n" },
      { path: 'b.cjs', content: "const sd = require('style-dictionary')\n" },
    ]
    expect(requirements(files)).toEqual(['react-native-gesture-handler', 'style-dictionary'])
  })

  it('asks for nothing from the design system itself — those imports were rewritten', () => {
    const required = requirements(prepare(Object.keys(manifest), '0.0.0-test'))
    expect(required.filter((name) => name.startsWith('@no-problem/'))).toEqual([])
  })

  // The break this exists for: the Expo adapter grew an import of `expo-system-ui`,
  // nothing said so, and the first thing to mention it was a compiler error inside
  // a copy that had already been written.
  it('names what the Expo adapter cannot compile without', () => {
    expect(requirements(prepare(['expo-adapter'], '0.0.0-test'))).toContain('expo-system-ui')
  })

  it('never imports a package none of the source packages declare', () => {
    const declared = new Set<string>()
    for (const name of ['@no-problem/design-system', '@no-problem/design-system-expo', '@no-problem/design-tokens']) {
      const parsed = JSON.parse(readFileSync(require.resolve(`${name}/package.json`), 'utf8')) as Record<string, unknown>
      for (const field of ['dependencies', 'peerDependencies']) {
        const block = parsed[field]
        if (typeof block === 'object' && block !== null) for (const each of Object.keys(block)) declared.add(each)
      }
    }

    const undeclared = requirements(prepare(Object.keys(manifest), '0.0.0-test'))
      .filter((name) => !name.startsWith('@no-problem/'))
      .filter((name) => !declared.has(name))

    expect(undeclared, 'imported by a copied file but declared by no source package').toEqual([])
  })
})

describe('reading what the destination declares', () => {
  it('finds the nearest package.json above the destination', () => {
    const root = mkdtempSync(join(tmpdir(), 'ds-requirements-'))
    try {
      writeFileSync(
        join(root, 'package.json'),
        JSON.stringify({ dependencies: { 'react-native': '*' }, peerDependencies: { react: '*' } }),
      )
      const found = declarationsNear(join(root, 'src', 'design-system'))

      expect(found?.manifestPath).toBe(join(root, 'package.json'))
      expect(missingRequirements(['react', 'react-native', 'expo-system-ui'], found)).toEqual(['expo-system-ui'])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('claims nothing is missing when there is no package.json to read', () => {
    expect(missingRequirements(['react'], null)).toEqual([])
  })
})

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { prepare, write } from '../copy.js'
import { manifest } from '../manifest.js'
import { provenance, resolveItems, rewriteImports } from '../transform.js'

describe('working out what to copy', () => {
  it('brings whatever an item needs', () => {
    const names = resolveItems(['surface']).map((item) => item.name)
    expect(names).toEqual(['tokens', 'theme', 'material', 'surface'])
  })

  it('writes a dependency before the thing that needs it', () => {
    for (const item of resolveItems(['surface', 'button'])) {
      const before = resolveItems(['surface', 'button'])
        .slice(0, resolveItems(['surface', 'button']).indexOf(item))
        .map((each) => each.name)
      for (const need of item.needs) expect(before, `${item.name} needs ${need}`).toContain(need)
    }
  })

  it('copies a shared dependency once, however many ask for it', () => {
    const names = resolveItems(['surface', 'button']).map((item) => item.name)
    expect(names.filter((name) => name === 'tokens')).toHaveLength(1)
  })

  it('says so when asked for something that does not exist', () => {
    expect(() => resolveItems(['dropdown'])).toThrow(/No such item: dropdown/)
  })

  it('every declared dependency is a real item', () => {
    for (const item of Object.values(manifest)) {
      for (const need of item.needs) expect(manifest[need], `${item.name} → ${need}`).toBeDefined()
    }
  })
})

describe('pointing a copied file at its neighbours', () => {
  it('replaces the package import with a path back to the copied tokens', () => {
    expect(rewriteImports(`import { spacing } from '@no-problem/design-tokens'`, 'theme/types.ts')).toBe(
      `import { spacing } from '../tokens'`,
    )
  })

  it('counts the depth of where the file lands', () => {
    expect(rewriteImports(`from '@no-problem/design-tokens'`, 'components/Surface/Surface.tsx')).toBe(
      `from '../../tokens'`,
    )
    expect(rewriteImports(`from '@no-problem/design-tokens'`, 'index.ts')).toBe(`from './tokens'`)
  })

  it('flattens the generated file away, since the copy has no build step', () => {
    expect(rewriteImports(`export { spacing } from './generated/tokens.js'`, 'tokens/index.ts')).toBe(
      `export { spacing } from './tokens'`,
    )
  })

  it('drops the extension from relative imports, which a copy has no build step to resolve', () => {
    expect(rewriteImports(`import { useTheme } from '../../theme/ThemeProvider.js'`, 'a/b/c.tsx')).toBe(
      `import { useTheme } from '../../theme/ThemeProvider'`,
    )
  })

  it('leaves the extensionless platform import alone', () => {
    const line = `import { bindings } from './platform'`
    expect(rewriteImports(line, 'adapter/DesignSystemProvider.tsx')).toBe(line)
  })

  it('rewrites every occurrence, not just the first', () => {
    const source = `import a from '@no-problem/design-tokens'\nimport type b from '@no-problem/design-tokens'`
    expect(rewriteImports(source, 'a/b.ts')).not.toContain('@no-problem/design-tokens')
  })
})

describe('the note left on a copied file', () => {
  const note = provenance('1.2.3')

  it('records the version, so drift can be measured against something', () => {
    expect(note).toContain('@no-problem/design-system@1.2.3')
  })

  it('carries no path, account or link into the receiving repository', () => {
    expect(note).not.toMatch(/https?:\/\//)
    expect(note).not.toMatch(/\/Users\//)
    expect(note).not.toMatch(/github/i)
  })
})

describe('what actually gets produced', () => {
  const files = prepare(['surface', 'button'], '1.2.3')
  const paths = files.map((file) => file.path)

  it('produces an entry point alongside the files', () => {
    expect(paths).toContain('index.ts')
  })

  it('leaves nothing pointing at a package the destination will not have', () => {
    for (const file of files) {
      expect(file.content, file.path).not.toContain(`'@no-problem/design-tokens'`)
      expect(file.content, file.path).not.toContain(`'@no-problem/design-system'`)
    }
  })

  it('leaves no relative import carrying a file extension', () => {
    for (const file of files) {
      expect(file.content, file.path).not.toMatch(/from '\.{1,2}\/[^']*\.js'/)
    }
  })

  it('marks every file with where it came from, except the ones that cannot carry a note', () => {
    for (const file of files) {
      if (file.path.endsWith('.json')) continue // a comment would make it invalid
      expect(file.content, file.path).toContain('@no-problem/design-system@1.2.3')
    }
  })

  it('leaves data files exactly as they are', () => {
    const data = files.filter((file) => file.path.endsWith('.json'))
    expect(data.length).toBeGreaterThan(0)
    for (const file of data) expect(() => JSON.parse(file.content)).not.toThrow()
  })

  it('writes each path once', () => {
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('is the same twice, so a diff means a real change', () => {
    expect(prepare(['surface', 'button'], '1.2.3')).toEqual(files)
  })
})

describe('adding to a copy that already exists', () => {
  it('keeps the entry point speaking for everything, not only the newest request', () => {
    const directory = mkdtempSync(join(tmpdir(), 'design-system-'))

    write(directory, prepare(['surface'], '1.0.0'), false)
    const afterFirst = readFileSync(join(directory, 'index.ts'), 'utf8')
    expect(afterFirst).toContain('components/Surface/Surface')

    // A second, unrelated item. The files from the first are still on disk, so an
    // entry point that forgot them would be wrong about its own directory.
    write(directory, prepare(['button'], '1.0.0'), false)
    const afterSecond = readFileSync(join(directory, 'index.ts'), 'utf8')

    expect(afterSecond).toContain('components/Surface/Surface')
    expect(afterSecond).toContain('components/Button/Button')

    rmSync(directory, { recursive: true, force: true })
  })

  it('leaves the entry point alone when nothing new was added', () => {
    const directory = mkdtempSync(join(tmpdir(), 'design-system-'))

    write(directory, prepare(['surface'], '1.0.0'), false)
    const before = readFileSync(join(directory, 'index.ts'), 'utf8')
    write(directory, prepare(['surface'], '1.0.0'), false)

    expect(readFileSync(join(directory, 'index.ts'), 'utf8')).toBe(before)
    rmSync(directory, { recursive: true, force: true })
  })
})

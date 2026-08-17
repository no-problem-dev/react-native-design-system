import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import type { FileSpec, Item } from './manifest.js'
import { layout } from './manifest.js'
import { readSource, versionOfDesignSystem } from './sources.js'
import { provenance, resolveItems, rewriteImports } from './transform.js'

export type PreparedFile = {
  /** Path under the destination directory. */
  path: string
  /** What should be there. */
  content: string
}

/** The exact bytes each requested item should produce, without touching the disk. */
export function prepare(names: string[], version = versionOfDesignSystem()): PreparedFile[] {
  const items = resolveItems(names)
  const header = provenance(version)
  // Where every file lands, not only the ones this call asked for: a relative import
  // has to be re-pointed the same way whatever else was requested alongside it.
  const where = layout()

  const files = items.flatMap((item: Item) =>
    item.files.map((spec) => ({
      path: spec.to,
      // JSON carries no imports and no comments — writing a header into it would
      // make it invalid.
      content: spec.to.endsWith('.json')
        ? readSource(spec)
        : header + rewriteImports(readSource(spec), spec, where),
    })),
  )

  return [...files, { path: 'index.ts', content: header + barrel(exportable(items)) }]
}

/** The paths an entry point should re-export, for a set of items. */
function exportable(items: Item[]): string[] {
  return items
    .flatMap((item) => item.files)
    .filter(isExportable)
    .map((spec) => spec.to)
}

/**
 * Everything from the platform package is left out on purpose.
 *
 * Those files reach the shared core through the design system's own name, which the
 * copy rewrites to the entry point. Exporting them back from that entry point closes
 * a loop — one that works until the day a bundler evaluates the modules in the other
 * order and something reads a binding that has not been assigned yet. The bundler
 * warns about the cycle; the failure it warns about arrives much later.
 *
 * So a platform-backed component is imported from its own path. That is a small cost
 * at the call site and the only version of this that cannot break.
 *
 * Anything that is not TypeScript is left out too. The entry point speaks for what
 * the app imports, and a file the build tools read — the token data, the generator a
 * Tailwind config calls — is not part of that graph. Re-exporting one only asks
 * TypeScript for types it was never going to have.
 */
function isExportable(spec: FileSpec): boolean {
  if (spec.origin === 'expo') return false
  if (spec.to.endsWith('index.ts')) return false
  return /\.tsx?$/.test(spec.to)
}

/** One entry point, so the copy is usable the moment it lands. */
function barrel(paths: string[]): string {
  const lines = ['// Everything that was copied. Add to it as you copy more.', '']
  for (const path of [...new Set(paths)].sort()) {
    lines.push(`export * from './${path.replace(/\.tsx?$/, '')}'`)
  }
  return `${lines.join('\n')}\n`
}

export type WriteReport = {
  written: string[]
  unchanged: string[]
  wouldOverwrite: string[]
}

export function write(destination: string, files: PreparedFile[], force: boolean): WriteReport {
  const report: WriteReport = { written: [], unchanged: [], wouldOverwrite: [] }

  // The entry point has to speak for everything in the directory, not only for
  // what this run was asked to copy. Rebuilding it from the request alone drops
  // whatever was copied earlier — silently, since the files are all still there.
  const withMergedIndex = files.map((file) =>
    file.path === 'index.ts'
      ? { path: file.path, content: mergeIndex(destination, file.content) }
      : file,
  )

  for (const file of withMergedIndex) {
    const target = join(destination, file.path)
    const existing = read(target)

    if (existing === file.content) {
      report.unchanged.push(file.path)
      continue
    }
    // The entry point is merged rather than replaced, so writing it loses nothing
    // that was there. Every other file may have been edited on purpose.
    if (existing !== null && !force && file.path !== 'index.ts') {
      report.wouldOverwrite.push(file.path)
      continue
    }

    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, file.content)
    report.written.push(file.path)
  }

  return report
}

export type Drift = {
  path: string
  state: 'missing' | 'changed' | 'same'
}

/**
 * Compare what is on disk with what this version would produce.
 *
 * The weakness of copying is that upstream fixes never arrive. This is the answer
 * to that: it says which files have moved apart, so the choice to take a change or
 * leave it is a choice rather than an oversight.
 */
export function drift(destination: string, files: PreparedFile[]): Drift[] {
  return files.map((file) => {
    const existing = read(join(destination, file.path))
    if (existing === null) return { path: file.path, state: 'missing' as const }
    return { path: file.path, state: existing === file.content ? ('same' as const) : ('changed' as const) }
  })
}

/** Keep every export line the existing entry point already had. */
function mergeIndex(destination: string, generated: string): string {
  const existing = read(join(destination, 'index.ts'))
  if (existing === null) return generated

  const lines = (text: string) => text.split('\n').filter((line) => line.startsWith('export * from '))
  const merged = [...new Set([...lines(existing), ...lines(generated)])].sort()
  const preamble = generated.split('\n').filter((line) => !line.startsWith('export * from '))

  return [...preamble.filter((line) => line !== ''), '', ...merged, ''].join('\n')
}

function read(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

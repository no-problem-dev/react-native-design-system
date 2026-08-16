import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import type { Item } from './manifest.js'
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

  const files = items.flatMap((item: Item) =>
    item.files.map((spec) => ({
      path: spec.to,
      // JSON carries no imports and no comments — writing a header into it would
      // make it invalid.
      content: spec.to.endsWith('.json')
        ? readSource(spec)
        : header + rewriteImports(readSource(spec), spec.to),
    })),
  )

  return [...files, { path: 'index.ts', content: header + barrel(exportable(items)) }]
}

/** The paths an entry point should re-export, for a set of items. */
function exportable(items: Item[]): string[] {
  return items.flatMap((item) => item.files.map((spec) => spec.to)).filter(isExportable)
}

/**
 * The adapter and the navigation chrome are left out on purpose. Both import from
 * the entry point, and exporting them back would close a loop between them — one
 * that works until the day a bundler evaluates the modules in the other order.
 */
function isExportable(path: string): boolean {
  if (path.endsWith('index.ts') || path.endsWith('.json')) return false
  return !path.startsWith('adapter/') && !path.startsWith('navigation/')
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

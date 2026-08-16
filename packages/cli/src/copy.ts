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
      content: header + rewriteImports(readSource(spec), spec.to),
    })),
  )

  return [...files, { path: 'index.ts', content: header + barrel(items) }]
}

/**
 * One entry point, so the copy is usable the moment it lands.
 *
 * The adapter is left out on purpose. It imports from this file, and putting it
 * back in here would close a loop between them — a loop that works until the day
 * a bundler evaluates the modules in the other order.
 */
function barrel(items: Item[]): string {
  const lines = ['// Everything that was copied. Add to it as you copy more.', '']

  for (const item of items) {
    for (const spec of item.files) {
      if (spec.to.endsWith('index.ts')) continue
      if (spec.to.startsWith('adapter/')) continue
      if (spec.to.startsWith('navigation/')) continue
      lines.push(`export * from './${spec.to.replace(/\.tsx?$/, '')}'`)
    }
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

  for (const file of files) {
    const target = join(destination, file.path)
    const existing = read(target)

    if (existing === file.content) {
      report.unchanged.push(file.path)
      continue
    }
    if (existing !== null && !force) {
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

function read(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

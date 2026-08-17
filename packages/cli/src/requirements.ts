import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'

import type { PreparedFile } from './copy.js'

/**
 * What a copy needs from the project it lands in.
 *
 * Read out of the files themselves rather than written down per item. A list kept
 * by hand is one more thing that falls out of step with the code it describes, and
 * this one would have: an adapter grew an import of `expo-system-ui`, no list said
 * so, and the first thing to mention it was a compiler error inside the copy.
 *
 * Deriving it means the answer is whatever the files being written actually import,
 * for whatever version was installed.
 */

/** `from '…'`, a side-effect `import '…'`, and `require('…')`. */
const SPECIFIERS = [
  /\bfrom\s*(['"])([^'"]+)\1/g,
  /\bimport\s*(['"])([^'"]+)\1/g,
  /\brequire\(\s*(['"])([^'"]+)\1/g,
]

/** `@scope/name/deep/path` and `name/deep/path` both name one package. */
function packageOf(specifier: string): string {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? specifier)
}

/** The packages these files import from outside themselves, in a stable order. */
export function requirements(files: PreparedFile[]): string[] {
  const found = new Set<string>()

  for (const file of files) {
    for (const pattern of SPECIFIERS) {
      for (const match of file.content.matchAll(pattern)) {
        const specifier = match[2]
        if (specifier === undefined) continue
        // Relative imports are the copy talking to itself; `node:` is the runtime.
        if (specifier.startsWith('.') || specifier.startsWith('node:')) continue
        found.add(packageOf(specifier))
      }
    }
  }

  return [...found].sort()
}

export type Declarations = {
  /** Where the answer came from, so a missing package can be added to the right file. */
  manifestPath: string
  declared: Set<string>
}

/**
 * The nearest package.json at or above a directory, and everything it declares.
 *
 * Every kind of dependency counts. Whether the receiving project calls something a
 * dependency or a peer is its own business; the only question here is whether the
 * name is written down somewhere, because that is what decides if the import
 * resolves.
 */
export function declarationsNear(directory: string): Declarations | null {
  let current = isAbsolute(directory) ? directory : resolve(directory)

  for (;;) {
    const candidate = join(current, 'package.json')
    const parsed = readJson(candidate)

    if (parsed !== null) {
      const declared = new Set<string>()
      for (const field of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
        const block = (parsed as Record<string, unknown>)[field]
        if (typeof block === 'object' && block !== null) {
          for (const name of Object.keys(block)) declared.add(name)
        }
      }
      return { manifestPath: candidate, declared }
    }

    const parent = dirname(current)
    if (parent === current) return null
    current = parent
  }
}

/** The requirements the destination has not declared. Empty when nothing is missing. */
export function missingRequirements(required: string[], declarations: Declarations | null): string[] {
  if (declarations === null) return []
  return required.filter((name) => !declarations.declared.has(name))
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown
  } catch {
    return null
  }
}

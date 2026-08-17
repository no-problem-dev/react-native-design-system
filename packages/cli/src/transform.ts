import { dirname, join, normalize, relative } from 'node:path/posix'

import type { FileSpec, Item } from './manifest.js'
import { layout, manifest } from './manifest.js'

/**
 * Everything needed for the requested items, in an order where nothing is written
 * before what it depends on. Asking twice for the same thing is not an error.
 */
export function resolveItems(names: string[]): Item[] {
  const seen = new Set<string>()
  const ordered: Item[] = []

  const visit = (name: string, trail: string[]): void => {
    if (seen.has(name)) return
    if (trail.includes(name)) throw new Error(`Items depend on each other: ${[...trail, name].join(' → ')}`)

    const item = manifest[name]
    if (item === undefined) {
      throw new Error(`No such item: ${name}. Known items: ${Object.keys(manifest).join(', ')}`)
    }

    for (const need of item.needs) visit(need, [...trail, name])
    seen.add(name)
    ordered.push(item)
  }

  for (const name of names) visit(name, [])
  return ordered
}

/**
 * A note about where a file came from.
 *
 * Just the package and the version. No paths, no accounts, no links: a copied file
 * ends up in someone else's repository, and the point of this line is to make drift
 * detectable, not to plant a signature.
 */
export function provenance(version: string): string {
  return [
    `// Copied from @no-problem/design-system@${version}.`,
    '// Edit freely. Running `design-system diff` will then show what you changed',
    '// and what moved upstream, which is the only way a copy stays honest.',
    '',
  ].join('\n')
}

const TOKENS_IMPORT = /(['"])@no-problem\/design-tokens\1/g
const CORE_IMPORT = /(['"])@no-problem\/design-system\1/g
/** A relative specifier in an import, an export, or a require. */
const RELATIVE_SPECIFIER = /(\bfrom\s*|\bimport\s*|\brequire\(\s*)(['"])(\.{1,2}\/[^'"]*)\2/g

/**
 * Point a copied file at its neighbours instead of at packages that will not be
 * installed where it is going.
 *
 * Every relative import is resolved through the manifest rather than carried over as
 * written. The destination layout is deliberately not the source layout, so a path
 * that was correct in `src` can name nothing once copied — which is exactly what
 * happened to the platform-backed Segmented, and only showed up as a missing module
 * after the files had been written.
 *
 * A specifier the manifest does not know is left pointing where it pointed, minus
 * its extension. That is the honest answer: nothing here can say where a file that
 * is not copied ought to live.
 *
 * Extensions are dropped on the way out. They are written in the source because it
 * is published as ESM and compiled first; a copy has no build step and joins the
 * receiving project's own module graph, where `'./types.js'` names a file that does
 * not exist. Bundlers forgive that. Test runners do not, and finding out in someone
 * else's repository is the worst place to find out.
 */
export function rewriteImports(source: string, spec: FileSpec, where: Map<string, string> = layout()): string {
  const depth = spec.to.split('/').length - 1
  const upwards = depth === 0 ? './' : '../'.repeat(depth)

  return source
    .replace(TOKENS_IMPORT, `'${upwards}tokens'`)
    .replace(CORE_IMPORT, `'${upwards}index'`)
    .replace(RELATIVE_SPECIFIER, (_whole, prefix: string, quote: string, specifier: string) => {
      const target = retarget(specifier, spec, where) ?? withoutExtension(specifier)
      return `${prefix}${quote}${target}${quote}`
    })
}

/** Where a relative specifier ends up, once both files have been copied. */
function retarget(specifier: string, spec: FileSpec, where: Map<string, string>): string | null {
  const stem = withoutExtension(normalize(join(dirname(spec.from), specifier)))

  // The source writes `.js` for what is a `.ts` file on disk, and some entries carry
  // no extension at all, so the stem is what identifies the file.
  for (const extension of ['.ts', '.tsx', '.cjs', '.json', '.js', '']) {
    const destination = where.get(`${spec.origin}:${stem}${extension}`)
    if (destination === undefined) continue

    const path = withoutExtension(relative(dirname(spec.to), destination))
    return path.startsWith('.') ? path : `./${path}`
  }
  return null
}

/** Data files keep theirs: nothing resolves `tokens.json` by guessing. */
function withoutExtension(path: string): string {
  return path.replace(/\.(tsx?|jsx?)$/, '')
}

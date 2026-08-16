import type { Item } from './manifest.js'
import { manifest } from './manifest.js'

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
const GENERATED_IMPORT = /(['"])\.\/generated\/tokens\.js\1/g

/**
 * Point a copied file at its neighbours instead of at packages that will not be
 * installed where it is going.
 *
 * `destinationPath` is where the file lands under the destination root; how deep it
 * sits is what decides the relative path back up to the copied tokens.
 */
export function rewriteImports(source: string, destinationPath: string): string {
  const depth = destinationPath.split('/').length - 1
  const upwards = depth === 0 ? './' : '../'.repeat(depth)

  return source
    .replace(TOKENS_IMPORT, `'${upwards}tokens/index.js'`)
    .replace(CORE_IMPORT, `'${upwards}index.js'`)
    .replace(GENERATED_IMPORT, `'./tokens.js'`)
}

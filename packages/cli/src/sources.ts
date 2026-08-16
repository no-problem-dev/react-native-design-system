import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import type { FileSpec, Origin } from './manifest.js'

const require = createRequire(import.meta.url)

const packageOf: Record<Origin, string> = {
  core: '@no-problem/design-system',
  tokens: '@no-problem/design-tokens',
  expo: '@no-problem/design-system-expo',
}

function rootOf(origin: Origin): string {
  return dirname(require.resolve(`${packageOf[origin]}/package.json`))
}

export function versionOfDesignSystem(): string {
  const manifestPath = require.resolve('@no-problem/design-system/package.json')
  const parsed: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const version = (parsed as { version?: unknown }).version
  return typeof version === 'string' ? version : '0.0.0'
}

/** Read a file straight out of the installed package. */
export function readSource(spec: FileSpec): string {
  return readFileSync(join(rootOf(spec.origin), 'src', spec.from), 'utf8')
}

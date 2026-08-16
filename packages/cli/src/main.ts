#!/usr/bin/env node
/**
 * Copy the design system into a project that cannot depend on it.
 *
 * Some projects should not carry a dependency on a package one person controls —
 * a fix they need would wait on someone else's review. Copying removes that, at
 * the cost of upstream fixes never arriving on their own. `diff` is what makes
 * that cost visible instead of silent.
 */
import { drift, prepare, write } from './copy.js'
import { manifest } from './manifest.js'
import { versionOfDesignSystem } from './sources.js'

const usage = `
design-system — copy components into a project

  design-system list
  design-system add <item…> --dest <dir> [--force]
  design-system diff <item…> --dest <dir>

Items:
${Object.values(manifest)
  .map((item) => `  ${item.name.padEnd(10)} ${item.description}`)
  .join('\n')}

Whatever an item needs is copied with it. Files already present are left alone
unless --force is given, so your edits survive.
`

function flagValue(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name)
  return index === -1 ? undefined : argv[index + 1]
}

function itemNames(argv: string[]): string[] {
  return argv.slice(1).filter((value, index, all) => {
    if (value.startsWith('--')) return false
    return !all[index - 1]?.startsWith('--') || all[index - 1] === '--force'
  })
}

function main(argv: string[]): number {
  const command = argv[0]

  if (command === undefined || command === 'help' || command === '--help') {
    process.stdout.write(usage)
    return 0
  }

  if (command === 'list') {
    process.stdout.write(`@no-problem/design-system@${versionOfDesignSystem()}\n\n`)
    for (const item of Object.values(manifest)) {
      const needs = item.needs.length === 0 ? '' : `  (brings ${item.needs.join(', ')})`
      process.stdout.write(`  ${item.name.padEnd(10)} ${item.description}${needs}\n`)
    }
    return 0
  }

  const destination = flagValue(argv, '--dest')
  if (destination === undefined) {
    process.stderr.write('Missing --dest <dir>: where should the files go?\n')
    return 1
  }

  const names = itemNames(argv)
  if (names.length === 0) {
    process.stderr.write(`Nothing to ${command}. Try: design-system ${command} surface --dest ${destination}\n`)
    return 1
  }

  let files
  try {
    files = prepare(names)
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }

  if (command === 'add') {
    const report = write(destination, files, argv.includes('--force'))

    for (const path of report.written) process.stdout.write(`  written    ${path}\n`)
    for (const path of report.unchanged) process.stdout.write(`  unchanged  ${path}\n`)
    for (const path of report.wouldOverwrite) process.stdout.write(`  kept       ${path}  (yours differs — --force to replace)\n`)

    if (report.wouldOverwrite.length > 0) {
      process.stdout.write('\nFiles you had already changed were kept. `diff` shows what moved upstream.\n')
    }
    return 0
  }

  if (command === 'diff') {
    const results = drift(destination, files)
    const interesting = results.filter((result) => result.state !== 'same')

    if (interesting.length === 0) {
      process.stdout.write(`In step with @no-problem/design-system@${versionOfDesignSystem()}.\n`)
      return 0
    }

    for (const result of interesting) process.stdout.write(`  ${result.state.padEnd(8)} ${result.path}\n`)
    process.stdout.write('\nchanged = yours and upstream have moved apart. missing = never copied.\n')
    return 1
  }

  process.stderr.write(`Unknown command: ${command}\n${usage}`)
  return 1
}

process.exit(main(process.argv.slice(2)))

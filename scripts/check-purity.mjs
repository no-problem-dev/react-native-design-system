#!/usr/bin/env node
/**
 * Purity check — fails if anything private leaked into this public repository.
 *
 * This package is developed alongside private client work. Nothing from that
 * context may appear here: not identifiers, not domain words, not even a comment.
 * Once published, a leak cannot be taken back — it lives on in clones, in the
 * npm tarball, and in search indexes.
 *
 * The forbidden terms are base64-encoded on purpose. Writing them in plain text
 * would put the very words we are trying to keep out into this file, and this
 * file is published with everything else.
 *
 * Run: node scripts/check-purity.mjs
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { extname } from 'node:path'

const ENCODED_TERMS =
  'WyJ0Y2dwcm8iLCAia2FpdG9yaSIsICJ0b3JldXJ1IiwgImNhcmQtcHJpY2UtZGV2IiwgImthaWt5byIsICJrZG1nczExMCIsICLjgqvjgqTjg4jjg6wiLCAi44OI44Os44Km44OrIiwgIuiyt+WPliIsICLjg53jgrHjgqsiLCAi44Od44Kx44Oi44Oz44Kr44O844OJIiwgIuODiOODrOOCqyIsICLnlLLmlpDjgZXjgpMiLCAi5rKz5ZCI44GV44KTIiwgIuWyuOeUsOOBleOCkyIsICJuby1wcm9ibGVtLWt5b2ljaGkiXQ=='

const terms = JSON.parse(Buffer.from(ENCODED_TERMS, 'base64').toString('utf8'))

/** Patterns safe to write in the clear: they name no one. */
const GENERIC = [
  { re: /\/Users\/[A-Za-z0-9._-]+\//, label: 'absolute home path' },
  { re: /~\/(life|clients)\b/, label: 'personal directory' },
  { re: /\bPSA\s?10\b/i, label: 'client domain word' },
]

const SKIP_DIRS = /(^|\/)(node_modules|\.git|dist|lib|build|coverage|\.expo)(\/|$)/
const BINARY = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf',
  '.ttf', '.otf', '.woff', '.woff2', '.zip', '.mp4', '.keystore',
])

const SELF = 'scripts/check-purity.mjs'

function trackedFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  return out.split('\0').filter(Boolean)
}

function shouldScan(file) {
  if (file === SELF) return false
  if (SKIP_DIRS.test(file)) return false
  if (BINARY.has(extname(file).toLowerCase())) return false
  try {
    if (statSync(file).size > 2_000_000) return false
  } catch {
    return false
  }
  return true
}

const findings = []

for (const file of trackedFiles()) {
  if (!shouldScan(file)) continue

  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const lines = text.split('\n')

  lines.forEach((line, i) => {
    const lower = line.toLowerCase()
    for (const term of terms) {
      if (lower.includes(term.toLowerCase())) {
        findings.push({ file, line: i + 1, label: 'private context', hint: term.length })
      }
    }
    for (const { re, label } of GENERIC) {
      if (re.test(line)) findings.push({ file, line: i + 1, label, hint: line.trim().slice(0, 60) })
    }
  })
}

if (findings.length === 0) {
  console.log('purity: clean')
  process.exit(0)
}

console.error(`purity: ${findings.length} finding(s)\n`)
for (const f of findings) {
  // Deliberately vague about *which* term matched, so the CI log does not
  // reproduce the thing we are keeping out of the repository.
  console.error(`  ${f.file}:${f.line}  ${f.label}`)
}
console.error('\nRemove the private context before publishing. Comments count.')
process.exit(1)

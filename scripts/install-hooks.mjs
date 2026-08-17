#!/usr/bin/env node
/**
 * Point git at the hooks kept in this repository.
 *
 * Runs from `prepare`, so cloning and installing is all it takes — there is no
 * separate step to remember, and a hook nobody installed is not a hook.
 *
 * Hooks live in `.githooks/` rather than `.git/hooks/` so they are versioned with
 * the code they check.
 */
import { execFileSync } from 'node:child_process'

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' })
} catch {
  // Not a git checkout — an extracted tarball, or a CI cache restore. Nothing to hook.
}

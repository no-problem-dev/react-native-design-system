// Metro has to look outside this app: the design system lives in sibling packages
// and is consumed from source, so their files must be watched.
//
// Nothing else is overridden. The package manager here nests dependencies rather
// than hoisting them, so Metro must keep walking up through each `node_modules`
// to find a package's own dependencies — turning that off resolves the top-level
// packages and then fails on everything they depend on.
const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')

const projectRoot = __dirname
const config = getDefaultConfig(projectRoot)

config.watchFolders = [path.resolve(projectRoot, '../..')]

module.exports = config

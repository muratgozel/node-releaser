#!/usr/bin/env node

const yargs = require('yargs')
const lib = require('./index')

function registerLevelPositioners(yargs) {
  yargs.positional('message', {
    type: 'string',
    alias: 'm',
    describe: 'Commit message. Can be specified multiple times to create multiline commit messages.'
  })

  yargs.positional('current-tag', {
    type: 'string',
    default: '',
    describe: 'Take this as current tag. It won\'t query git for the current tag.'
  })

  yargs.positional('force-calver-format', {
    type: 'boolean',
    default: false,
    describe: 'Request a new tag based on a new calver format.'
  })
}

yargs
  .scriptName('releaser')
  .usage(`releaser <cmd> [args]`)
  .command(
    'calendar', '[calver] Updates date based on the current date time.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar', argv)}
  )
  .command(
    'calendar.major', '[calver] Updates calendar and major tags.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar.major', argv)}
  )
  .command(
    'calendar.minor', '[calver] Updates calendar and minor tags.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar.minor', argv)}
  )
  .command(
    'calendar.patch', '[calver] Updates calendar and patch tags.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar.patch', argv)}
  )
  .command(
    'calendar.dev', '[calver] Updates calendar tags and adds modifier tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar.dev', argv)}
  )
  .command(
    'calendar.alpha', '[calver] Updates calendar tags and adds modifier tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar.alpha', argv)}
  )
  .command(
    'calendar.beta', '[calver] Updates calendar tags and adds modifier tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar.beta', argv)}
  )
  .command(
    'calendar.rc', '[calver] Updates calendar tags and adds modifier tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('calendar.rc', argv)}
  )
  .command(
    'dev', '[calver] Increments the dev tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('dev', argv)}
  )
  .command(
    'alpha', '[calver] Increments the alpha tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('alpha', argv)}
  )
  .command(
    'beta', '[calver] Increments the beta tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('beta', argv)}
  )
  .command(
    'rc', '[calver] Increments the rc tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('rc', argv)}
  )
  .command(
    'major', '[semver, calver] Increments major tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('major', argv)}
  )
  .command(
    'minor', '[semver, calver] Increments minor tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('minor', argv)}
  )
  .command(
    'patch', '[semver, calver] Increments patch tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('patch', argv)}
  )
  .command(
    'major.dev', '[calver] Increments major tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('major.dev', argv)}
  )
  .command(
    'major.alpha', '[calver] Increments major tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('major.alpha', argv)}
  )
  .command(
    'major.beta', '[calver] Increments major tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('major.beta', argv)}
  )
  .command(
    'major.rc', '[calver] Increments major tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('major.rc', argv)}
  )
  .command(
    'minor.dev', '[calver] Increments minor tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('minor.dev', argv)}
  )
  .command(
    'minor.alpha', '[calver] Increments minor tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('minor.alpha', argv)}
  )
  .command(
    'minor.beta', '[calver] Increments minor tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('minor.beta', argv)}
  )
  .command(
    'minor.rc', '[calver] Increments minor tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('minor.rc', argv)}
  )
  .command(
    'patch.dev', '[calver] Increments patch tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('patch.dev', argv)}
  )
  .command(
    'patch.alpha', '[calver] Increments patch tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('patch.alpha', argv)}
  )
  .command(
    'patch.beta', '[calver] Increments patch tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('patch.beta', argv)}
  )
  .command(
    'patch.rc', '[calver] Increments patch tag and adds modifier.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('patch.rc', argv)}
  )
  .command(
    'premajor.dev', '[semver] Creates new major version with a dev tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('premajor.dev', argv)}
  )
  .command(
    'premajor.alpha', '[semver] Creates new major version with an alpha tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('premajor.alpha', argv)}
  )
  .command(
    'premajor.beta', '[semver] Creates new major version with a beta tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('premajor.beta', argv)}
  )
  .command(
    'premajor.rc', '[semver] Creates new major version with an rc tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('premajor.rc', argv)}
  )
  .command(
    'preminor.dev', '[semver] Creates a new minor version with a dev tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('preminor.dev', argv)}
  )
  .command(
    'preminor.alpha', '[semver] Creates a new minor version with an alpha tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('preminor.alpha', argv)}
  )
  .command(
    'preminor.beta', '[semver] Creates a new minor version with a beta tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('preminor.beta', argv)}
  )
  .command(
    'preminor.rc', '[semver] Creates a new minor version with an rc tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('preminor.rc', argv)}
  )
  .command(
    'prepatch.dev', '[semver] Creates a new patch version with a dev tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('prepatch.dev', argv)}
  )
  .command(
    'prepatch.alpha', '[semver] Creates a new patch version with an alpha tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('prepatch.alpha', argv)}
  )
  .command(
    'prepatch.beta', '[semver] Creates a new patch version with a beta tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('prepatch.beta', argv)}
  )
  .command(
    'prepatch.rc', '[semver] Creates a new patch version with an rc tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('prepatch.rc', argv)}
  )
  .command(
    'prerelease', '[semver] Increments the modifier tag.', registerLevelPositioners,
    async argv => {await lib.createReleaseByLevelCLI('prerelease', argv)}
  )
  .help()
  .argv

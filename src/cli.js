#!/usr/bin/env node

const yargs = require('yargs')
const lib = require('./index')

function registerLevelPositioners(yargs) {
  yargs.positional('message', {
    type: 'string',
    alias: 'm',
    describe: 'Commit message. Can be specified multiple times to create multiline commit messages.'
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
    'major',
    '[semver, calver] Creates a major release',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('major', argv)
    }
  )
  .command(
    'minor',
    '[semver, calver] Creates a minor release',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('minor', argv)
    }
  )
  .command(
    'patch',
    '[semver, calver] Creates a patch release',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('patch', argv)
    }
  )
  .command(
    'premajor',
    '[semver] Creates a premajor release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('premajor', argv)
    }
  )
  .command(
    'preminor',
    '[semver] Creates a preminor release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('preminor', argv)
    }
  )
  .command(
    'prepatch',
    '[semver] Creates a prepatch release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('prepatch', argv)
    }
  )
  .command(
    'prerelease',
    '[semver] Creates a prerelease release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('prerelease', argv)
    }
  )
  .command(
    'calendar',
    '[calver] Creates a calendar release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar', argv)
    }
  )
  .command(
    'micro',
    '[calver] Creates a micro release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('micro', argv)
    }
  )
  .command(
    'calendar.major',
    '[calver] Creates a calendar or major release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.major', argv)
    }
  )
  .command(
    'calendar.minor',
    '[calver] Creates a calendar or minor release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.minor', argv)
    }
  )
  .command(
    'calendar.micro',
    '[calver] Creates a calendar or micro release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.micro', argv)
    }
  )
  .command(
    'calendar.dev',
    '[calver] Creates a calendar or dev release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.dev', argv)
    }
  )
  .command(
    'calendar.alpha',
    '[calver] Creates a calendar or alpha release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.alpha', argv)
    }
  )
  .command(
    'calendar.beta',
    '[calver] Creates a calendar or beta release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.beta', argv)
    }
  )
  .command(
    'calendar.rc',
    '[calver] Creates a calendar or rc release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.rc', argv)
    }
  )
  .command(
    'dev',
    '[calver] Creates a dev release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('dev', argv)
    }
  )
  .command(
    'alpha',
    '[calver] Creates an alpha release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('alpha', argv)
    }
  )
  .command(
    'beta',
    '[calver] Creates a beta release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('beta', argv)
    }
  )
  .command(
    'rc',
    '[calver] Creates an rc release.',
    registerLevelPositioners,
    async argv => {
      await lib.createReleaseByLevelCLI('rc', argv)
    }
  )
  .help()
  .argv

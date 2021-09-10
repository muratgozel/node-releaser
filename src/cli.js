#!/usr/bin/env node

const yargs = require('yargs')
const lib = require('./index')

const yargsPosMsg = {
  type: 'string',
  alias: 'm',
  describe: 'Commit message. Can be specified multiple times to create multiline commit messages.'
}

yargs
  .scriptName('releaser')
  .usage(`releaser <cmd> [args]`)
  .command(
    'major',
    'Creates a major release',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('major', argv)
    }
  )
  .command(
    'minor',
    'Creates a minor release',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('minor', argv)
    }
  )
  .command(
    'patch',
    'Creates a patch release',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('patch', argv)
    }
  )
  .command(
    'premajor',
    'Creates a premajor release. (semver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('premajor', argv)
    }
  )
  .command(
    'preminor',
    'Creates a preminor release. (semver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('preminor', argv)
    }
  )
  .command(
    'prepatch',
    'Creates a prepatch release. (semver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('prepatch', argv)
    }
  )
  .command(
    'prerelease',
    'Creates a prerelease release. (semver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('prerelease', argv)
    }
  )
  .command(
    'calendar',
    'Creates a calendar release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar', argv)
    }
  )
  .command(
    'micro',
    'Creates a micro release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('micro', argv)
    }
  )
  .command(
    'dev',
    'Creates a dev release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('dev', argv)
    }
  )
  .command(
    'alpha',
    'Creates an alpha release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('alpha', argv)
    }
  )
  .command(
    'beta',
    'Creates a beta release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('beta', argv)
    }
  )
  .command(
    'rc',
    'Creates an rc release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('rc', argv)
    }
  )
  .command(
    'calendar.major',
    'Creates a calendar or major release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.major', argv)
    }
  )
  .command(
    'calendar.minor',
    'Creates a calendar or minor release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.minor', argv)
    }
  )
  .command(
    'calendar.micro',
    'Creates a calendar or micro release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.micro', argv)
    }
  )
  .command(
    'calendar.dev',
    'Creates a calendar or dev release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.dev', argv)
    }
  )
  .command(
    'calendar.alpha',
    'Creates a calendar or alpha release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.alpha', argv)
    }
  )
  .command(
    'calendar.beta',
    'Creates a calendar or beta release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.beta', argv)
    }
  )
  .command(
    'calendar.rc',
    'Creates a calendar or rc release. (calver)',
    yargs => {
      yargs.positional('message', yargsPosMsg)
    },
    async argv => {
      await lib.createReleaseByLevelCLI('calendar.rc', argv)
    }
  )
  .help()
  .argv

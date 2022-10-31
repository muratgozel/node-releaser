import chalk from "chalk";
import prompts from "prompts";
import calver from 'calver';

export default async function configure({repo, projectPackage, projectConfiguration, container, versioner, opts}) {
  const promptResponses = new Map()

  if (opts.autoConfigure) {
    promptResponses.set('versioningScheme', 'semver')
    promptResponses.set('versioningPrefix', 'v')
    promptResponses.set('location', opts.preferConfig)

    if (projectPackage.exists) {
      promptResponses.set('npmUpdatePackageVersion', true)
      promptResponses.set('npmPublishPackage', false)
    }

    if (repo.serviceProvider === 'github') {
      promptResponses.set('githubRelease', true)
    }

    if (repo.serviceProvider === 'gitlab') {
      promptResponses.set('gitlabRelease', true)
    }

    const obj = {}
    for (const [key, value] of promptResponses) {
      obj[key] = value
    }

    await projectConfiguration.persist(obj)

    return true;
  }

  const onCancelPrompt = () => {
    console.log(`Canceled, nothing saved.`)
    return true;
  }

  const onDone = async () => {
    console.log(`All done! Configuration created successfully. ${chalk.hex('#6b2cec')('releaser')} is ready to use.`)

    const obj = {}
    for (const [key, value] of promptResponses) {
      obj[key] = value
    }

    await projectConfiguration.persist(obj)

    return true;
  }

  const promptsMap = new Map()

  promptsMap.set('configureNow', async () => {
    return await prompts({
      type: 'toggle',
      name: 'configureNow',
      message: `Would you like to configure ${chalk.hex('#6b2cec')('releaser')} now?` +
        ` ${chalk.dim('(use left/right arrow keys to navigate and press enter)')}`,
      initial: true,
      active: 'Yes, please.',
      inactive: 'No, maybe later.'
    }, {
      onCancel: () => {
        console.log(chalk.hex('#6b2cec')('No worries, no action taken, nothing got written, bye!'))
        return true;
      },
      onSubmit: async (prompt, answer, answers) => {
        if (answer !== true) {
          return console.log(`Alright! No action taken. Feel free to ${chalk.bold('check')} again anytime.`)
        }

        return await promptsMap.get('versioningScheme')()
      }
    })
  })

  promptsMap.set('versioningScheme', async () => {
    return await prompts({
      type: 'select',
      name: 'versioningScheme',
      message: `Which versioning scheme would you prefer for your project?` +
        ` ${chalk.dim('(use up/down arrow keys to navigate and press enter)')}`,
      choices: [
        { title: 'semver', description: 'The most popular versioning scheme. (x.y.z)', value: 'semver' },
        { title: 'calver', description: 'Calendar based versioning scheme. (yy.mm.minor)', value: 'calver' }
      ],
      initial: 1
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        if (answer === 'calver') {
          await promptsMap.get('versioningFormat')()
        }

        if (answer === 'semver') {
          await promptsMap.get('versioningPrefix')()
        }
      }
    })
  })

  promptsMap.set('versioningFormat', async () => {
    return await prompts({
      type: 'text',
      name: 'versioningFormat',
      message: `What format will you use for calver?` +
        ` (For more info: https://github.com/muratgozel/node-releaser)`,
      validate: v => {
        try {
          calver.validateFormat(v, [])
          return true
        }
        catch (e) {
          return 'This looks invalid, please check what you entered as format.'
        }
      }
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        await promptsMap.get('versioningPrefix')()
      }
    })
  })

  promptsMap.set('versioningPrefix', async () => {
    return await prompts({
      type: 'text',
      name: 'versioningPrefix',
      message: `Would you like to add a prefix to your versions?` +
        ` ${chalk.dim('"v" for example. (v1.2.3) Leave empty if you wish.')}`
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer || '')

        if (projectPackage.exists) {
          return await promptsMap.get('npmUpdatePackageVersion')()
        }

        if (repo.serviceProvider === 'github') {
          return await promptsMap.get('githubRelease')()
        }

        if (repo.serviceProvider === 'gitlab') {
          return await promptsMap.get('gitlabRelease')()
        }

        if (container.exists) {
          return await promptsMap.get('dockerConnectionString')()
        }

        if (projectPackage.exists) {
          return await promptsMap.get('location')()
        }

        return await onDone()
      }
    })
  })

  promptsMap.set('npmUpdatePackageVersion', async () => {
    return await prompts({
      type: 'toggle',
      name: 'npmUpdatePackageVersion',
      message: `Is it okay if ${chalk.hex('#6b2cec')('releaser')} updates the version field of package.json as you make releases?`,
      initial: true,
      active: 'Yes, please.',
      inactive: 'No, maybe later.'
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        if (projectPackage.exists) {
          return await promptsMap.get('npmPublishPackage')()
        }

        if (repo.serviceProvider === 'github') {
          return await promptsMap.get('githubRelease')()
        }

        if (repo.serviceProvider === 'gitlab') {
          return await promptsMap.get('gitlabRelease')()
        }

        if (container.exists) {
          return await promptsMap.get('dockerConnectionString')()
        }

        if (projectPackage.exists) {
          return await promptsMap.get('location')()
        }

        return await onDone()
      }
    })
  })

  promptsMap.set('npmPublishPackage', async () => {
    return await prompts({
      type: 'toggle',
      name: 'npmPublishPackage',
      message: `Would you like to publish your package to npm as you make releases?`,
      initial: true,
      active: 'Yes, please.',
      inactive: 'No, maybe later.'
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        if (repo.serviceProvider === 'github') {
          return await promptsMap.get('githubRelease')()
        }

        if (repo.serviceProvider === 'gitlab') {
          return await promptsMap.get('gitlabRelease')()
        }

        if (container.exists) {
          return await promptsMap.get('dockerConnectionString')()
        }

        if (projectPackage.exists) {
          return await promptsMap.get('location')()
        }

        return await onDone()
      }
    })
  })

  promptsMap.set('githubRelease', async () => {
    return await prompts({
      type: 'toggle',
      name: 'githubRelease',
      message: `Do you want to enable Github releases?`,
      initial: true,
      active: 'Yes, please.',
      inactive: 'No, maybe later.'
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        if (container.exists) {
          return await promptsMap.get('dockerConnectionString')()
        }

        if (projectPackage.exists) {
          return await promptsMap.get('location')()
        }

        return await onDone()
      }
    })
  })

  promptsMap.set('gitlabRelease', async () => {
    return await prompts({
      type: 'toggle',
      name: 'gitlabRelease',
      message: `Do you want to enable Gitlab releases?`,
      initial: true,
      active: 'Yes, please.',
      inactive: 'No, maybe later.'
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        if (container.exists) {
          return await promptsMap.get('dockerConnectionString')()
        }

        if (projectPackage.exists) {
          return await promptsMap.get('location')()
        }

        return await onDone()
      }
    })
  })

  promptsMap.set('dockerConnectionString', async () => {
    return await prompts({
      type: 'text',
      name: 'dockerConnectionString',
      message: `Enter docker connection string if you want ${chalk.hex('#6b2cec')('releaser')} ` +
        `auto-publish to a registry of your preference as you make releases.`
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        if (projectPackage.exists) {
          return await promptsMap.get('location')()
        }

        return await onDone()
      }
    })
  })

  promptsMap.set('location', async () => {
    return await prompts({
      type: 'select',
      name: 'location',
      message: `Thanks! Configuration is ready to save. Where would you like to store it?`,
      choices: [
        { title: '.releaser.json', description: 'A seperate hidden file inside project directory.', value: '.releaser.json' },
        { title: 'package.json', description: 'Under "releaser" property inside package.json file.', value: 'package.json' }
      ],
      initial: 1
    }, {
      onCancel: onCancelPrompt,
      onSubmit: async (prompt, answer, answers) => {
        promptResponses.set(prompt.name, answer)

        return await onDone()
      }
    })
  })

  await promptsMap.get('configureNow')()
}
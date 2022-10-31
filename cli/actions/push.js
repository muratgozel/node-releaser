import {setTimeout} from "node:timers/promises";
import prompts from "prompts";
import chalk from "chalk";
import check from "./check.js";
import ora from "ora";
import {config} from "../../lib/infrastructure/config.js";
import events from "../../lib/infrastructure/events.js";

export default async function push(opts, command) {
  if (!config.has('tag')) {
    await check(opts, command)
  }

  let spinner = null
  const repo = config.get('repo')
  const projectConfiguration = config.get('projectConfiguration')
  const versioner = config.get('versioner')

  if (!config.has('tag')) {
    spinner = ora({text: `Looking for the latest ${versioner.scheme} version tag in git history`, color: 'cyan', indent: 2}).start()
    await setTimeout(1000)
    const latestTag = repo.getLatestRelevantTag({initialRelease: false})
    if (latestTag instanceof Error) {
      spinner.fail()
      throw latestTag
    }

    const tag = latestTag.slice(projectConfiguration.content.versioningPrefix.length)
    spinner.succeed(`Looking for the latest ${versioner.scheme} version tag in git history: ` +
      `${repo.initialRelease ? 'looks like this will be an initial release!' : repo.latestRelevantTag}`)

    config.set('tag', tag)
  }

  if (!opts.nonInteractive) {
    const approvalPrompt = await prompts({
      type: 'toggle',
      name: 'approve',
      message: `Your changes will be ${chalk.bold('pushed')} to the remote ${chalk.bold(repo.remoteUrl)} ` +
        `on branch ${chalk.bold(repo.currentBranch)} ` +
        `and with tag ${chalk.bold(repo.projectConfiguration.content.versioningPrefix + config.get('tag'))}. Do you approve?`,
      initial: true,
      active: 'Yes.',
      inactive: 'No, cancel the whole operation.'
    })
    if (approvalPrompt.approve === false) {
      return console.log('Operation canceled.')
    }
  }

  await events.emit('beforePush')

  if (!spinner) spinner = ora({text: `Pushing changes`, color: 'cyan', indent: 2}).start()
  else spinner.start(`Pushing changes`)
  const pushed = repo.push(config.get('tag'))
  if (pushed instanceof Error) {
    spinner.fail()
    throw pushed
  }
  spinner.succeed(`Pushing changes`)

  await events.emit('afterPush')
}
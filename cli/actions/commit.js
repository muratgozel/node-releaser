import {setTimeout} from "node:timers/promises";
import prompts from "prompts";
import chalk from "chalk";
import check from "./check.js";
import ora from "ora";
import {config} from "../../lib/infrastructure/config.js";
import events from "../../lib/infrastructure/events.js";

export default async function commit(opts, command) {
  await check(opts, command)

  const repo = config.get('repo')
  const projectConfiguration = config.get('projectConfiguration')
  const versioner = config.get('versioner')

  const spinner = ora({text: 'Verifying recent codebase changes', color: 'cyan', indent: 2}).start()
  const status = repo.getStatus()
  if (status instanceof Error) {
    spinner.fail()
    throw status
  }
  spinner.succeed()

  spinner.start(`Looking for the latest ${versioner.scheme} version tag in git history`)
  await setTimeout(1000)
  const latestTag = repo.getLatestRelevantTag(opts)
  if (latestTag instanceof Error) {
    spinner.fail()
    throw latestTag
  }
  spinner.succeed(`Looking for the latest ${versioner.scheme} version tag in git history: ` +
    `${repo.initialRelease ? 'looks like this will be an initial release!' : repo.latestRelevantTag}`)

  spinner.start(`Generating the next ${versioner.scheme} tag`)
  await setTimeout(1000)
  const tag = versioner.next(repo, opts.level)
  if (tag instanceof Error) {
    spinner.fail()
    throw tag
  }
  // verify the next tag doesn't exist in the git
  if (!repo.isVersionTagUnique(tag)) {
    spinner.fail()
    throw new Error(`The version tag "${tag}" is already exist in the git history. ` +
      `Exiting now, feel free to execute me again once you resolved this issue. ` +
      `If you want to remove the existing tag, execute "git tag -d ${tag}" to remove locally and ` +
      `"git push --delete origin ${tag}" to remove remotely.`)
  }
  spinner.succeed(`Generating the next ${versioner.scheme} tag: ${tag}`)

  if (!opts.nonInteractive) {
    const approvalPrompt = await prompts({
      type: 'toggle',
      name: 'approve',
      message: `Your changes will be ${chalk.bold('committed')} to git history on branch ${chalk.bold(repo.currentBranch)} ` +
        `and with tag ${chalk.bold(projectConfiguration.content.versioningPrefix + tag)}. Do you approve?`,
      initial: true,
      active: 'Yes.',
      inactive: 'No, cancel the whole operation.'
    })
    if (approvalPrompt.approve === false) {
      console.log('Operation canceled.')
      return false;
    }
  }

  config.set('status', status)
  config.set('latestTag', latestTag)
  config.set('tag', tag)

  await events.emit('beforeCommit')

  spinner.start(`Commiting codebase changes`)
  await setTimeout(1000)
  const added = repo.add()
  if (added instanceof Error) {
    spinner.fail()
    throw added
  }
  const abbrCommitHash = repo.commit(opts)
  if (abbrCommitHash instanceof Error) {
    spinner.fail()
    throw abbrCommitHash
  }
  spinner.succeed(`Commiting codebase changes: ${abbrCommitHash}`)

  spinner.start(`Tagging the commit ${abbrCommitHash}`)
  await setTimeout(1000)
  const tagged = repo.tag(tag, abbrCommitHash, opts)
  if (tagged instanceof Error) {
    spinner.fail()
    throw tagged
  }
  spinner.succeed(`Tagging the commit ${abbrCommitHash}: ${tag}`)

  config.set('abbrCommitHash', abbrCommitHash)

  await events.emit('afterCommit')

  return true;
}
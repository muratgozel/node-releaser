import ora from "ora";
import events from "../infrastructure/events.js";
import _ from "lodash";
import {promisify} from "node:util";
import {exec} from "node:child_process";

events.on('afterPush', async function releaseOnGithub() {
  if (!this.config.has('github')) {
    return false;
  }

  const spinner = ora({text: '', color: 'cyan', indent: 2})
  const repo = this.config.get('repo')
  const ver = this.config.get('projectConfiguration').content.versioningPrefix + this.config.get('tag')
  spinner.start(`Creating a release on Github`)

  const body = this.opts.message.join("\r\n")
  const result = await this.config.get('github').createRelease(repo.owner, repo.repo, ver, body)

  if (result instanceof Error) {
    spinner.fail()
    process.stderr.write(`Changes pushed but couldn't make a release on Github.\r\n`)
    process.stderr.write(`${result}\r\n`)
    if (result.cause) process.stderr.write(`${result.cause}\r\n`)
  }
  else {
    spinner.succeed()
  }

  return true;
})

events.on('afterPush', async function releaseOnGitlab() {
  const spinner = ora({text: '', color: 'cyan', indent: 2})
  const repo = this.config.get('repo')
  const ver = this.config.get('projectConfiguration').content.versioningPrefix + this.config.get('tag')

  if (!this.config.has('gitlab')) {
    return false;
  }

  spinner.start(`Creating a release on Gitlab`)

  const body = this.opts.message.join("\r\n")
  const uri = encodeURIComponent([repo.owner, repo.project, repo.repo].filter(v => v.length > 0).join('/'))
  const result = await this.config.get('gitlab').createRelease(uri, ver, body)

  if (result instanceof Error) {
    spinner.fail()
    process.stderr.write(`Changes pushed but couldn't make a release on Gitlab.\r\n`)
    process.stderr.write(`${result}\r\n`)
    if (result.cause) process.stderr.write(`${result.cause}\r\n`)
  }
  else {
    spinner.succeed()
  }

  return true;
})

events.on('afterPush', async function publishOnNpm() {
  if (!this.config.get('projectConfiguration').content.npmPublishPackage) {
    return false;
  }

  const spinner = ora({text: '', color: 'cyan', indent: 2})
  spinner.start(`Publishing package on npm`)
  const repo = this.config.get('repo')
  const args = this.config.get('projectConfiguration').content.npmPublishPackageArgs || []
  const result = await this.config.get('projectPackage').publish(repo, args)
  if (result instanceof Error) {
    spinner.fail()
    process.stderr.write(`Changes pushed but couldn't published package on npm.\r\n`)
    process.stderr.write(`${result}\r\n`)
    if (result.cause) process.stderr.write(`${result.cause}\r\n`)
  }
  else {
    spinner.succeed()
  }

  return true;
})

events.on('afterPush', async function pushDockerImage() {
  if (!this.config.get('projectConfiguration').get('dockerConnectionString') || !this.config.get('container').exists) {
    return false;
  }

  const spinner = ora({text: '', color: 'cyan', indent: 2})
  spinner.start(`Pushing docker image to the registry`)
  const result = await this.config.get('container').push()
  if (result instanceof Error) {
    spinner.fail()
    process.stderr.write(`Couldn't push docker image.\r\nDid you run 'docker login'?`)
    process.stderr.write(`${result}\r\n`)
    if (result.cause) process.stderr.write(`${result.cause}\r\n`)
  }
  spinner.succeed()

  return true;
})

events.on('afterPush', async function runAfterPushHook() {
  const hooks = this.config.get('projectConfiguration').get('hooks')
  if (!hooks || !hooks.afterPush) {
    return false;
  }

  const spinner = ora({text: '', color: 'cyan', indent: 2})
  const repo = this.config.get('repo')
  const templateLiterals = {
    gitRemote: repo.remoteUrl,
    gitRemoteService: repo.serviceProvider,
    gitBranch: repo.currentBranch,
    tag: this.config.get('tag')
  }
  const command = _.template(hooks.afterPush)(templateLiterals)
  spinner.start(`Executing your command "${command}"`)
  const execute = promisify(exec)
  try {
    const {stdout, stderr} = await execute(command)
    spinner.succeed()
    return true;
  }
  catch (e) {
    spinner.fail()
    return console.error(e);
  }
})
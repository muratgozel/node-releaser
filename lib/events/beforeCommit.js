import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import ora from "ora";
import _ from 'lodash';
import events from "../infrastructure/events.js";

events.on('beforeCommit', async function updateNpmVersionField() {
  const spinner = ora({text: '', color: 'cyan', indent: 2})

  if (!this.config.get('projectConfiguration').content.npmUpdatePackageVersion) {
    return false;
  }

  spinner.start(`Updating version field of package.json`)
  const tag = this.config.get('tag')
  const prefix = this.config.get('projectConfiguration').content.versioningPrefix
  const npmVersion = prefix + this.config.get('versioner').coerceForNpmVersion(tag)
  this.config.get('projectPackage').content.version = npmVersion
  await this.config.get('projectPackage').save()
  spinner.succeed()

  return this.config.get('projectPackage')
})

events.on('beforeCommit', async function buildDockerImage() {
  if (!this.config.get('projectConfiguration').get('dockerConnectionString') || !this.config.get('container').exists) {
    return false;
  }

  const spinner = ora({text: '', color: 'cyan', indent: 2})
  spinner.start(`Building docker image`)
  const tag = this.config.get('tag')
  const result = await this.config.get('container').build(tag)
  if (result instanceof Error) {
    spinner.fail()
    process.stderr.write(`Couldn't build docker image.\r\n`)
    process.stderr.write(`${result}\r\n`)
    if (result.cause) process.stderr.write(`${result.cause}\r\n`)
  }
  spinner.succeed()

  return true;
})

events.on('beforeCommit', async function runBeforeCommitHook() {
  const hooks = this.config.get('projectConfiguration').get('hooks')
  if (!hooks || !hooks.beforeCommit) {
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
  const command = _.template(hooks.beforeCommit)(templateLiterals)
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
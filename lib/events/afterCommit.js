import events from "../infrastructure/events.js";
import ora from "ora";
import _ from "lodash";
import {promisify} from "node:util";
import {exec} from "node:child_process";

events.on('afterCommit', async function runAfterCommitHook() {
  const hooks = this.config.get('projectConfiguration').get('hooks')
  if (!hooks || !hooks.afterCommit) {
    return false;
  }

  const spinner = ora({text: '', color: 'cyan', indent: 2})
  const repo = this.config.get('repo')
  const templateLiterals = {
    gitRemote: repo.remoteUrl,
    gitRemoteService: repo.serviceProvider,
    gitBranch: repo.currentBranch,
    tag: this.config.get('tag'),
    abbrCommitHash: this.config.get('abbrCommitHash')
  }
  const command = _.template(hooks.afterCommit)(templateLiterals)
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
import ora from "ora";
import {setTimeout} from "node:timers/promises";
import {config} from "../../lib/infrastructure/config.js";
import events from "../../lib/infrastructure/events.js";
import Repository from "../../lib/domain/Repository.js";
import ProjectPackage from "../../lib/domain/ProjectPackage.js";
import ProjectConfiguration from "../../lib/domain/ProjectConfiguration.js";
import Container from "../../lib/domain/Container.js";
import Versioner from "../../lib/domain/Versioner.js";
import Github from "../../lib/domain/Github.js";
import Gitlab from "../../lib/domain/Gitlab.js";
import configure from "../prompts/check.js";

export default async function check(opts, command) {
  events.opts = opts
  events.command = command
  events.config = config

  const spinner = ora({text: 'Validating version control system (git)', color: 'cyan', indent: 2}).start()
  await setTimeout(1000)
  const repo = new Repository({projectPath: config.get('projectPath'), projectConfiguration: null, versioner: null})
  const repoCheck = repo.validate()
  if (repoCheck instanceof Error) {
    spinner.fail()
    throw new Error(`Couldn't find a valid git repository in here.`, {cause: repoCheck})
  }
  spinner.succeed()

  spinner.start('Looking for project package manager (package.json)')
  await setTimeout(1000)
  const projectPackage = new ProjectPackage({projectPath: config.get('projectPath')})
  const projectPackageCheck = await projectPackage.check()
  if (projectPackageCheck instanceof Error) {
    spinner.fail()
    throw projectPackageCheck
  }
  spinner.succeed(`Looking for project package manager (package.json): ${projectPackage.exists ? 'found' : 'not found'}.`)

  spinner.start('Looking for container manifest (Dockerfile)')
  await setTimeout(1000)
  const container = new Container({projectPath: config.get('projectPath')})
  await container.verify()
  spinner.succeed()

  const versioner = new Versioner({projectConfiguration: null})

  spinner.start('Looking for releaser configuration')
  await setTimeout(1000)
  const projectConfiguration = new ProjectConfiguration({projectPath: config.get('projectPath'), projectPackage})
  const projectConfigurationVerified = await projectConfiguration.verify()
  if (projectConfigurationVerified instanceof Error) {
    spinner.fail()
    throw projectConfigurationVerified
  }
  else if (projectConfiguration.exists) {
    spinner.succeed()
  }
  else {
    spinner.stopAndPersist({symbol: '👀', text: 'Looking for releaser configuration: Not found.'})

    if (!projectConfiguration.exists) {
      if (opts.autoConfigure) {
        await configure({repo, projectPackage, projectConfiguration, container, versioner, opts})
      }
      else if (opts.nonInteractive) {
        throw new Error(`Releaser configuration not found.`)
      }
      else {
        await configure({repo, projectPackage, projectConfiguration, container, versioner, opts})
      }
    }
  }

  spinner.start('Setting up versioning module')
  versioner.projectConfiguration = projectConfiguration
  const versionerValid = versioner.validate()
  if (versionerValid instanceof Error) {
    spinner.fail()
    throw versionerValid
  }
  spinner.succeed(`Setting up versioning module: ${versioner.scheme} is ready`)

  repo.projectConfiguration = projectConfiguration
  repo.versioner = versioner
  container.projectConfiguration = projectConfiguration

  config.set('repo', repo)
  config.set('projectPackage', projectPackage)
  config.set('projectConfiguration', projectConfiguration)
  config.set('container', container)
  config.set('versioner', versioner)

  if (projectConfiguration.content.githubRelease) {
    if (command.name() !== 'release') return;

    const github = new Github({
      token: process.env.GITHUB_TOKEN,
      userAgent: config.get('name') + '/' + config.get('version')
    })

    github.init()

    config.set('github', github)
  }

  if (projectConfiguration.content.gitlabRelease) {
    if (command.name() !== 'release') return;

    const gitlab = new Gitlab({
      token: process.env.GITLAB_TOKEN,
      userAgent: config.get('name') + '/' + config.get('version')
    })

    config.set('gitlab', gitlab)
  }
}
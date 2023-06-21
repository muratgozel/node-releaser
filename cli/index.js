#!/usr/bin/env node

import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from 'node:url';
import {Command} from "commander";
import {config} from "../lib/infrastructure/config.js";
import check from "./actions/check.js";
import commit from "./actions/commit.js";
import push from "./actions/push.js";
import release from "./actions/release.js";
// import docker from './actions/docker.js';
import "../lib/events/beforeCommit.js";
import "../lib/events/afterCommit.js";
import "../lib/events/beforePush.js";
import "../lib/events/afterPush.js";

const pkgpath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../package.json')
const pkg = JSON.parse( await readFile(pkgpath, {encoding: 'utf8'}) )

config.set('projectPath', process.cwd())
config.set('name', 'releaser')
config.set('version', pkg.version)
config.set('packageFileName', 'package.json')

const program = new Command()

function preAction(command) {
  const opts = command.opts()

  if (opts.projectPath) config.set('projectPath', opts.projectPath)
}

program.name('releaser')
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'Outputs the installed version.')

program.command('check')
  .description('Creates configuration for the project, which is necessary in order to run releaser.')
  .option('-n, --non-interactive', 'Do not ask any user input. This option is useful for automated environments and you may want to use more cli flags.', false)
  .option('-a, --auto-configure', 'Creates configuration file automatically by looking at the codebase, this option disables any user input in check phase.', false)
  .option('-p, --project-path <path>', 'Specify different project path. It is where command executed by default.')
  .option('--prefer-config <loc>', 'Preferred location for the releaser config, only taken into account with auto-configure', '.releaser.json')
  .hook('preAction', preAction)
  .action(check)

program.command('commit')
  .description('Only commits the changes along with version tag. It doesn\'t update the remote codebase or run any plugins.')
  .requiredOption('-m, --message <messages...>', 'Commit message(s).')
  .option('-n, --non-interactive', 'Do not ask any user input. This option is useful for automated environments and you may want to use more cli flags.', false)
  .option('-a, --auto-configure', 'Creates configuration file automatically by looking at the codebase, this option disables any user input in check phase.', false)
  .option('-p, --project-path <path>', 'Specify different project path. It is where command executed by default.')
  .option('--prefer-config <loc>', 'Preferred location for the releaser config, only taken into account with auto-configure', '.releaser.json')
  .option('-l, --level <level>', 'Level of the commit.', 'prerelease')
  .option('--initial-release', 'Force releaser to treat this as initial release.', false)
  .hook('preAction', preAction)
  .action(commit)

program.command('push')
  .description('Pushes the committed changes to the remote. It doesn\'t run any plugins.')
  .option('-n, --non-interactive', 'Do not ask any user input. This option is useful for automated environments and you may want to use more cli flags.', false)
  .option('-a, --auto-configure', 'Creates configuration file automatically by looking at the codebase, this option disables any user input in check phase.', false)
  .option('-p, --project-path <path>', 'Specify different project path. It is where command executed by default.')
  .option('--prefer-config <loc>', 'Preferred location for the releaser config, only taken into account with auto-configure', '.releaser.json')
  .option('-ne, --no-events', 'Do not trigger any events such as github/npm/docker releases.', false)
  .hook('preAction', preAction)
  .action(push)

program.command('release')
  .description('Runs releaser with all of its features including commit, push and any plugins.')
  .requiredOption('-m, --message <messages...>', 'Commit message(s).')
  .option('-n, --non-interactive', 'Do not ask any user input. This option is useful for automated environments and you may want to use more cli flags.', false)
  .option('-a, --auto-configure', 'Creates configuration file automatically by looking at the codebase, this option disables any user input in check phase.', false)
  .option('-p, --project-path <path>', 'Specify different project path. It is where command executed by default.')
  .option('--prefer-config <loc>', 'Preferred location for the releaser config, only taken into account with auto-configure', '.releaser.json')
  .option('-l, --level <level>', 'Level of the commit.', 'prerelease')
  .option('--initial-release', 'Force releaser to treat this as initial release.', false)
  .hook('preAction', preAction)
  .action(release)

/*
program.command('docker')
  .description('Builds and pushes the container to a docker registry.')
  .option('-n, --non-interactive', 'Do not ask any user input. This option is useful for automated environments and you may want to use more cli flags.', false)
  .option('-a, --auto-configure', 'Creates configuration file automatically by looking at the codebase, this option disables any user input in check phase.', false)
  .option('-p, --project-path <path>', 'Specify different project path. It is where command executed by default.')
  .option('--prefer-config <loc>', 'Preferred location for the releaser config, only taken into account with auto-configure', '.releaser.json')
  .hook('preAction', preAction)
  .action(docker)
*/

await program.parseAsync(process.argv)
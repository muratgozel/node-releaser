import path from "node:path";
import {readFile} from "node:fs/promises";
import {spawn, spawnSync} from 'node:child_process';

class Container {
  identifier = 'Dockerfile'
  format = ''
  projectPath = null
  projectConfiguration = null
  exists = null

  constructor({projectPath, projectConfiguration}) {
    this.projectPath = projectPath
    this.projectConfiguration = projectConfiguration
  }

  get location() {
    return path.join(this.projectPath, this.identifier)
  }

  async verify() {
    try {
      await readFile(this.location, {encoding: 'utf8', flag: 'r'})

      this.exists = true
    }
    catch (e) {
      this.exists = false
    }

    return true
  }

  async build(tag) {
    const connstr = this.projectConfiguration.get('dockerConnectionString')
    const ver = this.projectConfiguration.get('versioningPrefix') + tag
    const args = this.projectConfiguration.get('dockerBuildArgs')
    const buildPath = this.projectConfiguration.get('dockerBuildPath')

    const cmd = spawnSync(
      'docker',
      ['build', '-t', `${connstr}:latest`, '-t', `${connstr}:${ver}`].concat(args).concat([buildPath]),
      this.projectConfiguration.spawnOpts
    )

    if (cmd.status !== 0) {
      return new Error(`Failed to build docker image.` +
        `Command stdout was ${cmd.stdout.trim() || '""'} and stderr was ${cmd.stderr.trim() || '""'}`)
    }

    return true
  }

  async push() {
    const connstr = this.projectConfiguration.get('dockerConnectionString')
    const args = this.projectConfiguration.get('dockerBuildArgs')
    const cmd = spawnSync(
      'docker',
      ['push', connstr, '--all-tags'].concat(args),
      this.projectConfiguration.spawnOpts
    )

    if (cmd.status !== 0) {
      return new Error(`Failed to build docker image.` +
        `Command stdout was ${cmd.stdout.trim() || '""'} and stderr was ${cmd.stderr.trim() || '""'}`)
    }

    return true
  }
}

export default Container
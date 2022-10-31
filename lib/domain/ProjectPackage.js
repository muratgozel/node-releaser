import {readFile, writeFile} from "node:fs/promises";
import {spawnSync} from 'node:child_process';
import path from "node:path";

class ProjectPackage {
  identifier = 'package'
  format = 'json'
  exists = null
  content = null
  projectPath = null

  constructor({projectPath}) {
    this.projectPath = projectPath
  }

  get location() {
    return path.join(this.projectPath, this.identifier + '.' + this.format)
  }

  async check() {
    try {
      const content = await readFile(this.location, {encoding: 'utf8', flag: 'r'})

      this.exists = true

      try {
        this.content = JSON.parse(content)
        return true;
      }
      catch (e) {
        return new Error(`Couldn't parse the content of package file (${this.identifier + '.' + this.format}), ` +
          `please check its content.`)
      }
    }
    catch (e) {
      this.exists = false
      return true;
    }
  }

  async save() {
    try {
      await writeFile(this.location, JSON.stringify(this.content, null, 2))

      return true;
    }
    catch (e) {
      return e;
    }
  }

  async publish(repo, args) {
    const cmd = spawnSync('npm', ['publish'].concat(...args), repo.spawnOpts)

    if (cmd.status !== 0) {
      return new Error(`Failed to publish on npm. ` +
        `Command stdout was ${cmd.stdout.trim() || '""'} and stderr was ${cmd.stderr.trim() || '""'}`)
    }

    return true;
  }
}

export default ProjectPackage
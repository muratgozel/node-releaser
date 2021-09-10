const {execSync} = require('child_process')

function docker() {
  async function initiated() {
  }

  async function beforePush(nextTag) {
    if (!this.config.get('docker.enable')) return

    const connstr = this.config.get('docker.user') + '/' + this.config.get('docker.repo')
    const cmd = `docker build -t ${connstr}:latest -t ${connstr}:${nextTag} ${this.config.get('docker.build.path')}`
    execSync(cmd, {stdio: 'inherit', encoding: 'utf8'})
  }

  async function afterPush(tag) {
    if (!this.config.get('docker.enable')) return

    const connstr = this.config.get('docker.user') + '/' + this.config.get('docker.repo')
    const cmd = `docker push ${connstr} --all-tags`
    execSync(cmd, {stdio: 'inherit', encoding: 'utf8'})
  }

  return {
    initiated: initiated,
    beforePush: beforePush,
    afterPush: afterPush
  }
}

module.exports = docker()

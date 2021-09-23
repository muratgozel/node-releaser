const {execSync} = require('child_process')
const colors = require('colors/safe')

function docker() {
  async function initiated() {
  }

  async function beforePush(nextTag) {
    if (!this.config.get('docker.enable')) return

    console.log(colors.blue('Building docker image with "latest" and "' + nextTag + '" tags...'))

    const host = this.config.get('docker.registry')
    const user = this.config.get('docker.user')
    const repo = this.config.get('docker.repo')
    const connstr = (host.length > 0 ? host + '/' : '') + user + '/' + repo
    const cmd = `docker build -t ${connstr}:latest -t ${connstr}:${nextTag} ${this.config.get('docker.build.path')}`
    execSync(cmd, {stdio: 'inherit', encoding: 'utf8'})
  }

  async function afterPush(tag) {
    if (!this.config.get('docker.enable')) return

    console.log(colors.blue('Publishing docker image on docker hub...'))

    const host = this.config.get('docker.registry')
    const user = this.config.get('docker.user')
    const repo = this.config.get('docker.repo')
    const connstr = (host.length > 0 ? host + '/' : '') + user + '/' + repo
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

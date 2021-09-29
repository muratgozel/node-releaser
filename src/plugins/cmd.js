const {execSync} = require('child_process')
const colors = require('colors/safe')

function cmd() {
  async function initiated() {
  }

  async function beforePush(nextTag) {
    if (!this.config.get('cmd.enable')) return
    if (!this.config.get('cmd.beforePush')) return

    const cmd = this.config.get('cmd.beforePush')

    console.log(colors.blue('Executing "' + cmd + '" before pushing to remote.'))

    execSync(cmd, {stdio: 'inherit', encoding: 'utf8'})
  }

  async function afterPush(tag) {
    if (!this.config.get('cmd.enable')) return
    if (!this.config.get('cmd.afterPush')) return

    const cmd = this.config.get('cmd.afterPush')

    console.log(colors.blue('Executing "' + cmd + '" after pushing to remote.'))

    execSync(cmd, {stdio: 'inherit', encoding: 'utf8'})
  }

  return {
    initiated,
    beforePush,
    afterPush
  }
}

module.exports = cmd()

const { Octokit, App, Action } = require('octokit')
const colors = require('colors/safe')

function github() {
  const store = {
    octokit: null,
    owner: null,
    repo: null
  }

  async function initiated() {
    store.octokit = new Octokit({
      auth: this.config.get('github.token'),
      userAgent: this.config.get('releaser.name') + '/' + this.config.get('releaser.version')
    })

    const remote = this.git.getRemoteOrigin()
    store.owner = remote.owner
    store.repo = remote.repo
  }

  async function beforePush(nextTag) {

  }

  async function afterPush(tag) {
    if (!this.config.get('github.release')) return

    const resp = await store.octokit.request('POST /repos/{owner}/{repo}/releases', {
      owner: store.owner,
      repo: store.repo,
      tag_name: tag
    })
    if (resp.status == 201) {
      console.log(colors.green(`Github release created successfully.`))
    }
    else {
      console.log(resp.data)
    }
  }

  return {
    initiated: initiated,
    beforePush: beforePush,
    afterPush: afterPush
  }
}

module.exports = github()

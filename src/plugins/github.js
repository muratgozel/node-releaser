const { Octokit, App, Action } = require('octokit')

function github() {
  const store = {
    octokit: null,
    owner: null,
    repo: null
  }

  function initiated(config, git) {
    store.octokit = new Octokit({
      auth: config.get('github.token'),
      userAgent: config.get('releaser.name') + '/' + config.get('releaser.version')
    })

    const remote = git.getRemoteOrigin()
    store.owner = remote.owner
    store.repo = remote.repo
  }

  function beforePush(nextTag) {

  }

  function afterPush(config, tag) {
    if (!config.get('github.release')) return

    store.octokit.request('POST /repos/{owner}/{repo}/releases', {
      owner: store.owner,
      repo: store.repo,
      tag_name: tag
    })
  }

  return {
    initiated: initiated,
    beforePush: beforePush,
    afterPush: afterPush
  }
}

module.exports = github()

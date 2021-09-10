const colors = require('colors/safe')
const gitlabGot = require('gl-got')

function gitlab() {
  const store = {
    path: null
  }

  async function initiated() {
    const remote = this.git.getRemoteOrigin()
    store.path = encodeURIComponent(remote.path)
  }

  async function beforePush(nextTag) {

  }

  async function afterPush(tag, changelog) {
    if (!this.config.get('gitlab.release')) return

    console.log(colors.blue(`Creating a release (${tag}) on Gitlab...`))

    const body = changelog.map(item => '- ' + item).join("\r\n")
    const payload = {
      baseUrl: 'https://gitlab.com/api/v3',
      token: this.config.get('gitlab.token'),
      body: {
        tag_name: tag,
        description: body
      }
    }
    const resp = await gitlabGot('/projects/' + store.path + '/releases', payload)
    try {
      if (resp.body.tag_name != tag) {
        console.log(resp.body)
      }
    } catch (e) {
      console.log(resp.rawBody.toString())
      throw e
    }
  }

  return {
    initiated,
    beforePush,
    afterPush
  }
}

module.exports = gitlab()

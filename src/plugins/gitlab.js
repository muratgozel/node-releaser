const colors = require('colors/safe')
const got = require('got')

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
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': this.config.get('gitlab.token'),
        'Content-Type': 'application/json'
      },
      json: {
        tag_name: tag,
        description: body
      }
    }
    const resp = await got(`https://gitlab.example.com/api/v4/projects/${store.path}/releases`, payload).json()
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

import got from "got";

class Github {
  token=null
  userAgent=null

  constructor({token, userAgent}) {
    this.token = token
    this.userAgent = userAgent
    this.userTimeZone = this.findTimezone()
  }

  init() {
  }

  async createRelease(owner, repo, tag, body) {
    try {
      const response = await got({
        method: 'POST',
        url: `https://api.github.com/repos/${owner}/${repo}/releases`,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        json: {
          tag_name: tag,
          body: body
        }
      })

      try {
        const body = JSON.parse(response.rawBody.toString())
      }
      catch (err2) {
        return new Error(`Github release failed. Couldn't parse response body.`, {cause: err2})
      }
    }
    catch (err) {
      return new Error(`Github release failed: ${e.message}`, {cause: err})
    }

    return true
  }

  findTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export default Github
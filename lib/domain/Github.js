import {Octokit} from "octokit";

class Github {
  token=null
  userAgent=null
  octokit=null

  constructor({token, userAgent}) {
    this.token = token
    this.userAgent = userAgent
    this.userTimeZone = this.findTimezone()
  }

  init() {
    this.octokit = new Octokit({
      auth: this.token,
      userAgent: this.userAgent,
      timeZone: this.userTimeZone
    })
  }

  async createRelease(owner, repo, tag, body) {
    const response = await this.octokit.request('POST /repos/{owner}/{repo}/releases', {
      owner: owner,
      repo: repo,
      tag_name: tag,
      body: body
    })

    if (response.status != 201) {
      return new Error(`Github release failed. The response was ${response.data}`)
    }

    return true
  }

  findTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export default Github
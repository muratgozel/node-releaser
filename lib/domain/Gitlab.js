import got from "got";

class Gitlab {
  constructor({token, userAgent}) {
    this.token = token
    this.userAgent = userAgent
    this.userTimeZone = this.findTimezone()
  }

  async createRelease(urlEncodedPath, tag, body) {
    let response = null
    try {
      response = await got({
        method: 'POST',
        url: `https://gitlab.com/api/v4/projects/${urlEncodedPath}/releases`,
        headers: {
          'PRIVATE-TOKEN': this.token,
          'Content-Type': 'application/json'
        },
        json: {
          tag_name: tag,
          description: body
        }
      })

      try {
        const body = JSON.parse(response.rawBody.toString())

        if (body.tag_name !== tag) {
          return new Error(`Gitlab release failed. The response was ${response.rawBody.toString()}`)
        }
      }
      catch (e2) {
        return new Error(`Gitlab release failed. Couldn't get json response. The response was ${response.rawBody.toString()}`, {cause: e2})
      }
    }
    catch (e) {
      return new Error(`Gitlab release failed: ${e.message}`, {cause: e})
    }

    return true
  }

  findTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export default Gitlab
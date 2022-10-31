import {spawn} from 'node:child_process';
import {writeFile, rm} from "node:fs/promises";
import path from "node:path";
import * as dotenv from 'dotenv';
import got from "got";

dotenv.config({path: path.resolve(process.cwd(), '.test.env')});

(function(env) {
  const resolvedRemoteUrl = resolveRemoteUrl(process.env.GITLAB_REPO)
  const gitlabDataPath = path.resolve(process.cwd(), 'spec/support/data/gitlab')

  env.gitlabProjectPath = path.join(gitlabDataPath, resolvedRemoteUrl.repo)
  env.timestamp = Date.now().toString()

  async function prepareGitlabSpec() {
    //await rm(env.gitlabProjectPath, {recursive: true})
    await fetchRepo()
    await writeFile(path.join(env.gitlabProjectPath, 'tick.md'), env.timestamp, {encoding: 'utf8'})

    async function fetchRepo() {
      return new Promise(function (resolve, reject) {
        let stdout, stderr = ''
        const cmd = spawn('git', ['clone', process.env.GITLAB_REPO], {cwd: gitlabDataPath})
        cmd.stdout.on('data', data => stdout += data)
        cmd.stderr.on('data', data => stderr += data)
        cmd.on('close', code => code !== 0 ?
          reject(new Error(`Exited with code ${code} and stderr was ${stderr}`)) :
          resolve({code, stdout, stderr}))
      })
    }
  }

  async function cleanupGitlabSpec() {
    await rm(env.gitlabProjectPath, {recursive: true})
  }

  function resolveRemoteUrl(url) {
    const result = url.replace(/((https:\/\/)|(git@))((github\.com)|(gitlab\.com))(:|\/)/, '').replace(/(\.git)$/, '').split('/')

    return {
      owner: result[0],
      project: result.length === 3 ? result[1] : '',
      repo: result[result.length - 1]
    }
  }

  async function verifyRelease() {
    const urlEncodedPath = encodeURIComponent([resolvedRemoteUrl.owner, resolvedRemoteUrl.project, resolvedRemoteUrl.repo]
      .filter(v => v.length > 0).join('/'))

    const response = await got({
      method: 'GET',
      url: `https://gitlab.com/api/v4/projects/${urlEncodedPath}/releases`,
      headers: {
        'PRIVATE-TOKEN': process.env.GITLAB_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': this.userAgent
      }
    })

    const arr = JSON.parse(response.rawBody.toString())

    return arr[0]
  }

  env.prepareGitlabSpec = prepareGitlabSpec
  env.cleanupGitlabSpec = cleanupGitlabSpec
  env.verifyGitlabRelease = verifyRelease

})(jasmine.getEnv());
import {spawn} from 'node:child_process';
import {writeFile, rm, readFile} from "node:fs/promises";
import path from "node:path";
import * as dotenv from 'dotenv';
import got from "got";

dotenv.config({path: path.resolve(process.cwd(), '.env')});

(function(env) {
  const resolvedRemoteUrl = resolveRemoteUrl(process.env.GITHUB_REPO)
  const githubDataPath = path.resolve(process.cwd(), 'spec/support/data/github')

  env.githubProjectPath = path.join(githubDataPath, resolvedRemoteUrl.repo)
  env.timestamp = Date.now().toString()

  async function prepareGithubSpec() {
    await fetchRepo()
    await writeFile(path.join(env.githubProjectPath, 'tick.md'), env.timestamp, {encoding: 'utf8'})

    async function fetchRepo() {
      return new Promise(function (resolve, reject) {
        let stdout, stderr = ''
        const cmd = spawn('git', ['clone', process.env.GITHUB_REPO], {cwd: githubDataPath})
        cmd.stdout.on('data', data => stdout += data)
        cmd.stderr.on('data', data => stderr += data)
        cmd.on('close', code => code !== 0 ?
          reject(new Error(`Exited with code ${code} and stderr was ${stderr}`)) :
          resolve({code, stdout, stderr}))
      })
    }
  }

  async function cleanupGithubSpec() {
    await rm(env.githubProjectPath, {recursive: true})
  }

  function resolveRemoteUrl(url) {
    const result = url.replace(/((https:\/\/)|(git@))((github\.com)|(gitlab\.com))(:|\/)/, '').replace(/(\.git)$/, '').split('/')

    return {
      owner: result[0],
      repo: result[result.length - 1]
    }
  }

  async function verifyRelease() {
    const response = await got({
      method: 'GET',
      url: `https://api.github.com/repos/${resolvedRemoteUrl.owner}/${resolvedRemoteUrl.repo}/releases/latest`,
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    return JSON.parse(response.rawBody.toString()).body
  }

  async function verifyReleaserConfig(location) {
    const content = await readFile(path.join(env.githubProjectPath, location), {encoding: 'utf8'})
    const obj = JSON.parse(content)
    return location === 'package.json' ? obj.releaser : obj;
  }

  async function getMostRecentTag() {
    return new Promise(function (resolve, reject) {
      const revs = spawn('git', ['rev-list', '--tags', '--max-count=1'], {cwd: env.githubProjectPath})
      revs.stdout.on('data', data => {
        const hash = data.toString().trim()
        const describe = spawn('git', ['describe', '--tags', hash], {cwd: env.githubProjectPath})
        describe.stdout.on('data', line => resolve(line.toString().trim()))
        describe.on('close', code => code !== 0 ? reject(new Error(`Exited with code ${code}`)) : null)
      })
      revs.on('close', code => code !== 0 ? reject(new Error(`Exited with code ${code}`)) : null)
    })
  }

  env.prepareGithubSpec = prepareGithubSpec
  env.cleanupGithubSpec = cleanupGithubSpec
  env.verifyGithubRelease = verifyRelease
  env.verifyReleaserConfig = verifyReleaserConfig
  env.getMostRecentTag = getMostRecentTag

})(jasmine.getEnv());
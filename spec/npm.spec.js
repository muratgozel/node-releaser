import {writeFile, readFile} from "node:fs/promises";
import path from "node:path";

describe('npm plugin', () => {
  beforeAll(async function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

    await jasmine.getEnv().prepareGithubSpec()
    await writeFile(path.join(jasmine.getEnv().githubProjectPath, 'package.json'), JSON.stringify({name: 'releaser-test', version: '0.1.0'}, null, 2))
  })

  afterAll(async function() {
    await jasmine.getEnv().cleanupGithubSpec()
  })

  it('updates version field of package.json', async () => {
    const config = JSON.parse(await readFile(path.join(jasmine.getEnv().githubProjectPath, '.releaser.json'), {encoding: 'utf8'}))
    await writeFile(path.join(jasmine.getEnv().githubProjectPath, '.releaser.json'), JSON.stringify(Object.assign({}, config, {npmUpdatePackageVersion: true})))
    const description = jasmine.getEnv().timestamp
    const {code, stderr} = await jasmine.getEnv().getExitCode('node', ['cli/index.js', 'commit',
      '-l', 'preminor.beta',
      '-m', description,
      '--project-path', jasmine.getEnv().githubProjectPath,
      '--non-interactive'])
    expect(code).toBe(0)

    const {version} = JSON.parse(await readFile(path.join(jasmine.getEnv().githubProjectPath, 'package.json'), {encoding: 'utf8'}))
    const gitVersion = await jasmine.getEnv().getMostRecentTag()
    expect(version).toBe(gitVersion)
  })

  it('publishes packages on npm', async () => {
    const config = JSON.parse(await readFile(path.join(jasmine.getEnv().githubProjectPath, '.releaser.json'), {encoding: 'utf8'}))
    await writeFile(path.join(jasmine.getEnv().githubProjectPath, '.releaser.json'), JSON.stringify(Object.assign({}, config, {npmPublishPackage: true, npmPublishPackageArgs: ['--dry-run']})))

    const description = jasmine.getEnv().timestamp
    const {code, stderr} = await jasmine.getEnv().getExitCode('node', ['cli/index.js', 'release',
      '-l', 'preminor.beta',
      '-m', description,
      '--project-path', jasmine.getEnv().githubProjectPath,
      '--non-interactive'])
    expect(code).toBe(0)
  })
})
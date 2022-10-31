import {writeFile, rm} from "node:fs/promises";
import path from "node:path";
import ProjectConfiguration from "../lib/domain/ProjectConfiguration.js";

describe('Check command', () => {
  beforeAll(async function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

    await jasmine.getEnv().prepareGithubSpec()
    await rm(path.join(jasmine.getEnv().githubProjectPath, '.releaser.json'))
  })

  afterAll(async function() {
    await jasmine.getEnv().cleanupGithubSpec()
  })

  it('creates a .releaser.json file.', async () => {
    const {code, stderr} = await jasmine.getEnv().getExitCode('node', ['cli/index.js', 'check',
      '--project-path', jasmine.getEnv().githubProjectPath,
      '--non-interactive',
      '--auto-configure'])
    expect(code).toBe(0)

    const obj = await jasmine.getEnv().verifyReleaserConfig('.releaser.json')
    const projectConfiguration = new ProjectConfiguration({projectPath: jasmine.getEnv().githubProjectPath, projectPackage: null})
    await rm(path.join(jasmine.getEnv().githubProjectPath, '.releaser.json'))
    expect(projectConfiguration.validate(obj)).toBe(true)
  })

  it('updates package.json file to store configuration.', async () => {
    await writeFile(path.join(jasmine.getEnv().githubProjectPath, 'package.json'), JSON.stringify({name: 'releaser-test', version: '0.1.0'}, null, 2))
    const {code, stderr} = await jasmine.getEnv().getExitCode('node', ['cli/index.js', 'check',
      '--project-path', jasmine.getEnv().githubProjectPath,
      '--non-interactive',
      '--auto-configure',
      '--prefer-config', 'package.json'])
    expect(code).toBe(0)

    const obj = await jasmine.getEnv().verifyReleaserConfig('package.json')
    const projectConfiguration = new ProjectConfiguration({projectPath: jasmine.getEnv().githubProjectPath, projectPackage: null})
    await rm(path.join(jasmine.getEnv().githubProjectPath, 'package.json'))
    expect(projectConfiguration.validate(obj)).toBe(true)
  })
})
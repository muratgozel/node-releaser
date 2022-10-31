describe('Gitlab plugin', () => {
  beforeEach(async function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

    await jasmine.getEnv().prepareGitlabSpec()
  })

  afterEach(async function() {
    await jasmine.getEnv().cleanupGitlabSpec()
  })

  it('creates a release.', async () => {
    const description = jasmine.getEnv().timestamp
    const {code, stderr} = await jasmine.getEnv().getExitCode('node', ['cli/index.js', 'release',
      '-l', 'preminor.beta',
      '-m', description,
      '--project-path', jasmine.getEnv().gitlabProjectPath,
      '--non-interactive',
      '--auto-configure'])
    expect(code).toBe(0)

    const result = await jasmine.getEnv().verifyGitlabRelease()
    expect(result.description.trim()).toBe(description)
  })
})
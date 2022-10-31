describe('Github plugin', () => {
  beforeEach(async function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

    await jasmine.getEnv().prepareGithubSpec()
  })

  afterEach(async function() {
    await jasmine.getEnv().cleanupGithubSpec()
  })

  it('creates a release.', async () => {
    const description = jasmine.getEnv().timestamp
    const {code, stderr} = await jasmine.getEnv().getExitCode('node', ['cli/index.js', 'release',
      '-l', 'preminor.beta',
      '-m', description,
      '--project-path', jasmine.getEnv().githubProjectPath,
      '--non-interactive',
      '--auto-configure'])
    expect(code).toBe(0)

    const result = await jasmine.getEnv().verifyGithubRelease()
    expect(result.trim()).toBe(description)
  })
})
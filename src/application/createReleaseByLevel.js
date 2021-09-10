const colors = require('colors/safe')

module.exports = async function createReleaseByLevel(level, ctx) {
  const {git, config, versioning, plugins, messages} = ctx

  git.verifyCodebase()

  const scheme = config.get('versioning.scheme')
  const calverFormat = config.get('versioning.format')
  const currentTag = git.getLatestTag()
  const nextTag = versioning.generateNextTag(level, currentTag, scheme, calverFormat)

  plugins.call('beforePush', nextTag)

  console.log(colors.blue(`Releasing new version ${nextTag}`))

  git.push(nextTag, messages)
  const changelog = git.getChangelogForTag(nextTag)

  plugins.call('afterPush', config, nextTag)

  console.log(colors.green(`Release successful. (${nextTag})`))
}

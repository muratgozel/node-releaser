const colors = require('colors/safe')

module.exports = async function createReleaseByLevel(level, ctx) {
  const {git, config, versioning, plugins, messages, forceCalverFormat, inputCurrentTag} = ctx

  git.verifyCodebase()

  plugins.registerDefaultPlugins(config)
  plugins.registerUserPlugins(config)

  await plugins.call('initiated')

  const scheme = config.get('versioning.scheme')
  const format = config.get('versioning.format')
  const currentTag = inputCurrentTag || git.getLatestTag(scheme, format, config, versioning)
  const currentTagBare = plugins.getContext().getBareVersion(currentTag)
  const nextTagBare = versioning.generateNextTag(level, currentTagBare, scheme, format, {forceCalverFormat})
  const nextTag = plugins.getContext().prefixTag(nextTagBare)

  await plugins.call('beforePush', nextTag)

  console.log(colors.blue(`Releasing new version ${nextTag}`))

  git.push(nextTag, messages)
  const changelog = git.getChangelogForTag(nextTag)

  await plugins.call('afterPush', nextTag, changelog)

  console.log(colors.green(`Release successful. (${nextTag})`))
}

import {access, constants, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import _ from "lodash/fp.js";
import Ajv from "ajv";
import Versioner from "./Versioner.js";

export const projectConfigurationSchema = {
  type: 'object',
  properties: {
    location: {enum: ['.releaser.json', 'package.json'], default: '.releaser.json'},
    versioningScheme: {enum: ['semver', 'calver']},
    versioningFormat: {type: 'string', format: 'calverFormat'},
    versioningPrefix: {type: 'string', default: ''},
    npmUpdatePackageVersion: {type: 'boolean', default: false},
    npmPublishPackage: {type: 'boolean', default: false},
    npmPublishPackageArgs: {type: 'array', items: {type: "string"}, default: []},
    githubRelease: {type: 'boolean', default: false},
    gitlabRelease: {type: 'boolean', default: false},
    dockerConnectionString: {type: 'string'},
    dockerBuildPath: {type: 'string', default: '.'},
    dockerBuildArgs: {type: 'array', items: {type: "string"}, default: []},
    dockerPushArgs: {type: 'array', items: {type: "string"}, default: []},
    hooks: {
      type: 'object',
      properties: {
        beforeCommit: {type: 'string'},
        afterCommit: {type: 'string'},
        beforePush: {type: 'string'},
        afterPush: {type: 'string'}
      }
    }
  },
  required: ['location', 'versioningScheme', 'versioningPrefix'],
  additionalProperties: false
}

const ajvInitOpts = {
  useDefaults: true,
  formats: {
    calverFormat: {
      type: 'string',
      validate: data => Versioner.validateCalverFormat(data)
    }
  }
}

class ProjectConfiguration {
  identifier = 'releaser'
  format = 'json'
  exists = null
  content = null
  writable = null
  error = null
  projectPath = null
  projectPackage = null
  validateContent = new Ajv(ajvInitOpts).compile(projectConfigurationSchema)

  constructor({projectPath, projectPackage}) {
    this.projectPath = projectPath
    this.projectPackage = projectPackage
    this.spawnOpts = {
      encoding: 'utf8',
      cwd: this.projectPath
    }
  }

  get location() {
    const filename = this.format === 'json' ? `.${this.identifier}.${this.format}` :
      this.format === 'package.json' ? this.format : ''
    return path.join(this.projectPath, filename)
  }

  get(key) {
    const schema = projectConfigurationSchema.properties
    if (!schema.hasOwnProperty(key)) {
      return null;
    }
    return this.content.hasOwnProperty(key) ? this.content[key] : (
      schema[key].type === 'string' ? (schema[key].default || '') :
      schema[key].type === 'array' ? (schema[key].default || []) :
      schema[key].type === 'object' ? (schema[key].default || {}) : null
    )
  }

  async verify() {
    // look for it in the package file first
    if (this.projectPackage &&
      _.isObject(this.projectPackage.content) &&
      this.projectPackage.content.hasOwnProperty(this.identifier)) {
      if (this.validate(this.projectPackage.content[this.identifier])) {
        this.exists = true
        this.content = this.projectPackage.content[this.identifier]
        this.writable = true
        this.format = 'package.json'

        return true
      }
    }

    // if not found, lets try for the file
    try {
      const content = await readFile(this.location, {encoding: 'utf8', flag: 'r'})

      this.exists = true

      try {
        const json = JSON.parse(content)
        const valid = this.validate(json)
        if (valid instanceof Error) {
          return new Error(`Configuration file validation failed. ` +
            `Please manually check the content of the file.`, {cause: valid})
        }

        this.content = json
        this.format = 'json'
      }
      catch (e) {
        return new Error(`Couldn't parse configuration file. ` +
          `Please manually check the content of the file.`, {cause: e})
      }
    }
    catch (e) {
      this.exists = false
    }

    try {
      await access(this.projectPath, constants.R_OK | constants.W_OK)

      this.writable = true

      return true;
    }
    catch (e) {
      return new Error(`Missing write permission for the project directory.`, {cause: e})
    }
  }

  validate(content) {
    const valid = this.validateContent(content)

    if (valid === false) {
      return this.validateContent.errors[0]
    }

    return true
  }

  async persist(obj) {
    const valid = this.validate(obj)
    if (valid instanceof Error) {
      return new Error(`Couldn't validate configuration. ${valid.message}`)
    }

    if (_.isObject(this.content)) {
      obj = Object.assign({}, this.content, obj)
    }

    if (obj.location === '.releaser.json') {
      this.format = 'json'
      try {
        await writeFile(this.location, JSON.stringify(obj, null, 2))
      }
      catch (e) {
        return e
      }
    }

    if (obj.location === 'package.json') {
      this.format = 'package.json'
      this.projectPackage.content[this.identifier] = obj
      await this.projectPackage.save()
    }

    this.exists = true
    this.content = obj
    this.writable = true

    return true
  }
}

export default ProjectConfiguration
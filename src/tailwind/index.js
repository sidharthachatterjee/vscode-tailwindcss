const _ = require('lodash')
const { workspace } = require('vscode')
const { readFile } = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(readFile)

const requireFromString = require('../utils/require-from-string')

const tailwindStaticClasses = require('./static-classes')
const generateDynamicClasses = require('./dynamic-classes')

async function generateClasses() {
  // Some classes are static and do not need to be generated
  // whereas some need to be generated dynamically after reading the config file
  const staticClasses = tailwindStaticClasses

  // Find configuration file in the workspace
  let configurationFileResults, configurationFilePath, configFileString

  try {
    configurationFileResults = await workspace.findFiles(
      'tailwind.js',
      '**/node_modules/**'
    )
    configurationFilePath = configurationFileResults[0].fsPath
    configFileString = await readFileAsync(configurationFilePath, 'utf8')
  } catch (error) {
    // There's probably no config file present, assuming this project doesn't use tailwind and bailing
    console.log(
      "There's no config file present, assuming this project doesn't use tailwind and bailing",
      error
    )
    return []
  }

  const config = requireFromString(configFileString, configurationFilePath)

  const dynamicClasses = await generateDynamicClasses(config)

  // Return all classes, combined
  return _.concat(staticClasses, dynamicClasses)
}

module.exports = generateClasses

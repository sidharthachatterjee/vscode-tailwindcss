const { workspace, commands } = require('vscode')
const _ = require('lodash')
const fs = require('fs')
const util = require('util')
const path = require('path')
const { promisify } = require('bluebird')

const readFileAsync = promisify(fs.readFile)

function requireFromString(string, filename) {
  const Module = module.constructor

  const paths = Module._nodeModulePaths(path.dirname(filename))

  const newModule = new Module(filename, module.parent)
  newModule.filename = filename
  newModule.paths = paths
  newModule._compile(string, filename)
  return newModule.exports
}

async function generateDynamicClasses(config) {
  return config
}

async function generateClasses() {
  // Some classes are static and do not need to be generated
  // whereas some need to be generated dynamically after reading the config file
  const staticClasses = []

  // Find configuration file in the workspace
  const results = await workspace.findFiles('tailwind.js', '**/node_modules/**')
  const config = await readFileAsync(results[0].fsPath, 'utf8')

  const dynamicClasses = await generateDynamicClasses(
    requireFromString(config, results[0].fsPath)
  )

  // Combine all classes together and return
  return _.concat(staticClasses, dynamicClasses)
}

let classes

async function activate(context) {
  // Use tailwindcss config to generate classes
  classes = await generateClasses()

  const fileSystemWatcher = workspace.createFileSystemWatcher('**/tailwind.js')
  fileSystemWatcher.onDidChange(async () => {
    classes = await generateClasses()
  })

  commands.registerCommand('extension.sayHello', () => {
    console.log(classes)
  })
  // fileSystemWatcher.onDidCreate(generateClasses)
  // fileSystemWatcher.onDidDelete(generateClasses)

  // const filetypes = [
  //   {
  //     extension: typescriptreact,
  //     classMatchRegex: /className=["|']([\w- ]*$)/
  //   }
  // ]
  // const provider = {
  //   provideCompletionItems(document, position, token, context) {},
  //   resolveCompletionItem(item, token) {}
  // }
  // const disposable = languages.registerCompletionItemProvider(
  //   selector,
  //   provider,
  //   ...triggerCharacters
  // )
  // context.subscriptions.push(
  //   languages.registerCompletionItemProvider(
  //     extension,
  //     {
  //       provideCompletionItems(document, position) {
  //         return completionItems
  //       }
  //     },
  //     ...completionTriggerChars
  //   )
  // )
  // const disposables = _.map(filetypes, ({ extension, classMatchRegex }) =>
  //   languages.registerCompletionItemProvider(
  //     extension,
  //     provider,
  //     ...triggerCharacters
  //   )
  // )
  context.subscriptions.push(fileSystemWatcher)
}

function deactivate() {}

exports.activate = activate
exports.deactivate = deactivate

// TODO: Generate correct classes
// TODO: Create completion items for classes
// TODO: Dispose and create new completion items on invalidation
// TODO: Use default configuration if none is found in workspace
// TODO: Add completion support for multiple file types
// TODO: Enable support for Emmet

const {
  workspace,
  commands,
  languages,
  CompletionItem,
  CompletionItemKind,
  Position,
  Range
} = require('vscode')
const _ = require('lodash')
const fs = require('fs')
const util = require('util')
const path = require('path')
const { promisify } = require('bluebird')

const readFileAsync = promisify(fs.readFile)

const tailwindStaticClasses = require('./tailwind-static-classes')

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
  const staticClasses = tailwindStaticClasses

  // Find configuration file in the workspace
  const results = await workspace.findFiles('tailwind.js', '**/node_modules/**')
  const config = await readFileAsync(results[0].fsPath, 'utf8')

  // const dynamicClasses = await generateDynamicClasses(
  //   requireFromString(config, results[0].fsPath)
  // )
  const dynamicClasses = []

  // Combine all classes together and return
  return _.concat(staticClasses, dynamicClasses)
}

let classes

const triggerCharacters = [' ']

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

  const disposable = languages.registerCompletionItemProvider(
    'html',
    {
      provideCompletionItems: (document, position, token, context) => {
        // Get range including all characters in the current line
        //  till the current position
        const range = new Range(new Position(position.line, 0), position)

        // Get text in current line
        const textInCurrentLine = document.getText(range)

        const classesInCurrentLine = textInCurrentLine
          .match(/class=["|']([\w- ]*$)/)[1]
          .split(' ')

        return _
          .chain(classes)
          .difference(classesInCurrentLine)
          .map(classItem => {
            return new CompletionItem(classItem, CompletionItemKind.Variable)
          })
          .value()
      }
    },
    ...triggerCharacters
  )

  context.subscriptions.push(fileSystemWatcher, disposable)
}

function deactivate() {}

exports.activate = activate
exports.deactivate = deactivate

// TODO: Add completion support for multiple file types
// TODO: Generate dynamic classes
// TODO: Use default configuration if none is found in workspace
// TODO: Create new completion items on invalidation
// TODO: Add support for Tailwind prefixes
// TODO: Enable support for Emmet

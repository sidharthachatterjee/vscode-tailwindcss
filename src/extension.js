const {
  workspace,
  languages,
  CompletionItem,
  CompletionItemKind,
  Position,
  Range
} = require('vscode')

const _ = require('lodash')

const { readFile } = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(readFile)

const requireFromString = require('./utils/require-from-string')

const tailwindStaticClasses = require('./tailwind/static-classes')
const { generateDynamicClasses } = require('./tailwind/dynamic-classes')

async function generateClasses() {
  // Some classes are static and do not need to be generated
  // whereas some need to be generated dynamically after reading the config file
  const staticClasses = tailwindStaticClasses

  // Find configuration file in the workspace

  let configurationFileResults, configurationFilePath, config

  try {
    configurationFileResults = await workspace.findFiles(
      'tailwind.js',
      '**/node_modules/**'
    )
    configurationFilePath = configurationFileResults[0].fsPath
    config = await readFileAsync(configurationFilePath, 'utf8')
  } catch (error) {
    // There's no config file present, assuming this project doesn't use tailwind and bailing
    console.log(
      "There's no config file present, assuming this project doesn't use tailwind and bailing"
    )
    return []
  }

  const dynamicClasses = await generateDynamicClasses(
    requireFromString(config, configurationFilePath)
  )

  // Combine all classes together and return
  return _.concat(staticClasses, dynamicClasses)
}

let classes

const triggerCharacters = ['"', "'", ' ', '.']

async function activate(context) {
  // Use tailwindcss config to generate classes
  classes = await generateClasses()

  const fileSystemWatcher = workspace.createFileSystemWatcher('**/tailwind.js')

  fileSystemWatcher.onDidChange(async () => {
    classes = await generateClasses()
  })

  fileSystemWatcher.onDidCreate(async () => {
    classes = await generateClasses()
  })

  fileSystemWatcher.onDidDelete(() => {
    classes = []
  })

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

  const disposableForHtml = languages.registerCompletionItemProvider(
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

        return _.chain(classes)
          .difference(classesInCurrentLine)
          .map(classItem => {
            return new CompletionItem(classItem, CompletionItemKind.Variable)
          })
          .value()
      }
    },
    ...triggerCharacters
  )

  context.subscriptions.push(fileSystemWatcher, disposableForHtml)

  const disposableForJs = languages.registerCompletionItemProvider(
    'javascript',
    {
      provideCompletionItems: (document, position, token, context) => {
        // Get range including all characters in the current line
        //  till the current position
        const range = new Range(new Position(position.line, 0), position)

        // Get text in current line
        const textInCurrentLine = document.getText(range)

        const classesInCurrentLine = textInCurrentLine
          .match(/className=["|']([\w- ]*$)/)[1]
          .split(' ')

        return _.chain(classes)
          .difference(classesInCurrentLine)
          .map(classItem => {
            return new CompletionItem(classItem, CompletionItemKind.Variable)
          })
          .value()
      }
    },
    ...triggerCharacters
  )

  context.subscriptions.push(fileSystemWatcher, disposableForJs)
}

function deactivate() {}

exports.activate = activate
exports.deactivate = deactivate

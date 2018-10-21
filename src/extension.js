const {
  workspace,
  languages,
  CompletionItem,
  CompletionItemKind,
  Position,
  Range
} = require('vscode')

const _ = require('lodash')

const generateClasses = require('./tailwind')

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

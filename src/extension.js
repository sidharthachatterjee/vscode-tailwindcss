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

const fileTypes = require('./filetypes')

let classes
const triggerCharacters = ['"', "'", ' ', '.']

async function activate(context) {
  // Generate classes and set them on activation
  classes = await generateClasses()

  const fileSystemWatcher = workspace.createFileSystemWatcher('**/tailwind.js')

  // Changes to tailwind.js should invalidate above cache
  fileSystemWatcher.onDidChange(async () => {
    classes = await generateClasses()
  })

  // This handles the case where the project didn't have tailwind.js
  // but was created after VS Code was initialized
  fileSystemWatcher.onDidCreate(async () => {
    classes = await generateClasses()
  })

  // If the config is deleted, it is safe to say that the user isn't going to
  // use tailwind and we should remove autocomplete suggestions
  fileSystemWatcher.onDidDelete(() => {
    classes = []
  })

  const disposables = _.flatMap(fileTypes, ({ extension, patterns }) => {
    return _.map(patterns, pattern =>
      languages.registerCompletionItemProvider(
        extension,
        {
          provideCompletionItems: (document, position) => {
            // Get range including all characters in the current line
            //  till the current position
            const range = new Range(new Position(position.line, 0), position)

            // Get text in current line
            const textInCurrentLine = document.getText(range)

            const classesInCurrentLine = textInCurrentLine
              .match(pattern.regex)[1]
              .split(pattern.splitCharacter)

            return _.chain(classes)
              .difference(classesInCurrentLine)
              .map(classItem => {
                return new CompletionItem(
                  classItem,
                  CompletionItemKind.Variable
                )
              })
              .value()
          }
        },
        ...triggerCharacters
      )
    )
  })

  context.subscriptions.push(disposables)
}

function deactivate() {}

exports.activate = activate
exports.deactivate = deactivate

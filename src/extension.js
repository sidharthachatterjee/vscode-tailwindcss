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
  console.log(config)

  const backgroundColors = _.map(
    config.backgroundColors,
    (colorHash, colorName) => `bg-${colorName}`
  )

  const backgroundSize = _.map(
    config.backgroundSize,
    (sizeValue, sizeName) => `bg-${sizeName}`
  )

  const borderColors = _.map(
    config.borderColors,
    (colorHash, colorName) => `border-${colorName}`
  )

  const fontColors = _.map(
    config.textColors,
    (colorHash, colorName) => `font-${colorName}`
  )

  const fontFamilies = _.map(
    config.fonts,
    (fonts, fontName) => `font-${fontName}`
  )

  const widths = _.map(
    config.width,
    (widthValue, widthName) => `w-${widthName}`
  )

  const minWidths = _.map(
    config.minWidth,
    (widthValue, widthName) => `min-w-${widthName}`
  )

  const maxWidths = _.map(
    config.maxWidth,
    (widthValue, widthName) => `max-w-${widthName}`
  )

  const heights = _.map(
    config.height,
    (heightValue, heightName) => `h-${heightName}`
  )

  const minHeights = _.map(
    config.minHeight,
    (heightValue, heightName) => `min-h-${heightName}`
  )

  const maxHeights = _.map(
    config.maxHeight,
    (heightValue, heightName) => `max-h-${heightName}`
  )

  const leading = _.map(
    config.leading,
    (leadingValue, leadingName) => `leading-${leadingName}`
  )

  const tracking = _.map(
    config.tracking,
    (trackingValue, trackingName) => `tracking-${trackingName}`
  )

  const opacity = _.map(
    config.opacity,
    (opacityValue, opacityName) => `opacity-${opacityName}`
  )

  const fill = _.map(
    config.svgFill,
    (fillValue, fillName) => `fill-${fillName}`
  )

  const stroke = _.map(
    config.svgStroke,
    (strokeValue, strokeName) => `stroke-${strokeName}`
  )

  const zIndex = _.map(
    config.zIndex,
    (zIndexValue, zIndexName) => `z-${zIndexName}`
  )

  const shadows = _.map(
    config.shadows,
    (shadowValue, shadowName) => `shadow-${shadowName}`
  )

  const textSizes = _.map(
    config.textSizes,
    (value, modifier) => `text-${modifier}`
  )

  const fontWeights = _.map(
    config.fontWeights,
    (value, modifier) => `text-${modifier}`
  )

  const defaultBorderRadius = [
    'rounded',
    'rounded-t',
    'rounded-r',
    'rounded-b',
    'rounded-l',
    'rounded-tl',
    'rounded-tr',
    'rounded-br',
    'rounded-bl	'
  ]

  const borderRadius = _.flatMap(
    _.omit(config.borderRadius, 'default'),
    (value, modifier) => [
      `rounded-${modifier}`,
      `rounded-t-${modifier}`,
      `rounded-r-${modifier}`,
      `rounded-b-${modifier}`,
      `rounded-l-${modifier}`,
      `rounded-tl-${modifier}`,
      `rounded-tr-${modifier}`,
      `rounded-br-${modifier}`,
      `rounded-bl-${modifier}`
    ]
  )

  const borders = _.flatMap(config.borderWidths, (value, modifier) => [
    `border-${modifier}`,
    `border-t-${modifier}`,
    `border-r-${modifier}`,
    `border-b-${modifier}`,
    `border-l-${modifier}`
  ])

  const margin = _.flatMap(config.margin, (value, modifier) => [
    `m-${modifier}`,
    `my-${modifier}`,
    `mx-${modifier}`,
    `mt-${modifier}`,
    `mr-${modifier}`,
    `mb-${modifier}`,
    `ml-${modifier}`
  ])

  const negativeMargin = _.flatMap(config.margin, (value, modifier) => [
    `-m-${modifier}`,
    `-my-${modifier}`,
    `-mx-${modifier}`,
    `-mt-${modifier}`,
    `-mr-${modifier}`,
    `-mb-${modifier}`,
    `-ml-${modifier}`
  ])

  const padding = _.flatMap(config.padding, (value, modifier) => [
    `p-${modifier}`,
    `py-${modifier}`,
    `px-${modifier}`,
    `pt-${modifier}`,
    `pr-${modifier}`,
    `pb-${modifier}`,
    `pl-${modifier}`
  ])

  return _.concat(
    backgroundColors,
    backgroundSize,
    borderColors,
    fontColors,
    fontFamilies,
    widths,
    minWidths,
    maxWidths,
    heights,
    minHeights,
    maxHeights,
    leading,
    tracking,
    opacity,
    fill,
    stroke,
    zIndex,
    shadows,
    textSizes,
    fontWeights,
    defaultBorderRadius,
    borderRadius,
    borders,
    margin,
    negativeMargin,
    padding
  )
}

async function generateClasses() {
  // Some classes are static and do not need to be generated
  // whereas some need to be generated dynamically after reading the config file
  const staticClasses = tailwindStaticClasses

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
// TODO: Use default configuration if none is found in workspace
// TODO: Create new completion items on invalidation
// TODO: Add support for Tailwind prefixes
// TODO: Enable support for Emmet
// TODO: Add error handling
// TODO: Figure out a way to use Tailwind in node_modules to generate classes
// TODO: Add support to use current project's Tailwind
// TODO: Add support for prefixes

// Borrowed from https://github.com/zignd/HTML-CSS-Class-Completion/blob/master/src/extension.ts

const classRegex = /class=["|']([\w- ]*$)/
const classNameRegex = /className=["|']([\w- ]*$)/
const applyRegex = /@apply ([\.\w- ]*$)/
const emmetRegex = /(?=\.)([\w-\. ]*$)/

const jsPatterns = [
  {
    regex: classRegex,
    splitCharacter: ' '
  },
  {
    regex: classNameRegex,
    splitCharacter: ' '
  },
  {
    regex: emmetRegex,
    splitCharacter: '.'
  }
]

const htmlPatterns = [
  {
    regex: classRegex,
    splitCharacter: ' '
  },
  {
    regex: emmetRegex,
    splitCharacter: '.'
  }
]

const stylesPatterns = [
  {
    regex: applyRegex,
    splitCharacter: ' '
  }
]

const fileTypes = [
  {
    extension: 'javascript',
    patterns: jsPatterns
  },
  {
    extension: 'javascriptreact',
    patterns: jsPatterns
  },
  {
    extension: 'typescriptreact',
    patterns: jsPatterns
  },
  {
    extension: 'html',
    patterns: htmlPatterns
  },
  {
    extension: 'php',
    patterns: htmlPatterns
  },
  {
    extension: 'vue',
    patterns: htmlPatterns
  },
  {
    extension: 'css',
    patterns: stylesPatterns
  },
  {
    extension: 'scss',
    patterns: stylesPatterns
  }
]

module.exports = fileTypes

const path = require('path')

function requireFromString(string, filename) {
  const Module = module.constructor

  const paths = Module._nodeModulePaths(path.dirname(filename))

  const newModule = new Module(filename, module.parent)
  newModule.filename = filename
  newModule.paths = paths
  newModule._compile(string, filename)
  return newModule.exports
}

module.exports = requireFromString

const Module = require('module')
const path = require('path')
const semver = require('semver')

/**
 * node特性支持判断
 */
const resolve = semver.satisfies(process.version, '>=10.0.0') ? require.resolve : resolveFallback

/**
 * 兼容低版本node
 */
const createRequire =
  Module.createRequire ||
  Module.createRequireFromPath ||
  function(filename) {
    const mod = new Module(filename, null)
    mod.filename = filename
    mod.paths = Module._nodeModulePaths(path.dirname(filename))

    mod._compile(`module.exports = require;`, filename)

    return mod.exports
  }

function resolveFallback(request, options) {
  const isMain = false
  const fakeParent = new Module('', null)

  const paths = []

  for (let i = 0; i < options.paths.length; i++) {
    const p = options.paths[i]
    fakeParent.paths = Module._nodeModulePaths(p)
    const lookupPaths = Module._resolveLookupPaths(request, fakeParent, true)

    if (!paths.includes(p)) paths.push(p)

    for (let j = 0; j < lookupPaths.length; j++) {
      if (!paths.includes(lookupPaths[j])) paths.push(lookupPaths[j])
    }
  }

  const filename = Module._findPath(request, paths, isMain)
  if (!filename) {
    const err = new Error(`Cannot find module '${request}'`)
    err.code = 'MODULE_NOT_FOUND'
    throw err
  }
  return filename
}

/**
 * 试探性resolve,避免resolve导致的进程中断
 */
exports.resolveModule = function(request, context) {
  let resolvedPath
  try {
    try {
      resolvedPath = createRequire(path.resolve(context, 'package.json')).resolve(request)
    } catch (e) {
      resolvedPath = resolve(request, { paths: [context] })
    }
  } catch (e) {}
  return resolvedPath
}

/**
 * 防止不存在加载不存在文件导致的问题
 */
exports.romeRequire = function(request, context, force = false) {
  // 兼容jest mock调试
  if (request.endsWith('migrator')) {
    return require(request)
  }
  try {
    return createRequire(path.resolve(context, 'package.json'))(request)
  } catch (e) {
    const resolvedPath = exports.resolveModule(request, context)
    if (resolvedPath) {
      if (force) {
        clearRequireCache(resolvedPath)
      }
      return require(resolvedPath)
    }
  }
}

exports.clearModule = function(request, context) {
  const resolvedPath = exports.resolveModule(request, context)
  if (resolvedPath) {
    clearRequireCache(resolvedPath)
  }
}

function clearRequireCache(id, map = new Map()) {
  const module = require.cache[id]
  if (module) {
    map.set(id, true)
    module.children.forEach(child => {
      if (!map.get(child.id)) clearRequireCache(child.id, map)
    })
    delete require.cache[id]
  }
}

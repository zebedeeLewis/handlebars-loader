const path = require('path')
const _ = require('underscore')
const hb = require('handlebars').create()
const loaderUtils = require('loader-utils')
const Utils = require('../../Utils')



const DEFAULT_ROOT = './'



/**
 * Different resource types that can be processed by a
 * JavaScriptCompiler.
 *
 * @readonly
 * @enum {string}
 * @property {string} Partial
 * @property {string} Helper
 * @property {string} Context
 */
const Resource_Type
  = { Partial : 'partial'
    , Helper  : 'helper'
    , Context : 'context'
    }


module.exports.Resource_Type = Resource_Type



/**
 * See handlebars built-in JavaScriptCompiler implementation
 * (Handlebars-Lang, Handlebars JavaScriptCompiler Implementation ).
 *
 */
function JavaScriptCompiler
  ( handlebarsLoader
  ) {
    this.handlebarsLoader = handlebarsLoader
  }


JavaScriptCompiler.prototype
  = Object.create(hb.JavaScriptCompiler.prototype)
JavaScriptCompiler.prototype.compiler = JavaScriptCompiler


module.exports.JavaScriptCompiler = JavaScriptCompiler



/**
 * Produce a strinified require statement suitable for use in a
 * webpack loader from the path to the given partial.
 *
 * @param {string} path
 * @return {string}
 */
function require_statement_from_path
  ( loaderAPI
  , resourcePath
  ) {
    if( !resourcePath ){ return undefined }

    const requestPath
      = loaderUtils.stringifyRequest(loaderAPI, resourcePath)

    return `require(${requestPath})`
  }


module.exports.require_statement_from_path
  = require_statement_from_path



/**
 * produce true if the given partial name is to be be interpreted as
 * path relative to the configured "root path".
 *
 * @param {string} partialName
 * @return {boolean}
 */
function is_root_relative
  ( partialName
  ) {
    return !( /^[\.\/]/.test(partialName) )
  }


module.exports.is_root_relative = is_root_relative



/**
 * @param {Array<string>} extensions
 * @param {string} resourcePath
 *
 * @throw {Error}
 * @TODO:
 *   - move this functionality to the Loader.Log module
 */
function throw_resource_resolve_error
  ( extensions
  , resourcePath
  ) {
    const message
      = 'Unable to resolve resource. Tried the following paths:\n'
      + extensions.map( ext => resourcePath + ext).join('\n')

    throw new Error(message)
  }



/**
 * @param {Array<string>} extensions
 * @param {string} resourcePath
 *
 * @return {string}
 */
function resolve_resource_path
  ( extensions
  , resourcePath
  ) {
    let resolveResult
    for( ext of extensions ) {
      try {
        return require.resolve(resourcePath + ext)
      } catch (e) {
        continue
      }
    }

    throw_resource_resolve_error(extensions, resourcePath)
  }



/**
 * @param {string} configuredRootPath
 * @return {string}
 */
function determine_root_path
  ( rootPath
  , rootContextPath
  , contextPath
  , resourceName
  ) {
    if( /^\$/.test(resourceName) ) {
      return path.join(rootContext, 'node_modules')
    }

    return (
      !_.isString(rootPath)
      ? DEFAULT_ROOT
      : rootPath
    )
  }


module.exports.determine_root_path = determine_root_path



/**
 * produce the path to the given resource
 *
 * @param {string} rootPath
 * @param {string} extensions
 * @param {string} resourceName
 * @return {string}
 */
function determine_path_to_resource
  ( rootPath
  , rootContextPath
  , contextPath
  , extensions
  , resourceName
  ) {
    const _rootPath
      = determine_root_path
          ( rootPath
          , rootContextPath
          , contextPath
          , resourceName
          )

    const resourcePath =
      is_root_relative(resourceName)
        ? path.join(rootPath, resourceName)
        : path.join(contextPath, resourceName)

    return resolve_resource_path(extensions, resourcePath)
  }



module.exports.determine_path_to_resource = determine_path_to_resource



/**
 * Produce a strinified require statement suitable for use in a
 * webpack loader from the given path.
 *
 * @param {Object} loaderAPI - See webpack loader API documentation
 * (Webpack Loader Interface)
 *
 * @param {string} resourcePath -
 *
 * @return {string}
 */
function require_default_statement_from_path
  ( loaderAPI
  , resourcePath
  ) {
    if( !resourcePath ){ return undefined }

    const requestPath
      = loaderUtils.stringifyRequest(loaderAPI, resourcePath)

    return `__default(require(${requestPath}))`
  }


module.exports.require_default_statement_from_path
  = require_default_statement_from_path



/**
 * Lookup the resource of the given name
 *
 * @param {string} parent
 * @param {string} name
 * @param {Resource_Type} type
 * @param {JavaScriptCompiler}
 *
 * @return {string}
 */
function lookup_name
  ( parent
  , name
  , type
  , compilerContext
  ) {
    const { loaderAPI
          , effectiveConfig
          , foundPartials
          , foundHelpers
          , foundUnclearStuff
          } = compilerContext.handlebarsLoader

    const { pathRoot, extensions } = effectiveConfig


    const resourcePath
      = determine_path_to_resource
          ( pathRoot
          , loaderAPI.rootContext
          , loaderAPI.context
          , (type === Resource_Type.Partial ? extensions : ['.js'])
          , name
          )

    const _require_statement_from_path
      = type === Resource_Type.Partial
      ? require_statement_from_path
      : require_default_statement_from_path


    const ret
      = _require_statement_from_path
          ( loaderAPI
          , resourcePath
          )


    return (
      ret || hb.JavaScriptCompiler.prototype.nameLookup.call
               ( compilerContext
               , parent
               , name
               , type
               )
    )
  }


JavaScriptCompiler.prototype.nameLookup
  = function
      ( parent
      , name
      , type
      ) {
        return lookup_name(parent, name, type, this)
      }


module.exports.lookup_name = lookup_name




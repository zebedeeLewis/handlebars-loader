const path = require('path')
const _ = require('underscore')
const hb = require('handlebars').create()
const loaderUtils = require('loader-utils')



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
 *
 * @TODO move this definition to the Loader.js file
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
 * produce the path to the given partial
 *
 * @param {string} rootPath
 * @param {string} extensions
 * @param {string} partialName
 * @return {string}
 */
function determine_path_to_partial
  ( rootPath
  , contextPath
  , extensions
  , partialName
  ) {
    const _rootPath
      = !_.isString(rootPath)
      ? DEFAULT_ROOT
      : rootPath

    const partialPath =
      is_root_relative(partialName)
        ? path.join(rootPath, partialName)
        : path.join(contextPath, partialName)

    return resolve_resource_path(extensions, partialPath)
  }



module.exports.determine_path_to_partial = determine_path_to_partial



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
  , contextPath
  , extensions
  , resourceName
  ) {
    const _rootPath
      = !_.isString(rootPath)
      ? DEFAULT_ROOT
      : rootPath

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

    const { debug, pathRoot, extensions } = effectiveConfig


    if (debug) {
      console.log("nameLookup %s %s %s", parent, name, type)
    }


    const resourcePath
      = type === Resource_Type.Partial
      ? determine_path_to_resource
          ( pathRoot
          , loaderAPI.context
          , extensions
          , name
          )
      : determine_path_to_resource
          ( pathRoot
          , loaderAPI.context
          , ['.js']
          , name
          )


    const ret
      = type === Resource_Type.Partial
      ? require_statement_from_path
          ( loaderAPI
          , resourcePath
          )
      : require_default_statement_from_path
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



/*
 * Append the given sourceNode to the compilers buffer.
 *
 * @param {JavaScriptCompiler} compilerContext - this compiler.
 *
 * @param {(string|SourceNode)} source - see SourceNode definition
 * (Handlebars-Lang, SourceNode Definition #L20) and the SourceNode
 * documentation from the "source-map" package (SourceNode Docs
 * "source-map" Package #sourcenode)
 *
 * @param {} location -
 * @param {boolean} explicit -
 *
 * @return {SourceNode}
 */
function append_to_buffer
  ( compilerContext
  , source
  , location
  , explicit
  ) {
    // See JavaScriptCompiler.appendToBuffer Implementation
    // (Handlebars-Lang, Handlebars JavaScriptCompiler.appendToBuffer
    // Implementation #L28)
    return (
      hb.JavaScriptCompiler.prototype.appendToBuffer.call
        ( compilerContext
        , source
        )
    )
  }


JavaScriptCompiler.prototype.appendToBuffer
  = function
      ( source
      , location
      , explicit
      ) {
        return append_to_buffer(this, source, location, explicit)
      }


module.exports.append_to_buffer = append_to_buffer


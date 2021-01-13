const path = require('path')
const fastparse = require("fastparse")
const _ = require('underscore')
const hb = require('handlebars').create()
const loaderUtils = require('loader-utils')
const HandlebarsLoader = require('../HandlebarsLoader')



const PARTIAL_BLOCK = '@partial-block'
const PLACEHOLDER_RE = /xxxxREPLACExxxx[0-9\.]+xxxx/g;
const DEFAULT_ROOT = './'

const MATCH_HTML_COMMENT = '<!--.*?-->'
const MATCH_CDATA = '<![CDATA[.*?]]>'
const MATCH_SCRIPT_TAG = '<[!\\?].*?>'
const MATCH_CLOSING_TAG = '<\/[^>]+>'
const MATCH_OPENING_TAG = '<([a-zA-Z\\-:]+)\\s*'
const CONSUME_WHITESPACES = '((\\n|r|t)|\\s)+'
const MATCH_END_OF_ATTRIBUTES = '>'
const MATCH_QUOTED_ATTRIBUTES
  = "(([a-zA-Z\\-]+)\\s*=\\s*\\\\\")([^\"]*)\\\\\""
const MATCH_NON_QUOTED_ATTRIBUTES
  = '(([a-zA-Z\\-]+)\\s*=\\s*)([^\\s>]+)'



function find_nested_requires
  ( match
  , strUntilValue
  , name
  , value
  , index
  ) {
    if( this.requiresPattern.test(value) ){
      this.results.push
        ( { start  : index + strUntilValue.length
          , length : value.length
          , value  : value
          }
        )
    }
  }



function parse_nested_requires
  ( str
  , requiresPattern
  ) {
    const parser
      = new fastparse(
          { outside : { [MATCH_HTML_COMMENT] : true
                      , [MATCH_CDATA]        : true
                      , [MATCH_SCRIPT_TAG]   : true
                      , [MATCH_CLOSING_TAG]  : true
                      , [MATCH_OPENING_TAG]  : 'inside'
                      }
          , inside  : { [CONSUME_WHITESPACES]         : true
                      , [MATCH_END_OF_ATTRIBUTES]     : 'outside'
                      , [MATCH_QUOTED_ATTRIBUTES]     : find_nested_requires
                      , [MATCH_NON_QUOTED_ATTRIBUTES] : find_nested_requires
                      }
          }
        )


    return (
      parser
        .parse
           ( 'outside'
           , str
           , { requiresPattern , results: [] }
           )
        .results
    )
  }



/**
 * Produce a unique placeholder value to the given context.
 *
 * @param {Object<string, string>} placeholderContext - the newly
 * created should not have a key in this object.
 *
 * @return {string}
 */
function generate_unique_placeholder
  ( placeholderContext
  ) {
    const generate_placeholder
      = () => ('xxxxREPLACExxxx' + Math.random() + 'xxxx')


    let placeholder = generate_placeholder()
    while( _.has(placeholderContext, placeholder) ){
      placeholder = generate_placeholder()
    }


    return placeholder
  }



function replace_with_placeholders
  ( str
  , replacement_set
  ) {
    const content = [str]
    const placeholderMap = {}
    const _replacement_set = replacement_set
    let replacement = _replacement_set.pop()


    while( replacement ) {
      let placeholder = generate_unique_placeholder(placeholderMap)
      placeholderMap[placeholder] = replacement.value

      let x = content.pop()
      content.push( x.substr(replacement.start + replacement.length) )
      content.push(placeholder)
      content.push( x.substr(0, replacement.start) )

      replacement = _replacement_set.pop()
    }


    content.reverse()


    return (
      { content        : content.join("")
      , placeholderMap : placeholderMap
      }
    )
  }



function quick_replace
  ( str
  , replacements
  , replaceFn
  ) {
    const withPlaceholders
      = replace_with_placeholders(str, replacements)
    const placeholderMap = withPlaceholders.placeholderMap

    PLACEHOLDER_RE.lastIndex = 0

    return (
      withPlaceholders.content.replace
        ( PLACEHOLDER_RE
        , function(match){
            const originValue = placeholderMap[match]
            return !originValue ? match : replaceFn(originValue)
          }
        )
    )
  }



/**
 * Different resource types that can be processed by a
 * LoaderJavaScriptCompiler.
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
 * @constructor
 */
function LoaderJavaScriptCompiler
  ( handlebarsLoader
  ) {
    this.handlebarsLoader = handlebarsLoader
  }


LoaderJavaScriptCompiler.prototype
  = Object.create(hb.JavaScriptCompiler.prototype)
LoaderJavaScriptCompiler.prototype.compiler = LoaderJavaScriptCompiler


module.exports.LoaderJavaScriptCompiler = LoaderJavaScriptCompiler



/**
 * Produce a strinified require statement suitable for use in a
 * webpack loader from the path to the given partial.
 *
 * @param {string} path
 * @return {string}
 */
function require_statement_from_path
  ( webpackLoaderContext
  , resourcePath
  ) {
    if( !resourcePath ){ return undefined }

    const requestPath
      = loaderUtils.stringifyRequest(webpackLoaderContext, resourcePath)

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
 */
function throw_resource_resolve_error
  ( extensions
  , resourcePath
  ) {
    const message
      = 'Unable to resolve resource. Tried the following paths:\n'
      + extensions.map( ext => resource + ext).join('\n')

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

    throw_resource_reslove(extensions, resourcePath)
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
 * Produce a strinified require statement suitable for use in a
 * webpack loader from the given path.
 *
 * @param {string} path
 * @return {string}
 * @TODO!!!
 */
function require_default_statement_from_path
  ( webpackLoaderContext
  , resourcePath
  ) {
    if( !resourcePath ){ return undefined }

    const requestPath
      = loaderUtils.stringifyRequest(webpackLoaderContext, resourcePath)

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
 * @param {LoaderJavaScriptCompiler}
 *
 * @return {string}
 */
function lookup_name
  ( parent
  , name
  , type
  , compilerContext
  ) {
    const { webpackLoaderContext
          , effectiveConfig
          , foundPartials
          , foundHelpers
          , foundUnclearStuff
          } = compilerContext.handlebarsLoader

    const { debug, rootRelative, extensions } = effectiveConfig


    if (debug) {
      console.log("nameLookup %s %s %s", parent, name, type)
    }


    debugger
    const resourcePath
      = determine_path_to_partial
          ( rootRelative
          , webpackLoaderContext.context
          , extensions
          , name
          )


    const ret
      = type === Resource_Type.Partial
      ? require_statement_from_path
          ( webpackLoaderContext
          , resourcePath
          )
      : require_default_statement_from_path
          ( webpackLoaderContext
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


LoaderJavaScriptCompiler.prototype.nameLookup
  = function
      ( parent
      , name
      , type
      ) {
        return lookup_name(parent, name, type, this)
      }


module.exports.lookup_name = lookup_name



/**
 * Push a quoted version of `str` onto the given compilers stack.
 *
 * @param {string} str
 * @param {LoaderJavaScriptCompiler} compilerContext
 *
 * @return {void}
 */
function push_string
  ( str
  , compilerContext
  ) {
    const { webpackLoaderContext
          , effectiveConfig
          } = compilerContext.handlebarsLoader

    const { inlineRequires } = effectiveConfig


    if (inlineRequires && inlineRequires.test(str)) {
      compilerContext.pushLiteral
        ( 'require('
        +   loaderUtils.stringifyRequest(webpackLoaderContext, str)
        + ')'
        )
    } else {
      hb.JavaScriptCompiler.prototype.pushString.call
        ( compilerContext
        , str
        )
    }
  }


LoaderJavaScriptCompiler.prototype.pushString
  = function
      ( str
      ) {
        return push_string(str, this)
      }


module.exports.push_string = push_string



/**
 * Produce true if the given string represents a templat chunk.
 *
 * @param {string} str
 *
 * @return {boolean}
 */
function is_template_chunk
  ( str
  ) {
    return (
         (typeof str === 'string')
      && (str.indexOf('"') === 0)
    )
  }


module.exports.is_template_chunk = is_template_chunk



/**
 * Append the given source string to the compilers buffer.
 *
 * @param {string} source
 * @param {} location
 * @param {LoaderJavaScriptCompiler} compilerContext
 *
 * @return {string}
 */
function append_to_buffer
  ( compilerContext
  , source
  , location
  , explicit
  ) {
    const { webpackLoaderContext
          , effectiveConfig
          } = compilerContext.handlebarsLoader

    const { inlineRequires } = effectiveConfig


    if( !inlineRequires ) {
      return (
        hb.JavaScriptCompiler.prototype.appendToBuffer.call
          ( compilerContext
          , source
          )
      )
    }


    const replaceFn
      = match => (
          '" + require('
          + loaderUtils.stringifyRequest(webpackLoaderContext, match)
          + '); + "'
        )

    const _source
      = is_template_chunk(source)
      ? quick_replace
          ( source
          , parse_nested_requires(source, inlineRequires)
          , replaceFn
          )
      : source


    return (
      hb.JavaScriptCompiler.prototype.appendToBuffer.call
        ( compilerContext
        , _source
        )
    )
  }


LoaderJavaScriptCompiler.prototype.appendToBuffer
  = function
      ( str
      , compilerContext
      ) {
        return append_to_buffer(this, str)
      }


module.exports.append_to_buffer = append_to_buffer


const _ = require('underscore')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')
const resolve = require('resolve')
const btoa = require('btoa')
const Utils = require('../../../Utils')



/**
 * Represents a module to be loaded and evaluated.
 *
 * @property {string} absolutePath - Absolute path to the given resource
 *
 * @property {string} absoluteRequest - webpack request with an absolute
 * path (i.e. including loaders, absolute path, query)
 *
 * @property {(null|string)} placeholder - This is a random unique place
 * holder representing this dependecy. When loading a module
 * asynchronously, this is used to stand in place of the modules exports
 * until the actual exports are available.
 *
 * @property {(Promise<*>|null)} promisedExports - A Promise that
 * resolves to the results of the module load operation (i.e. results of
 * calling loaderAPI.loadModule)
 *
 * @property {*} exports - the results of requiring a module (i.e.
 * results of calling require).
 *
 * @TODO:
 *   - make the collection of children modules a part of the Module
 *     object itself.
 */



/**
 * Produce a unique placeholder
 *
 * @return {string}
 */
function generate_placeholder
  (
  ) {
    return (
      '__HANDLEBARS_LOADER_NEO__'
      + Utils.random_number()
      + Utils.random_number()
    )
  }


module.exports.generate_placeholder = generate_placeholder



/**
 * Produce an updated SimpleModule with the properties from the
 * given Partial<SimpleModule>. This alter the original
 * SimpleModule.
 *
 * @param {Partial<SimpleModule>} modulePartial
 * @param {SimpleModule} module
 *
 * @return {SimpleModule}
 */
function patch_context
  ( { absolutePath
    , placeholder
    , absoluteRequest
    , promisedExports
    , exports
    }
  , context
  ) {
    Utils.set_context_property
      ( absolutePath 
      , get_request_parts(absoluteRequest || '').relativePath
      , 'absolutePath'
      , context
      )

    Utils.set_context_property
      ( placeholder
      , generate_placeholder()
      , 'placeholder'
      , context
      )

    Utils.set_context_property
      ( absoluteRequest
      , ''
      , 'absoluteRequest'
      , context
      )

    Utils.set_context_property
      ( promisedExports
      , null
      , 'promisedExports'
      , context
      )

    Utils.set_context_property
      ( exports
      , undefined
      , 'exports'
      , context
      )


    return context
  }


module.exports.patch_context = patch_context



/**
 * Produce a new SimpleModule with the properties from the given
 * Partial<HandlbarsSimpleModule>.
 *
 * @param {Partial<SimpleModule>} modulePartial
 * @return {SimpleModule}
 */
function create
  ( modulePartial
  ) {
    return patch_context(modulePartial, {})
  }


module.exports.create = create



/**
 * Produce an updated SimpleModule with the properties from the
 * given Partial<HandlbarsSimpleModule>. This does not alter the original
 * SimpleModule.
 *
 * @param {Partial<SimpleModule>} modulePartial
 * @param {SimpleModule} module
 *
 * @return {SimpleModule}
 */
function patch
  ( modulePartial
  , module
  ) {
    return patch_context(modulePartial, { ... module})
  }


module.exports.patch = patch



function extract_query_from_path
  ( resource
  ) {
    const indexOfLastExclMark
      = resource.lastIndexOf("!")

    const indexOfQuery
      = resource.lastIndexOf("?")


    if (indexOfQuery !== -1 && indexOfQuery > indexOfLastExclMark) {
      return (
        { relativePathWithoutQuery : resource.slice
                                       ( 0
                                       , indexOfQuery
                                       )
        , query                    : resource.slice
                                       ( indexOfQuery
                                       )
        }
      )
    }


    return (
      { relativePathWithoutQuery : resource
      , query                    : ''
      }
    )
  }


module.exports.extract_query_from_path = extract_query_from_path



/**
 * Produce an object containing the path, query and loaders sections of
 * a request string.
 *
 * @param {string} request
 */
function get_request_parts
  ( request
  ) {
    const { relativePathWithoutQuery
          , query
          } = extract_query_from_path(request)

    const indexOfLastExclMark
      = relativePathWithoutQuery.lastIndexOf("!")

    const loaders
      = request.slice(0, indexOfLastExclMark + 1)

    const relativePath
      = relativePathWithoutQuery.slice(indexOfLastExclMark + 1)

    return (
      { loaders
      , relativePath
      , query
      }
    )
  }


module.exports.get_request_parts = get_request_parts



/**
 * Cache the given module
 *
 * @param {SimpleModule} module -
 * @param {Map.<string, SimpleModule>} cache -
 * @return {Map.<string, SimpleModule>}
 */
function cache
  ( module
  , cache
  ) {
    cache.set( module.absolutePath, module )

    return cache
  }


module.exports.cache = cache



/**
 * @param {LoaderAPI} loaderAPI
 * @param {Map.<string, SimpleModule>} children
 * @param {string} basedir
 * @param {string} request
 * @return {*}
 */
function sandboxed_require
  ( loaderAPI
  , children
  , basedir
  , request
  ) {
    const module
      = require_module
          ( loaderAPI
          , children
          , basedir
          , request
          )


    cache(module, children)

    return module.exports || module.placeholder
  }


module.exports.sandboxed_require = sandboxed_require



/**
 * @param {LoaderAPI} loaderAPI
 * @param {Map.<string, SimpleModule>} children
 * @param {SimpleModule} module
 *
 * @return {contextifiedObject}
 */
function setup_sandbox
  ( loaderAPI
  , children
  , module
  ) {
    const exports = {}

    const _sandboxed_require
      = _.partial
          ( sandboxed_require
          , loaderAPI
          , children
          , path.dirname(module.absolutePath)
          )

    return (
      Object.assign
        ( { }
        , global
        , { exports
          , __webpack_public_path__: '' //TODO
          , module  : { exports }
          , require : _sandboxed_require
          }
        )
    )
  }


module.exports.setup_sandbox = setup_sandbox



/**
 * @param {string} filename
 * @param {string} source
 */
function prepare_script
  ( filename
  , source
  ) {
    const babelOptions
      = { babelrc : false
        , presets : [ [ require('@babel/preset-env')
                      , { modules : 'commonjs'
                        , targets : { node: 'current' }
                        }
                      ]
                    ]
        , plugins : [ require('babel-plugin-add-module-exports') ]
        }


    return (
      new vm.Script
        ( babel.transformSync( source, babelOptions ).code
        , { filename, displayErrors: true }
        )
    )
  }


module.exports.prepare_script = prepare_script



/**
 * Evaluate the given module in a sandbox environment to get the
 * results of the module module as well as its child dependencies.
 *
 * @param {LoaderAPI} loaderAPI
 * @param {Map.<string, SimpleModule>} children
 * @param {contextifiedObject} sandbox -
 * @param {SimpleModule} module -
 * @return {Promise.<SimpleModule>}
 */
function evaluate_in_sandbox
  ( loaderAPI
  , children
  , sandbox
  , module
  ) {
    if( !(module.promisedExports instanceof Promise) ){
      return Promise.resolve(module)
    }


    const _prepare_script
      = _.partial(prepare_script, module.absolutePath) )

    const _run_in_sandbox
      = script => script.runInNewContext(sandbox)

    const _swap_placeholders_for_exports
      = args => swap_placeholders_for_exports(...args)

    const _update_exports_and_evaluate_children
      = () => {
          const _module
            = patch
                ( { exports : sandbox.module.exports
                  , promisedExports : null
                  }
                , module
                )

          return (
            evaluate_dependencies
              ( loaderAPI
              , children
              )
            .then( _children => [_module, _children] )
          )
        }
        

    return (
      module
        .promisedExports
        .then(_prepare_script )
        .then(_run_in_sandbox )
        .then(_update_exports_and_evaluate_children )
        .then(_swap_placeholders_for_exports )
    )
  }


module.exports.evaluate_in_sandbox = evaluate_in_sandbox



/**
 * @param {LoaderAPI} loaderAPI
 * @param {SimpleModule} module
 * @return {SimpleModule}
 */
function load_module_as_buffer
  ( loaderAPI
  , module
  ) {
    const promisedExports
      = new Promise
          ( ( resolve
            , reject
            ) => {
              // loaderAPI.loadModule automatically calls
              // loaderAPI.addDependency for all requested modules
              loaderAPI.loadModule
                ( module.absoluteRequest
                , ( error
                  , source
                  , sourceMap
                  , module
                  ) => {
                    if( error ){
                      reject(error)
                    } else {
                      resolve(source)
                    }
                  }
                )
            }
          )

    return patch({ promisedExports }, module)
  }


module.exports.load_module_as_buffer = load_module_as_buffer



/**
 * @param {LoaderAPI} loaderAPI
 * @param {SimpleModule} module
 * @return {SimpleModule}
 */
function load_module_as_executable
  ( loaderAPI
  , module
  ) {
    const exports = require(module.absolutePath)
    loaderAPI.addDependency(module.absolutePath)

    return patch({ exports }, module)
  }


module.exports.load_module_as_executable
  = load_module_as_executable



/**
 * Require the given resource
 */
function require_module
  ( loaderAPI
  , children
  , basedir
  , request
  ) {
    const { loaders
          , relativePath
          , query
          } = get_request_parts(request)


    const absolutePath
      = resolve.sync
          ( relativePath
          , { basedir }
          )


    const load_module
      = loaders === "" && Utils.is_js_file(absolutePath)
      ? load_module_as_executable
      : load_module_as_buffer


    const module
      = children.has(absolutePath)
      ? children.get(absolutePath)
      : load_module
          ( loaderAPI
          , create
              ( { absolutePath
                , absoluteRequest : loaders + absolutePath + query
                }
              )
          )


    return module
  }


module.exports.require_module = require_module



function extract_exports
  ( exports
  ) {
    const hasBtoa = "btoa" in global
    const previousBtoa = global.btoa

    global.btoa = btoa

    try {
      return exports.toString()
    } catch (error) {
      throw error
    } finally {
      if (hasBtoa) {
        global.btoa = previousBtoa
      } else {
        delete global.btoa
      }
    }
  }


module.exports.extract_exports = extract_exports



/**
 * Replace each child modules placeholder in the given root
 * modules exported string, with the value of the child modules
 * own exported string.
 *
 * @param {SimpleModule} module
 * @param {Array.<SimpleModule>} children
 * @return {SimpleModule}
 */
function swap_placeholders_for_exports
  ( module
  , children
  ) {
    if( !_.isString(module.exports) ){ return module }


    const _to_placeholder_free
      = ( _module
        , childModule
        ) => {
          const exports
            = _module.exports.replace
                ( Utils.make_regexp(childModule.placeholder, 'g')
                , extract_exports(childModule.exports)
                )

          return patch({ exports }, _module)
        }


    return (
      _.reduce
        ( children
        , _to_placeholder_free
        , module
        )
    )
  }


module.exports.swap_placeholders_for_exports
  = swap_placeholders_for_exports



/**
 * Recursively Evalute the child dependencies found above to get the
 * result of each child module module. This function is recursive
 * since it calls "evaluate" which in turn calls this
 * function.
 *
 * @param {LoaderAPI} loaderAPI
 * @param {Map.<string, SimpleModule} children
 * @return {Promise.<(Array.<SimpleModule>)>}
 */
function evaluate_dependencies
  ( loaderAPI
  , children
  ) {
    return (
      Promise.all
        ( _.map
            ( Array.from( children.values() )
            , _.partial(evaluate, loaderAPI)
            )
        )
    )
  }



/**
 * @param {SimpleModule} module
 * @param {LoaderAPI} loaderAPI
 * @return {Promise.<SimpleModule>}
 */
function evaluate
  ( loaderAPI
  , module
  ) {
    const children = new Map()

    const sandbox
      = setup_sandbox
          ( loaderAPI
          , children
          , module
          )

    return (
      evaluate_in_sandbox
        ( loaderAPI
        , children
        , sandbox
        , module
        )
    )
  }


module.exports.evaluate = evaluate

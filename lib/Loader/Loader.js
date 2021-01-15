const _ = require('underscore')
const cloneDeep = require('clone-deep')
const handlebars = require('handlebars')
const loaderUtils = require('loader-utils')
const Config = require('./Config')
const Output = require('./Output')



const ERROR_RUNTIME_VERSION
  = 'Handlebars compiler version does not match runtime version'



/**
 * Represents the state of the loader at a given point.
 *
 * @typedef {Object} HandlebarsLoader
 *
 * @property {} effectiveConfig -
 * @property {} webpackLoaderContext -
 * @property {} foundPartials -
 * @property {} foundHelpers -
 * @property {} foundUnclearStuff -
 * @property {} handlebarsInstance -
 * @property {} compilationPassCount -
 * @property {} recompilationNeeded -
 * @property {} precompileTemplate -
 * @property {} compilationOptions -
 * @property {} precompilationOptions -
 * @property {} abstractSyntaxTree -
 * @property {} slug -
 * @property {} helperResolver -
 */



/**
 * Produce an updated HandlebarsLoader with the properties from the
 * given Partial<HandlbarsLoader>. This alter the original
 * HandlebarsLoader.
 *
 * @param {Partial<HandlebarsLoader>} handlebarsLoaderPartial
 * @param {HandlebarsLoader} handlebarsLoader
 *
 * @return {HandlebarsLoader}
 */
function patch_context
  ( { effectiveConfig
    , webpackLoaderContext
    , foundPartials
    , foundHelpers
    , foundUnclearStuff
    , handlebarsInstance
    , compilationPassCount
    , recompilationNeeded
    , precompileTemplate
    , compilationOptions
    , precompilationOptions
    , abstractSyntaxTree
    , slug
    , helperResolver
    }
  , context
  ) {
    context.effectiveConfig
      = effectiveConfig
      ? effectiveConfig
      : context.effectiveConfig

    context.webpackLoaderContext
      = webpackLoaderContext
      ? webpackLoaderContext
      : context.webpackLoaderContext

    context.foundPartials
      = foundPartials
      ? foundPartials
      : context.foundPartials

    context.foundHelpers
      = foundHelpers
      ? foundHelpers
      : context.foundHelpers

    context.foundUnclearStuff
      = foundUnclearStuff
      ? foundUnclearStuff
      : context.foundUnclearStuff

    context.handlebarsInstance
      = handlebarsInstance
      ? handlebarsInstance
      : context.handlebarsInstance

    context.compilationPassCount
      = compilationPassCount
      ? compilationPassCount
      : context.compilationPassCount

    context.recompilationNeeded
      = recompilationNeeded
      ? recompilationNeeded
      : context.recompilationNeeded

    context.precompileTemplate
      = precompileTemplate
      ? precompileTemplate
      : context.precompileTemplate

    context.compilationOptions
      = compilationOptions
      ? compilationOptions
      : context.compilationOptions

    context.precompilationOptions
      = precompilationOptions
      ? precompilationOptions
      : context.precompilationOptions

    context.abstractSyntaxTree
      = abstractSyntaxTree
      ? abstractSyntaxTree
      : context.abstractSyntaxTree

    context.slug
      = slug
      ? slug
      : context.slug

    context.helperResolver
      = helperResolver
      ? helperResolver
      : context.helperResolver


    return context
  }


module.exports.patch_context = patch_context



/**
 * Produce a new HandlebarsLoader with the properties from the given
 * Partial<HandlbarsLoader>.
 *
 * @param {Partial<HandlebarsLoader>} handlebarsLoaderPartial
 * @return {HandlebarsLoader}
 */
function create
  ( handlebarsLoaderPartial
  ) {
    return patch_context(handlebarsLoaderPartial, {})
  }


module.exports.create = create



/**
 * Produce an updated HandlebarsLoader with the properties from the
 * given Partial<HandlbarsLoader>. This does not alter the original
 * HandlebarsLoader.
 *
 * @param {Partial<HandlebarsLoader>} handlebarsLoaderPartial
 * @param {HandlebarsLoader} handlebarsLoader
 *
 * @return {HandlebarsLoader}
 */
function patch
  ( handlebarsLoaderPartial
  , handlebarsLoader
  ) {
    return (
      patch_context(handlebarsLoaderPartial, { ... handlebarsLoader})
    )
  }


module.exports.patch = patch



/**
 * Produce a new array where the first element is the first element of
 * the input array, and the second element is an array containing the
 * remainder of the input array.
 *
 * @param {Array<*>}
 * @return {Array<[*, [*]]>}
 */
function first_and_rest
  ( array
  ) {
    return [ _.first(array), _.rest(array) ]
  }


module.exports.first_and_rest = first_and_rest



/**
 * @typedef {Function} ErrorFirstCallback
 * @param {Error} err -
 * @param {*} result -
 *
 * @return {*}
 */



/**
 * call the webpack loader resolver to try to resolve the given path
 * relative to the given context. Calls the "resultCallback" with the
 * result of the resolution.
 *
 * @param {WebpackLoaderContext} webpackLoaderContext - this is the
 * loader context that comes from webpack. see:
 * "https://webpack.js.org/api/loaders/"
 *
 * @param {string} context - the path will be resolved relative to 
 * this path.
 *
 * @param {ErrorFirstCallback} resultCallback - the callback to recieve
 * the results of the resolutions. This callback does not need to
 * return anything.
 *
 * @param {string} path - the path to the resource being resolved.
 * 
 * @return {void}
 */
function resolve_relative_to_context
  ( webpackLoaderContext
  , context
  , resultCallback
  , path
  ) {
    webpackLoaderContext.resolve
      ( context
      , resourcePath
      , resultCallback
      )
  }


module.exports.resolve_relative_to_context = resolve_relative_to_context



/**
 * Reslove a single partial.
 *
 * @param {WebpackLoaderContext} webpackLoaderContext - this is the
 * loader context that comes from webpack. see:
 * "https://webpack.js.org/api/loaders/"
 *
 * @param {string} partialPath - path to the partial being resolved.
 *
 * @param {Array<string>} resolveContext - an array of directories in
 * which the partial will be searched for.
 *
 * @return {Promise<(string|null)>}
 */
function resolve_single_partial
  ( webpackLoaderContext
  , partialPath
  , resolveContexts
  ) {
    return new Promise(
      ( resolve
      ) => {
        let context
        let _resolveContexts

        const resultCallback
          = (err, result) => {
              if( !err ) {
                resolve(result)
              } else {
                [context, _resolveContexts]
                  = first_and_rest(_resolveContexts)

                if( context ) {
                  resolve_relative_to_context
                    ( context
                    , partialPath
                    , resultCallback
                    )
                } else {
                  resolve(null)
                }
              }
            }

        resultCallback(true)
      }
    )
  }


module.exports.resolve_single_partial = resolve_single_partial



/**
 * @param {WebpackLoaderContext} webpackLoaderContext - this is the
 * loader context that comes from webpack. see:
 * "https://webpack.js.org/api/loaders/"
 *
 * @param {Array<string>} partialPaths
 *
 * @param {Array<string>} resolveContexts
 *
 * @return {Promise<[null|string]>
 */
function resolve_partials
  ( webpackLoaderContext
  , partialPaths
  , resolveContexts
  ) {
    const promisesToResolve
      = partialPaths.map
          ( partialPath => (
              resolve_single_partial
                ( partialPath
                , resolveContexts
                )
            )
          )

    return Promise.allSettled( promisesToResolve )
  }


module.exports.resolve_partials = resolve_partials



/**
 * Returns an AST or an Error. Calls the handlebars parser on the given
 * input.
 *
 * see:
     - hbs.pars definition (github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/lib/handlebars/compiler/base.js#L29)
     - hbs.parse signature (github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/types/index.d.ts#L74)
 *
 *
 * @param {hbs} handlebarsInstance - see:
     - handlebars runtime definition (github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars.js)
 *
 * @param {ParseOptions} parseOptions - see:
     - ParsOptions signature (https://github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/types/index.d.ts#L53)
 *
 * @param {string} input
 *
 * @return {(hbs.AST.Program|Error)} - see:
     - github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/types/index.d.ts#L285
 */
function parse_template
  ( handlebarsInstance
  , parseOptions
  , input
  ) {
    try {
      const abstractSyntaxTree
        = handlebarsInstance.parse
            ( input
            , parseOptions
            )

      return abstractSyntaxTree
    } catch (err) {
      return err
    }
  }


module.exports.parse_template = parse_template



/**
 * Produce a precompiled version of the given AST or Error. Calls the
 * handlebars precompiler on the given AST.
 *
 * see:
     - precompile definition (https://github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/lib/handlebars/compiler/compiler.js#L444)
 *
 *
 * @param {hbs} handlebarsInstance - see:
     - handlebars runtime definition (github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars.js)
 *
 * @param {PrecompileOptions} precompileOptions - see:
     - PrecompileOptions signature (https://github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/types/index.d.ts#L241)
 *
 * @param {(hbs.AST.Program)} abstractSyntaxTree - see:
     - github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/types/index.d.ts#L285
 *
 * @return {(TemplateSpecification|Error)} - see:
     - TemplateSpecification signature (https://github.com/handlebars-lang/handlebars.js/blob/071003b89c0c709f24a17d89d58ce226ecf6a29b/types/index.d.ts#L205)
 */
function precompile_AST
  ( handlebarsInstance
  , precompileOptions
  , abstractSyntaxTree
  ) {
    try {
      const templateSpecification
        = handlebarsInstance.precompile
            ( abstractSyntaxTree
            , precompileOptions
            )

      return templateSpecification
    } catch (err) {
      return err
    }
  }


module.exports.precompile_AST = precompile_AST
    


/**
 * Make a single compilation pass and return the results.
 *
 * @param {string} input
 * @param {HandlebarsLoader}
 *
 * @return {(string|Error)}
 */
function compile_once
  ( input
  , handlebarsLoader
  ) {
    const { effectiveConfig
          , webpackLoaderContext
          , handlebarsInstance
          , compilationPassCount
          , recompilationNeeded
          , compilationOptions
          , foundPartials
          } = handlebarsLoader


    const { compileOptions
          , runtimePath
          } = effectiveConfig


    const parseResults
      = parse_template
          ( handlebarsInstance
          , compileOptions
          , input
          )


    if( _.isError(parseResults) ) {
      webpackLoaderContext.emitError( parseResults )

      return (
        Output.default_format
          ( handlebarsLoader
          , null
          )
      )
    }


    const precompilationResults
      = precompile_AST
          ( handlebarsInstance
          , compileOptions
          , parseResults
          )


    if( _.isError(precompilationResults) ){
      webpackLoaderContext.emitError( precompilationResults )

      return (
        Output.default_format
          ( handlebarsLoader
          , null
          )
      )
    }


    return (
      Output.default_format
        ( handlebarsLoader
        , precompilationResults
        )
    )
  }


module.exports.compile_once = compile_once



function make_regexp
  ( stringOrRE
  ) {
    if( _.isRegExp(stringOrRE) ) { return stringOrRe }

    if( typeof stringOrRE === 'string') {
      return new RegExp(stringOrRE)
    }

    return null
  }


module.exports.make_regexp = make_regexp


/**
 * @param {Loader} webpackLoaderContext
 * @returns {Config}
 *
 * @throws {Error} see:
 *   - loaderUtils.getOptions documentation
 *     (https://www.npmjs.com/package/loader-utils#getoptions)
 */
function get_effective_config
  ( webpackLoaderContext
  ) {
    const { resourceQuery
          , context
          } = webpackLoaderContext


    const options
      = { ... cloneDeep( loaderUtils.getOptions(webpackLoaderContext) )
        , ... ( resourceQuery
              ? loaderUtils.parseQuery(resourceQuery)
              : {}
              )
        }

    const pathRoot
      =  options.pathRoot || options.rootRelative || context 

    const inlineRequires
      = _.isArray(options.inlineRequires)
      ? options.inlineRequires.map( make_regexp )
      : make_regexp(options.inlineRequires)

    const ignorePartials
      = _.isArray(options.ignorePartials)
      ? options.ignorePartials.map( make_regexp )
      : make_regexp(options.ignorePartials)

    const ignoreHelpers
      = _.isArray(options.ignoreHelpers)
      ? options.ignoreHelpers.map( make_regexp )
      : make_regexp(options.ignoreHelpers)

    const exclude
      = _.isArray(options.exclude)
      ? options.exclude.map( make_regexp )
      : make_regexp(options.exclude)


    return (
      Config.create
        ( { ...options
          , pathRoot
          , inlineRequires
          , ignorePartials
          , ignoreHelpers
          , exclude
          }
        )
    )
  }


module.exports.get_effective_config = get_effective_config



function check_version
  ( hbCompiler
  , hbRuntime
  ) {
    const runtime = hbRuntime["default"] || hbRuntime
    return hbCompiler.COMPILER_REVISION === runtime.COMPILER_REVISION
  }


module.exports.check_version = check_version



function run
  ( source
  , handlebarsLoader
  ) {
    const { webpackLoaderContext
          , effectiveConfig
          , foundPartials
          } = handlebarsLoader


    if (webpackLoaderContext.cacheable) {
      webpackLoaderContext.cacheable()
    }


    const { runtimePath, partialDirs } = effectiveConfig

    const runtime = require(runtimePath)
    if( !check_version(handlebars, runtime) ) {
      throw new Error( ERROR_RUNTIME_VERSION )
    }


    const partialsResolveContexts = [ ... partialDirs ]
    const { context } = webpackLoaderContext
    if( context ) { partialsResolveContexts.push( context ) }

    const partialPaths = Object.keys(foundPartials)

    // TODO: I need to resolve the partials as I compile the
    // current template.
    // return (
    //   resolve_partials
    //     ( webpackLoaderContext
    //     , partialPaths
    //     , partialsResolveContexts
    //     )
    //   .then( resolvedPartials => compile_once(source, handlebarsLoader) )
    // )

    return Promise.resolve( compile_once(source, handlebarsLoader) )
  }


module.exports.run = run



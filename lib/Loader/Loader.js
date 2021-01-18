const _ = require('underscore')
const cloneDeep = require('clone-deep')
const handlebars = require('handlebars')
const loaderUtils = require('loader-utils')
const htmlparser2 = require('htmlparser2')
const Config = require('./Config')
const Output = require('./Output')
const Utils = require('../Utils')
const Handlebars = require('../Handlebars')



const ERROR_RUNTIME_VERSION
  = 'Handlebars compiler version does not match runtime version'



/**
 * Represents the state of the loader at a given point.
 *
 * @typedef {Object} Loader
 *
 * @property {Config} effectiveConfig - the configuration file that
 * should be applied to the loaders operations.
 *
 * @property {(null|Object)} loaderAPI - The webpack loader api
 * instance.
 * see: webpack loader api (https://webpack.js.org/api/loaders/).
 *
 * @property {Object} foundPartials - An object to keep track of all
 * partials found during the compilation process.
 *
 * @property {Object} foundHelpers - An object to keeep track of all
 * helpers found during the compilation process.
 *
 * @property {Object} handlebarsRuntime - the handlebars runtime used
 * for the loaders compilation.
 *
 * @property {string} source - the source string passed into the loader
 * for compilation.
 *
 * @property {(null|Error|hbs.AST.Program)} abstractSyntaxTree - The AST
 * produced by the parsing phase of the compilation. This property
 * should be null initially. If the parsing phase results in an error,
 * the should be stored here for processing. If the parsing phase is
 * successful, then this property should hold the resulting AST.
 *
 * @property {(null|Error|hbs.TemplateSpecification)}
 * templateSpecification - The results of the precompilation phase. This
 * property should hold null initially. If the precompilation phase
 * fails, then it should hold the resulting Error. If the precompilation
 * phase is successful, then it should hold the resulting template
 * specification.
 *
 * @property {(Error|string)} compileResults - The fully compiled
 * template. It should hold an empty string initially. If the
 * compilation fails, then it should hold the resulting Error object.
 * If the compilation is successful, then it should hold the final
 * results of the compilation.
 *
 * @property {(null|Error|string|hbs.TemplateSpecification)} results -
 * the final results of the compilation. If the compilation is meant
 * to stop at the precompilation phase then this will hold the resul
 * of the precompilation operation. If the results compilation is meant
 * to stop at the compilation phase then this should hold the results
 * of the compilation operation.
 *
 * @property {Object} templateContext - An object that serves as the
 * context for the template.
 */



/**
 * Produce an updated Loader with the properties from the
 * given Partial<HandlbarsLoader>. This alter the original
 * Loader.
 *
 * @param {Partial<Loader>} handlebarsLoaderPartial
 * @param {Loader} handlebarsLoader
 *
 * @return {Loader}
 */
function patch_context
  ( { effectiveConfig
    , loaderAPI
    , foundPartials
    , foundHelpers
    , handlebarsRuntime
    , source
    , abstractSyntaxTree
    , templateSpecification
    , compileResults
    , results
    , templateContext
    }
  , context
  ) {
    Utils.set_context_property
      ( effectiveConfig
      , Config.create({})
      , 'effectiveConfig'
      , context
      )

    Utils.set_context_property
      ( loaderAPI
      , null
      , 'loaderAPI'
      , context
      )

    Utils.set_context_property
      ( foundPartials
      , {}
      , 'foundPartials'
      , context
      )

    Utils.set_context_property
      ( foundHelpers
      , {}
      , 'foundHelpers'
      , context
      )

    Utils.set_context_property
      ( handlebarsRuntime
      , Handlebars.setup_runtime(context)
      , 'handlebarsRuntime'
      , context
      )

    Utils.set_context_property
      ( source
      , ''
      , 'source'
      , context
      )

    Utils.set_context_property
      ( abstractSyntaxTree
      , null
      , 'abstractSyntaxTree'
      , context
      )

    Utils.set_context_property
      ( templateSpecification
      , null
      , 'templateSpecification'
      , context
      )

    Utils.set_context_property
      ( compileResults
      , null
      , 'compileResults'
      , context
      )

    Utils.set_context_property
      ( results
      , null
      , 'results'
      , context
      )

    Utils.set_context_property
      ( templateContext
      , null
      , 'templateContext'
      , context
      )


    return context
  }


module.exports.patch_context = patch_context



/**
 * Produce a new Loader with the properties from the given
 * Partial<HandlbarsLoader>.
 *
 * @param {Partial<Loader>} handlebarsLoaderPartial
 * @return {Loader}
 */
function create
  ( handlebarsLoaderPartial
  ) {
    return patch_context(handlebarsLoaderPartial, {})
  }


module.exports.create = create



/**
 * Produce an updated Loader with the properties from the
 * given Partial<HandlbarsLoader>. This does not alter the original
 * Loader.
 *
 * @param {Partial<Loader>} handlebarsLoaderPartial
 * @param {Loader} handlebarsLoader
 *
 * @return {Loader}
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
 * @typedef {Function} ErrorFirstCallback
 * @param {Error} err -
 * @param {*} result -
 *
 * @return {*}
 */



/**
 * Parse the value of the source property of the given handlebars
 * loader.
 *
 * @param {(Loader|Error)} loaderOrError -
 * @return {(Loader|Error)}
 */
function parse_source
  ( loaderOrError
  ) {
    if( _.isError(loaderOrError) ){ return loaderOrError }

    const { handlebarsRuntime
          , effectiveConfig
          } = loaderOrError

    // see handlebarsRuntime.parse definition (Handlebars-Lang, 2019
    // #L29)
    const abstractSyntaxTree
      = Utils.produce_result_or_error
            ( handlebarsRuntime.parse.bind(handlebarsRuntime)
            , loaderOrError.source
            , effectiveConfig.parseOptions
            )

    return patch({ abstractSyntaxTree }, loaderOrError )
  }


module.exports.parse_source = parse_source



/**
 * Precompile the value of the abstractSyntaxTree property of the
 * given handlbars loader.
 *
 * @param {(Loader|Error)} loaderOrError -
 * @return {(Loader|Error)}
 */
function precompile_AST
  ( loaderOrError
  ) {
    if( _.isError(loaderOrError) ){ return loaderOrError }

    const { handlebarsRuntime, effectiveConfig } = loaderOrError

    // see handlebarsRuntime.parse definition (Handlebars-Lang,
    // Handlebars Parser Definition 2019 #L29)
    const templateSpecification
      = Utils.produce_result_or_error
          ( handlebarsRuntime.precompile.bind(handlebarsRuntime)
          , loaderOrError.abstractSyntaxTree
          , effectiveConfig.precompileOptions
          )

    return patch({ templateSpecification }, loaderOrError )
  }


module.exports.precompile_AST = precompile_AST



/**
 * Look for references to images, 
 *
 * @param {(Loader|Error)} loaderOrError -
 *
 * @return {(Loader|Error)}
 * @TODO!!!
 */
function require_resources
  ( loaderOrError
  ) {
    if( _.isError(loaderOrError) ){ return loaderOrError }

    debugger
    const dom = htmlparser2.parseDocument(loaderOrError.source)

    return loaderOrError
  }


module.exports.require_resources = require_resources



/**
 * Set the final results of the entire compilation process (i.e. set
 * the value of "results" attribute of the given Loader.
 *
 * @param {Loader} loaderOrError -
 *
 * @return {(Loader|Error)}
 */
function set_final_results
  ( loaderOrError
  ) {
    if( _.isError(loaderOrError) ){ return loaderOrError }

    const results
      =  loaderOrError.compileResults
      || loaderOrError.templateSpecification
      || loaderOrError.abstractSyntaxTree
      || loaderOrError.source

    return patch({ results }, loaderOrError)
  }



/**
 * Make a single compilation pass and return the results.
 *
 * @param {(Loader|Error)} loaderOrError -
 *
 * @return {(Loader|Error)}
 */
function compile_source
  ( loaderOrError
  ) {
    return (
      _.compose
        ( set_final_results
        , precompile_AST
        , parse_source
        , require_resources
        )(loaderOrError)
    )
  }


module.exports.compile_source = compile_source



function run
  ( handlebarsLoader
  ) {
    const { runtimePath } = handlebarsLoader.effectiveConfig

    const runtime = require(runtimePath)

    if( !Handlebars.is_runtime_compatible(runtime) ) {
      return Promise.reject( new Error(ERROR_RUNTIME_VERSION) )
    }


    return Promise.resolve( compile_source(handlebarsLoader) )
  }


module.exports.run = run




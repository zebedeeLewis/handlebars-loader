const _ = require('underscore')
const vm = require('vm')
const SimpleModule = require('../../SimpleModule')



/**
 * A function to be used to preprocess input source before starting
 * compilation.
 *
 * @typedef {Function} Preprocessor
 * @param {Function}
 * @param {(Loader|Error)}
 * @return {Promise<(Loader|Error)>}
 */



/**
 * Represents the different source formats that we can hanlde (i.e.
 * from which loaders we can accept input from.
 *
 * @readonly
 * @enum {string}
 */
const Compatibility
  = Object.freeze(
      { Default    : 'default'
      , HtmlLoader : 'htmlLoader'
      }
    )


module.exports.Compatibility = Compatibility


/**
 * Produce a mapping from a match to a newly created SimpleModule
 * for each entry in the given "match to path" mapping.
 *
 * @param {LoaderAPI} loaderAPI
 * @param {Map.<string, string>} match
 *
 * @return {Map.<string, SimpleModuel>}
 */
function load_inline_requires
  ( loaderAPI
  , matchToPathMap
  ) {
    const _require_module
      = ( matchToModuleMap
        , [match, path]
        ) => {
          const module
            = SimpleModule.require_module
                ( loaderAPI
                , new Map()          // TODO: removing need for this Map
                , loaderAPI.context
                , path
                )

          return matchToModuleMap.set(match, module)
        }


    return (
      _.reduce
        ( Array.from(matchToPathMap)
        , _require_module
        , new Map()
        )
    )
  }


module.exports.load_inline_requires
  = load_inline_requires



/**
 * Produce a map from each string matched by an inline require to
 * it's matched "path" capture group.
 *
 * @param {Array.<RegExp>} inlineRequires
 * @param {string} source
 *
 * @return {Map.<string, string>}
 */
function extract_matched_paths
  ( inlineRequires
  , source
  ) {
    const matchLog = new Map()

    const log_matches
      = ( match
        , ... groups
        ) => {
          const namedGroups = _.last(groups)

          if( namedGroups && namedGroups.path ){
            matchLog.set(match, namedGroups.path)
          }

          return match
        }


    _.forEach
      ( inlineRequires
      , pattern => source.replace(pattern, log_matches)
      )


    return matchLog
  }



/**
 * Produce a duplicate of the given source string, where each match
 * of the given pattern is replace with a duplicate containing a
 * placeholder for its corresponding module (found in the
 * matchToModuleMap) in place of its "path substring" (i.e. the part
 * of the matched substring captured by the "path" capture group of
 * the given pattern).
 *
 * @param {LoaderAPI} loaderAPI
 * @param {Map.<string, SimpleModuel>} matchToModuleMap
 * @param {string} source
 * @param {RegExp} pattern
 *
 * @return {string}
 */
function replace_pattern_with_placeholder
  ( loaderAPI
  , matchToModuleMap
  , source
  , pattern
  ) {
    const _replace_pattern_with_placeholder
      = ( match
        , ... groups
        ) => {
          const namedGroups = _.last(groups)

          if( !namedGroups || !namedGroups.path ){
            return match
          }

          return (
            match.replace
              ( namedGroups.path
              , matchToModuleMap.get(match).placeholder
              )
          )
        }
        

    return source.replace(pattern, _replace_pattern_with_placeholder)
  }


module.exports.replace_pattern_with_placeholder
  = replace_pattern_with_placeholder



/**
 * @param {LoaderAPI} loaderAPI
 * @param {string} source
 * @param {(RegExp|Array.<RegExp>)} inlineRequires
 *
 * @return {Promise.<SimpleModule>}
 */
function expand_inline_requires
  ( loaderAPI
  , source
  , inlineRequires
  ) {
    if( !inlineRequires ) { return Promise.resolve(source) }


    const matchLog = new Map()

    const inlineRequiresCollection
      = _.isArray(inlineRequires)
      ? inlineRequires
      : [inlineRequires]


    const matchToModuleMap
      = load_inline_requires
          ( loaderAPI
          , extract_matched_paths(inlineRequiresCollection, source)
          )

    const sourceWithPlaceholders
      = _.reduce
          ( inlineRequiresCollection
          , _.partial
              ( replace_pattern_with_placeholder
              , loaderAPI
              , matchToModuleMap
              )
          , source
          )

    const module
      = SimpleModule.create({exports : sourceWithPlaceholders})

    const dependencies
      = _.reduce
          ( Array.from(matchToModuleMap.values())
          , (_dependencies, _module) => (
              SimpleModule.cache(_module, _dependencies)
            )
          , new Map()
          )


    return (
      SimpleModule
      .evaluate_dependencies(loaderAPI, dependencies)
      .then
        (_.partial
          ( SimpleModule.swap_placeholders_for_exports
          , module
          )
        )
    )
  }


module.exports.expand_inline_requires = expand_inline_requires



/**
 * Default preprocessor.
 *
 * @type {Preprocessor}
 */
function as_default
  ( patch
  , loaderOrError
  ) {
    if( _.isError(loaderOrError) ){
      return Promise.reject(loaderOrError)
    }

    const { source, loaderAPI, effectiveConfig } = loaderOrError

    return (
      expand_inline_requires
        ( loaderAPI
        , source
        , effectiveConfig.inlineRequires
        )
      .then
        (_module => patch({ source : _module.exports }, loaderOrError)
        )
    )
  }


module.exports.as_default = as_default



/**
 * Preprocess the source from "html-loader" output.
 *
 * @type {Preprocessor}
 *
 */
function html_loader_compatible
  ( patch
  , loaderOrError
  ) {
    if( _.isError(loaderOrError) ){
      return Promise.reject(loaderOrError)
    }

    const { source, loaderAPI } = loaderOrError

    const module
      = SimpleModule.create
          ( { promisedExports : Promise.resolve(source)
            , absoluteRequest : loaderAPI.resourcePath
            }
          )

    return (
      SimpleModule
        .evaluate(loaderAPI, module)
        .then
          (_module => patch({ source : _module.exports }, loaderOrError)
          )
    )
  }


module.exports.html_loader_compatible = html_loader_compatible

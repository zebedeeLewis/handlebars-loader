const _ = require('underscore')
const loaderUtils = require('loader-utils')



/**
 * Represents the different supported output formats.
 *
 * @readonly
 * @enum {string}
 */
const Format
  = Object.freeze(
      { Default    : 'Default'
      , HtmlLoader : 'HtmlLoader'
      }
    )


module.exports.Format = Format



/**
 * A function to be used to format the compiler output before the
 * loader returns.
 *
 * @typedef {Function} Formatter
 * @param {Loader}
 * @return {Loader}
 */



/**
 * Produce the module string for the webpack bundle.
 *
 * @param {Function} patch - We need th pass the "patch" function since
 * importing the "Loader" module here would cause a circular dependency
 * error.
 *
 * @param {(Loader|Error)} loaderOrError - the loader
 *
 * @return {(Loader|Error)}
 */
function default_format
  ( patch
  , loaderOrError
  ) {
    if( _.isError(loaderOrError) ){ return loaderOrError }

    const { loaderAPI
          , effectiveConfig
          , results
          } = loaderOrError

    const moduleStr = 'module.exports = function(){return ""}'

    const runtimePath
      = loaderUtils.stringifyRequest
          ( loaderAPI
          , effectiveConfig.runtimePath
          )

    const templateModuleStr
      = `const Handlebars = require(${runtimePath});`
      + 'function __default'
      + '  (obj'
      + '  ) {'
      + '    return obj && (obj.__esModule ? obj["default"] : obj);'
      + '  };'
      + 'const handlebarsRuntime = (Handlebars["default"] || Handlebars);'
      + 'module.exports'
      + `  = handlebarsRuntime.template(${results});`


    return (
      patch
        ( { results : results ? templateModuleStr : moduleStr }
        , loaderOrError
        )
    )
  }


module.exports.default_format = default_format


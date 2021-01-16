const loaderUtils = require('loader-utils')



/**
 * Produce the module string for the webpack bundle.
 *
 * @param {Loader} handlebarsLoader - the loader
 *
 * @return {string}
 */
function default_format
  ( handlebarsLoader
  ) {
    const { loaderAPI
          , effectiveConfig
          , results
          } = handlebarsLoader

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

    return results ? templateModuleStr : moduleStr
  }


module.exports.default_format = default_format


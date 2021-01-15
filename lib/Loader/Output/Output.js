const loaderUtils = require('loader-utils')



/**
 * Produce the module string for the webpack bundle.
 *
 * @param {Loader} webpackLoaderContext
 * @param {TemplateSpecification} templateSpecification
 *
 * @return {string}
 */
function as_default
  ( handlebarsLoader
  , templateSpecification
  ) {
    const { webpackLoaderContext
          , effectiveConfig
          } = handlebarsLoader

    const moduleStr = 'module.exports = function(){return ""}'

    const path
      = loaderUtils.stringifyRequest
          ( webpackLoaderContext
          , effectiveConfig.runtimePath
          )

    const templateModuleStr
      = `const Handlebars = require(${path});`
      + 'function __default'
      + '  (obj'
      + '  ) {'
      + '    return obj && (obj.__esModule ? obj["default"] : obj);'
      + '  };'
      + 'const handlebarsRuntime = (Handlebars["default"] || Handlebars);'
      + 'module.exports'
      + `  = handlebarsRuntime.template(${templateSpecification});`

    return templateSpecification ? templateModuleStr : moduleStr
  }


module.exports.as_default = as_default


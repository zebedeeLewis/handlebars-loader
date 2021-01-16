const loaderUtils = require('loader-utils')



/**
 * Produce the module string for the webpack bundle.
 *
 * @param {TemplateSpecification} templateSpecification - see reference
 * #5 (Handlebars-Lang, TemplateSpecification Type signature #L205) for
 * TemplateSpecification type signature.
 *
 * @return {string}
 */
function default_format
  ( handlebarsLoader
  ) {
    const { loaderAPI
          , effectiveConfig
          , templateSpecification
          } = handlebarsLoader

    const moduleStr = 'module.exports = function(){return ""}'

    const path
      = loaderUtils.stringifyRequest
          ( loaderAPI
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


module.exports.default_format = default_format


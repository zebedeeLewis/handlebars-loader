const _ = require('underscore')
const vm = require('vm')
const SimpleModule = require('./SimpleModule')



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

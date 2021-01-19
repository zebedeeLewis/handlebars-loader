/**
 * A function to be used to preprocess input source before starting
 * compilation.
 *
 * @typedef {Function} Preprocessor
 * @param {Loader}
 * @return {Loader}
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
      { Default    : 'Default'
      , HtmlLoader : 'HtmlLoader'
      }
    )


module.exports.Compatibility = Compatibility



/**
 * Preprocess the source from "html-loader" output.
 *
 * @type {Preprocessor}
 * @TODO!!!
 */
function html_loader_compatible
  ( handlebarsLoader
  ) {
    return handlebarsLoader
  }


module.exports.html_loader_compatible = html_loader_compatible

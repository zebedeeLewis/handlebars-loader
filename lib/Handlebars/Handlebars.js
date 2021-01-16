const handlebars = require('handlebars')
const JavaScriptCompiler = require('./JavaScriptCompiler')



/**
 * Setup the Handlebars runtime to be used in the loader.
 * 1. Creates a new handlebars runtime.
 * 2. replace the default JavaScriptCompiler with our custom
 *    JavaScriptCompiler.
 *
 * @return {handlebars.runtime}
 */
function setup_runtime
  ( handlebarsLoader
  ) {
    const handlebarsInstance = handlebars.create()
    handlebarsInstance.JavaScriptCompiler
      = function
          () {
            return new JavaScriptCompiler(handlebarsLoader)
          }


    return handlebarsInstance
  }


module.exports.setup_runtime = setup_runtime



/**
 * Produce true if the given handlebars runtime is the same version
 * as the runtime used internally by the loader.
 *
 * @param {handlebars.runtime} handlebarsRuntime - the user supplied
 * handlebars runtime. See reference (Handlebars-Lang, Handlebars
 * Runtime Definition 2019) for the handlebars runtime definition.
 * See handlebars runtime definition (Handlebars-Lang,
 * Handlebars Runtime Definition 2019)
 *
 * @return {boolean}
 */
function is_runtime_compatible
  ( userRuntime
  ) {
    const _userRuntime = userRuntime["default"] || userRuntime
    return (
      handlebars.COMPILER_REVISION === _userRuntime.COMPILER_REVISION
    )
  }


module.exports.is_runtime_compatible = is_runtime_compatible




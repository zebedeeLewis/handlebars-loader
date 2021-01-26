const handlebars = require('handlebars')
const JavaScriptCompiler = require('./JavaScriptCompiler')



/**
 * Setup the Handlebars compiler to be used in the loader.
 * 1. Creates a new handlebars compiler.
 * 2. replace the default JavaScriptCompiler with our custom
 *    JavaScriptCompiler.
 *
 * @return {handlebars.runtime}
 */
function setup_compiler
  ( handlebarsLoader
  ) {
    const compiler = handlebars.create()
    compiler.JavaScriptCompiler
      = function
          () {
            return new JavaScriptCompiler(handlebarsLoader)
          }


    return compiler
  }


module.exports.setup_compiler = setup_compiler



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




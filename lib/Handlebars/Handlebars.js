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


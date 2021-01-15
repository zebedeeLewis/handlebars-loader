const _ = require('underscore')
const handlebars = require("handlebars")
const Loader = require('./lib/Loader')
const Handlebars = require('./lib/Handlebars')



function handlebars_loader
  ( source
  ) {
    const effectiveConfig = Loader.get_effective_config(this)


    const handlebarsLoader
      = Loader.create
          ( { effectiveConfig        : effectiveConfig
            , webpackLoaderContext   : this
            , foundPartials          : {}
            , foundHelpers           : {}
            , foundUnclearStuff      : {}
            , handlebarsInstance     : null
            , compilationPassCount   : 0
            , recompilationNeeded    : true
            , precompileTemplate     : ''
            , compilationOptions     : {}
            , precompilationOptions  : {}
            , abstractSyntaxTree     : null
            , helperResolver         : null
            }
          )

    handlebarsLoader.handlebarsInstance
      = Handlebars.setup_runtime(handlebarsLoader)


    const resultsCallback = this.async()
    Loader
      .run(source, handlebarsLoader)
      .then( compileResults => resultsCallback(null, compileResults) )
      .catch( compileError => resultsCallback(compileError) )
  }


module.exports = handlebars_loader

const _ = require('underscore')
const handlebars = require("handlebars")
const cloneDeep = require('clone-deep')
const loaderUtils = require('loader-utils')
const Handlebars = require('./lib/Handlebars')
const Loader = require('./lib/Loader')
const Utils = require('./lib/Utils')



/**
 * Produce the Loader.Config that will be used for the compilation.
 *
 * @param {Loader} loaderAPI
 * @returns {Loader.Config}
 *
 * @throws {Error} see loaderUtils.getOptions docs (loader-utils
 * "getOptions" Docs #getOptions)
 */
function get_effective_config
  ( loaderAPI
  ) {
    const { resourceQuery
          , context
          } = loaderAPI


    // see loaderUtils.getOptions docs (loader-utils "getOptions" Docs
    // #getOptions) and loaderUtils.parseQuery docs
    // (LoaderUtils.parseQuery Documentation #parsequery)
    const options
      = { ... cloneDeep( loaderUtils.getOptions(loaderAPI) )
        , ... ( resourceQuery
              ? loaderUtils.parseQuery(resourceQuery)
              : {}
              )
        }

    const pathRoot
      =  options.pathRoot || options.rootRelative || context 


    return Loader.Config.create({ ...options, pathRoot })
  }


module.exports.get_effective_config = get_effective_config



function handlebars_loader
  ( source
  ) {
    if (this.cacheable) { this.cacheable() }

    const done = this.async()

    const handlebarsLoader
      = Loader.create
          ( { effectiveConfig : get_effective_config(this)
            , loaderAPI       : this
            , source          : source
            }
          )


    Loader.init
      ( handlebarsLoader
      )
    .then
      ( Loader.run
      )
    .then
      ( loaderOrError => {
          if( _.isError(loaderOrError) ) {
            done( loaderOrError )
          } else {
            done( null, loaderOrError.results )
          }
        }
      )
    .catch( error => this.callback( error ) )
  }


module.exports = handlebars_loader

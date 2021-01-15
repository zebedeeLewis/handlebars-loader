const _ = require('underscore')
const Utils = require('../../Utils')
const Log = require('../Log')
const Handlebars = require('../../Handlebars')



const DEFAULS_EXTENSIONS = ['.handlebars.html', '.hbs', '.hb']
const DEFAULT_PATH_ROOT = './'
const DEFAULT_RUNTIME_PATH = require.resolve('handlebars/runtime')



/**
 * Represents a file extensions. Must take the format
 * ".<extension name>".
 *
 * @example
 * ".js"
 * ".template.html"
 *
 * @typedef {string} Extension
 */



/**
 * Encapsulates the handlebars loader configuration information.
 *
 * @typedef {Object} Config
 *
 * @property {Array<Ext>} extensions - The file extensions to try when
 * resolving resource names. This array is always merged with a
 * default set of extensions. Order matters, the extensions will be
 * tried from lowest index to highest, with the defaults being tried
 * last.
 *
 * @property {string} pathRoot - Used as the root path for resolving
 * "root relative" resource names. Root relative resource names are
 * names that are not absolute paths and do not start with a "dot
 * directory". Defaults to the webpack loader instance "context" value
 * or "./". If both this option and "rootRelative" are set, this value
 * should take presidence.
 *
 * @property {string} rootRelative - alias for "pathRoot".
 *
 * @property {Array<string>} knownHelpers - Array of helpers that are
 * registered at runtime and should not explicitly be required by
 * webpack.
 *
 * @property {(string|RegExp|null|Array<(string|RegExp|null)>)}
 * inlineRequires - Zero or more regular expressions each matching a
 * string to be replaced with a require statement. Each RegExp must
 * contain a named group named "path" that captures the string that
 * should be used as the require statements path.
 *
 * @property {(string|RegExp|null|Array<(string|RegExp|null)>)}
 * exclude - Defines a regex that will exclude paths from resolving.
 * This can be used to prevent helpers from being resolved to modules
 * in the
 * node_modules directory.
 *
 * @property {Log.Level} logLevel - Toggles logging information. To stay
 * compatible with the original handlebars-loader, setting this value
 * to "true" set the log level to LogLevel.Debug. Setting this value to
 * "false" does nothing. The log level remains as is.
 *
 * @property {Log.Level} debug - alias for "logLevel"
 *
 * @property {string} runtimePath - Path to the runtime library.
 * Defaults to look under the local handlebars npm module,
 * i.e. handlebars/runtime.
 *
 * @property {string} runtime - alias for "runtimePath"
 *
 * @property {Array<string>} helperDirs - Defines additional directories
 * to be searched for helpers. Allows helpers to be defined in a
 * directory and used globally without relative paths. You must surround
 * helpers in subdirectories with brackets (Handlerbar helper
 * identifiers can't have forward slashes without this).
 *
 * @property {Array<string>} partialDirs - Defines additional
 * directories to be searched for partials. Allows partials to be
 * defined in a directory and used globally without relative paths.
 *
 * @property {(string|RegExp|null|Array<(string|RegExp|null)>)}
 * ignoreHelpers - Prevents matching helpers from being loaded at build
 * time. Useful for manually loading partials at runtime.
 *
 * @property {(string|RegExp|null|Array<(string|RegExp|null)>)}
 * ignorePartials - Prevents matching partials from being loaded at
 * build time. Useful for manually loading partials at runtime.
 *
 * @property {Handlebars.ParseOptions} parseOptions - The options
 * passed to the Handlebars parser.
 *
 * @property {Handlebars.PrecompileOptions} precompileOptions - The
 * options passed to the Handlebars precompiler.
 *
 * @property {Handlebars.CompileOptions} compileOptions - The options
 * passed to the Handlebars compiler.
 *
 * @property {boolean} failLoudly - If "true", the loader will throw a
 * fatal error whenever a problem is encountered, stopping the
 * compilation. If "false", the loader simply logs the error, depending
 * on the state of the "logLevel" config option. If "logLevel" is set to
 * Log.Level.Off, then the compilation will simply silently continue.
 * Note that if this will always override "logLevel" when set to "true".
 */



/**
 * Produce an updated Config object with the properties from the
 * given Partial<Config>. This alter the original Config Object.
 *
 * @param {Partial<Config>}
 * @param {Config} config - context
 *
 * @return {Config}
 *
 * @TODO:
 *   - internally represent arrays as sets, at least the ones that should
 *     hold unique values.
 */
function patch_context
  ( { extensions
    , pathRoot
    , rootRelative
    , knownHelpers
    , inlineRequires
    , exclude
    , logLevel
    , debug
    , runtimePath
    , runtime
    , helperDirs
    , partialDirs
    , ignoreHelpers
    , ignorePartials
    , parseOptions
    , precompileOptions
    , compileOptions
    , failLoudly
    }
  , context
  ) {
    Utils.set_context_property
      ( [ ... (extensions || []), ... DEFAULS_EXTENSIONS ]
      , DEFAULS_EXTENSIONS
      , 'extensions'
      , context
      )

    Utils.set_context_property
      ( pathRoot
      , DEFAULT_PATH_ROOT
      , 'pathRoot'
      , context
      )

    Object.defineProperty
      ( context
      , 'rootRelative'
      , { get          : function() { return this.pathRoot }
        , set          : function(val) {
                           this.pathRoot = val
                         }
        , configurable : true
        , enumerable   : true
        }
      )

    Utils.set_context_property
      ( knownHelpers
      , []
      , 'knownHelpers'
      , context
      )

    Utils.set_context_property
      ( inlineRequires
      , []
      , 'inlineRequires'
      , context
      )

    Utils.set_context_property
      ( exclude
      , []
      , 'exclude'
      , context
      )

    Object.defineProperty
      ( context
      , '_logLevel'
      , { configurable : true
        , enumerable   : false
        , writable     : true
        }
      )

    Object.defineProperty
      ( context
      , 'logLevel'
      , { get          : function() { return this._logLevel }
        , set          : function(val) {
                           this._logLevel = val
                         }
        , configurable : true
        , enumerable   : true
        }
      )

    Utils.set_context_property
      ( logLevel
      , Log.Level.Error
      , 'logLevel'
      , context
      )

    Object.defineProperty
      ( context
      , 'debug'
      , { get          : function() { return this._logLevel }
        , set          : function(val) {
                           if( val === true ){
                             this._logLevel = Log.Level.Debug
                           }
                         }
        , configurable : true
        , enumerable   : true
        }
      )

    Utils.set_context_property
      ( debug
      , false
      , 'debug'
      , context
      )

    Utils.set_context_property
      ( runtimePath
      , DEFAULT_RUNTIME_PATH
      , 'runtimePath'
      , context
      )

    Object.defineProperty
      ( context
      , 'runtime'
      , { get          : function() { return this.runtimePath }
        , set          : function(val) { this.runtimePath = val }
        , configurable : true
        , enumerable   : true
        }
      )

    Utils.set_context_property
      ( runtime
      , DEFAULT_RUNTIME_PATH
      , 'runtime'
      , context
      )

    Utils.set_context_property
      ( helperDirs
      , []
      , 'helperDirs'
      , context
      )

    Utils.set_context_property
      ( partialDirs
      , []
      , 'partialDirs'
      , context
      )

    Utils.set_context_property
      ( ignoreHelpers
      , []
      , 'ignoreHelpers'
      , context
      )

    Utils.set_context_property
      ( ignorePartials
      , []
      , 'ignorePartials'
      , context
      )

    Utils.set_context_property
      ( parseOptions
      , Handlebars.ParseOptions.create({})
      , 'parseOptions'
      , context
      )

    Utils.set_context_property
      ( precompileOptions
      , Handlebars.PrecompileOptions.create({})
      , 'precompileOptions'
      , context
      )

    Utils.set_context_property
      ( compileOptions
      , Handlebars.CompileOptions.create({})
      , 'compileOptions'
      , context
      )

    Utils.set_context_property
      ( failLoudly
      , true
      , 'failLoudly'
      , context
      )


    return context
  }


module.exports.patch_context = patch_context



/**
 * Produce a new Config object with the properties from the given
 * Partial<Config>.
 *
 * @param {Partial<Config>} configPartial
 * @return {Config}
 */
function create
  ( configPartial
  ) {
    return patch_context(configPartial, {})
  }


module.exports.create = create



/**
 * Produce an updated Config object with the properties from the
 * given Partial<Config>. This does not alter the original Config.
 *
 * @param {Partial<Config>} configPartial
 * @param {Config} initialConfig
 *
 * @return {config}
 */
function patch
  ( configPartial
  , initialConfig
  ) {
    return (
      patch_context(configPartial, { ... initialConfig})
    )
  }


module.exports.patch = patch




const PrecompileOptions = require('./PrecompileOptions')
const ParseOptions = require('./ParseOptions')
const JavaScriptCompiler = require('./JavaScriptCompiler/')
const { setup_compiler
      , is_runtime_compatible
      } = require('./Handlebars')


module.exports
  = { JavaScriptCompiler
    , PrecompileOptions
    , ParseOptions
    , setup_compiler
    , is_runtime_compatible
    }

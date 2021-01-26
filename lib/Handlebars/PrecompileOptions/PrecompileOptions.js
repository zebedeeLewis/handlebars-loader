const Utils = require('../../Utils')
/**
 * Represents a PrecompileOptions object as specified in the handlebars
 * type definition. See handlebars documentation for option details.
 *
 * @typedef {Object} PrecompileOptions
 * @property {(boolean)} data
 * @property {(boolean)} compat
 * @property {(KnownHelpers|undefined)} knownHelpers
 * @property {boolean} knownHelpersOnly
 * @property {boolean} noEscape
 * @property {boolean} strict
 * @property {boolean} assumeObjects
 * @property {boolean} preventIndent
 * @property {boolean} ignoreStandalone
 * @property {boolean} explicitPartialContext
 */



/**
 * Produce an updated PrecompileOptions object with the properties from
 * the given Partial<PrecompileOptions>. This alter the original
 * PrecompileOptions Object.
 *
 * @param {Partial<PrecompileOptions>}
 * @param {PrecompileOptions} precompileOptions - context
 *
 * @return {PrecompileOptions}
 */
function patch_context
  ( { data
    , compat
    , knownHelpers
    , knownHelpersOnly
    , noEscape
    , strict
    , assumeObjects
    , preventIndent
    , ignoreStandalone
    , explicitPartialContext
    }
  , context
  ) {
    Utils.set_context_property
      ( data
      , undefined
      , 'data'
      , context
      )

    
    Utils.set_context_property
      ( compat
      , undefined
      , 'compat'
      , context
      )


    Utils.set_context_property
      ( knownHelpers
      , undefined
      , 'knownHelpers'
      , context
      )


    Utils.set_context_property
      ( knownHelpersOnly
      , undefined
      , 'knownHelpersOnly'
      , context
      )


    Utils.set_context_property
      ( noEscape
      , undefined
      , 'noEscape'
      , context
      )


    Utils.set_context_property
      ( strict
      , undefined
      , 'strict'
      , context
      )


    Utils.set_context_property
      ( assumeObjects
      , undefined
      , 'assumeObjects'
      , context
      )


    Utils.set_context_property
      ( preventIndent
      , undefined
      , 'preventIndent'
      , context
      )


    Utils.set_context_property
      ( ignoreStandalone
      , undefined
      , 'ignoreStandalone'
      , context
      )


    Utils.set_context_property
      ( explicitPartialContext
      , undefined
      , 'explicitPartialContext'
      , context
      )

    
    return context
  }


module.exports.patch_context = patch_context



/**
 * Produce a new PrecompileOptions object with the properties from the
 * given Partial<PrecompileOptions>.
 *
 * @param {Partial<PrecompileOptions>} precompileOptionsPartial
 * @return {PrecompileOptions}
 */
function create
  ( precompileOptionsPartial
  ) {
    return patch_context(precompileOptionsPartial, {})
  }


module.exports.create = create



/**
 * Produce an updated PrecompileOptions object with the properties from
 * the given Partial<PrecompileOptions>. This does not alter the
 * original PrecompileOptions.
 *
 * @param {Partial<PrecompileOptions>} precompileOptionsPartial
 * @param {PrecompileOptions} initialPrecompileOptions
 *
 * @return {precompileOptions}
 */
function patch
  ( precompileOptionsPartial
  , initialPrecompileOptions
  ) {
    return (
      patch_context
        ( precompileOptionsPartial, { ... initialPrecompileOptions}
        )
    )
  }


module.exports.patch = patch




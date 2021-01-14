/**
 * TODO!!!
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
 * TODO!!!
 */
function patch_context
  ( partial 
  , context
  ) {
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




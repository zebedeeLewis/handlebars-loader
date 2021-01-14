/**
 * TODO!!!
 */



/**
 * Produce an updated CompileOptions object with the properties from the
 * given Partial<CompileOptions>. This alter the original CompileOptions
 * Object.
 *
 * @param {Partial<CompileOptions>}
 * @param {CompileOptions} compileOptions - context
 *
 * @return {CompileOptions}
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
 * Produce a new CompileOptions object with the properties from the
 * given Partial<CompileOptions>.
 *
 * @param {Partial<CompileOptions>} compileOptionsPartial
 * @return {CompileOptions}
 */
function create
  ( compileOptionsPartial
  ) {
    return patch_context(compileOptionsPartial, {})
  }


module.exports.create = create



/**
 * Produce an updated CompileOptions object with the properties from the
 * given Partial<CompileOptions>. This does not alter the original
 * CompileOptions.
 *
 * @param {Partial<CompileOptions>} compileOptionsPartial
 * @param {CompileOptions} initialCompileOptions
 *
 * @return {compileOptions}
 */
function patch
  ( compileOptionsPartial
  , initialCompileOptions
  ) {
    return (
      patch_context
        ( compileOptionsPartial, { ... initialCompileOptions}
        )
    )
  }


module.exports.patch = patch




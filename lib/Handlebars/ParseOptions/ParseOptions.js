/**
 * TODO!!!
 */



/**
 * Produce an updated ParseOptions object with the properties from the
 * given Partial<ParseOptions>. This alter the original ParseOptions
 * Object.
 *
 * @param {Partial<ParseOptions>}
 * @param {ParseOptions} parseOptions - context
 *
 * @return {ParseOptions}
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
 * Produce a new ParseOptions object with the properties from the given
 * Partial<ParseOptions>.
 *
 * @param {Partial<ParseOptions>} parseOptionsPartial
 * @return {ParseOptions}
 */
function create
  ( parseOptionsPartial
  ) {
    return patch_context(parseOptionsPartial, {})
  }


module.exports.create = create



/**
 * Produce an updated ParseOptions object with the properties from the
 * given Partial<ParseOptions>. This does not alter the original
 * ParseOptions.
 *
 * @param {Partial<ParseOptions>} parseOptionsPartial
 * @param {ParseOptions} initialParseOptions
 *
 * @return {parseOptions}
 */
function patch
  ( parseOptionsPartial
  , initialParseOptions
  ) {
    return (
      patch_context
        ( parseOptionsPartial, { ... initialParseOptions}
        )
    )
  }


module.exports.patch = patch




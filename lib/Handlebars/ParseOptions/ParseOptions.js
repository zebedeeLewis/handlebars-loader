/**
 * Represents a ParseOptions object as specified in the handlebars type
 * definition.
 *
 * @typedef {Object} ParseOptions
 *
 * @property {(string|undefined)} srcName - Passed to generate the
 * source map for the input file.
 *
 * @property {boolean} ignoreStandalone - Disables standalone tag
 * removal when set to true. When set, blocks and partials that are on
 * their own line will not remove the whitespace on that line.
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
 */
function patch_context
  ( { srcName
    , ignoreStandalone
    }
  , context
  ) {
    Utils.set_context_property
      ( srcName
      , undefined
      , 'srcName'
      , context
      )
    
    Utils.set_context_property
      ( ignoreStandalone
      , false 
      , 'ignoreStandalone'
      , context
      )

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




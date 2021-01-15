/**
 * TODO!!!
 */



/**
 * Produce an updated AST object with the properties from the
 * given Partial<AST>. This alter the original AST
 * Object.
 *
 * @param {Partial<AST>}
 * @param {AST} ast - context
 *
 * @return {AST}
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
 * Produce a new AST object with the properties from the
 * given Partial<AST>.
 *
 * @param {Partial<AST>} astPartial
 * @return {AST}
 */
function create
  ( astPartial
  ) {
    return patch_context(astPartial, {})
  }


module.exports.create = create



/**
 * Produce an updated AST object with the properties from the
 * given Partial<AST>. This does not alter the original
 * AST.
 *
 * @param {Partial<AST>} astPartial
 * @param {AST} initialAST
 *
 * @return {ast}
 */
function patch
  ( astPartial
  , initialAST
  ) {
    return (
      patch_context
        ( astPartial, { ... initialAST}
        )
    )
  }


module.exports.patch = patch




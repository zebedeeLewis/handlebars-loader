const _ = require('underscore')
const loaderUtils = require("loader-utils")
const hb = require('handlebars').create()


const Visitor = handlebars.Visitor


function InternalBlocksVisitor
  ( effectiveLoaderConfig
  , loaderContext
  ) {
    this.effectiveLoaderConfig = effectiveLoaderConfig
    this.loaderContext = loaderContext
    this.partialBlocks = []
    this.inlineBlocks = []
    this.parents = []
  }


InternalBlocksVisitor.prototype
  = Object.create(hb.Visitor.prototype)


module.exports.InternalBlocksVisitor = InternalBlocksVisitor



/**
 * @param {hbs.AST.PartialBlockStatement} partial
 * @param {InternalBlocksVisitor}
 *
 * @return {void}
 */
function PartialBlockStatement
  ( partial
  , visitorContext
  ) {
    visitorContext.partialBlocks.push(partial.name.original)
    Visitor.prototype.PartialBlockStatement.call
      ( visitorContext
      , partial
      )
  }


InernalBlockVisitor.prototype.PartialBlockStatement
  = function
      ( partial
      ) {
        PartialBlockStatement
          ( partial
          , this
          )
      }


module.exports.PartialBlockStatement = PartialBlockStatement



/**
 * @param {hbs.AST.PartialBlockStatement} partial
 * @param {InternalBlocksVisitor}
 *
 * @return {void}
 */

function DecoratorBlock
  ( partial
  , visitorContext
  ) {
    if (partial.path.original === 'inline') {
      visitorContext.inlineBlocks.push(partial.params[0].value)
    }

    Visitor.prototype.DecoratorBlock.call(visitorContext, partial)
  }


InernalBlockVisitor.prototype.DecoratorBlock
  = function
      ( partial
      ) {
        DecoratorBlock
          ( partial
          , this
          )
      }


module.exports.DecoratorBlock = DecoratorBlock


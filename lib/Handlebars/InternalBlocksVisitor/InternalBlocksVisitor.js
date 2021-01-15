const _ = require('underscore')
const loaderUtils = require("loader-utils")
const handlebars = require("handlebars")



// const hb = handlebars.create()
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
  = Object.create(Visitor.prototype)


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


InternalBlocksVisitor.prototype.PartialBlockStatement
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


InternalBlocksVisitor.prototype.DecoratorBlock
  = function
      ( partial
      ) {
        DecoratorBlock
          ( partial
          , this
          )
      }


module.exports.DecoratorBlock = DecoratorBlock


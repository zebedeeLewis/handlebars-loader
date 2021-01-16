/**
 * TODO!!!
 */

/**
 * @typedef {Object} Node
 * @property {string} type
 * @property {SourceLocation} - loc
 */


/**
 * @typedef {Object} SourceLocation
 * @property {string} source
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {Object} Position
 * @property {number} line
 * @property {number} column
 */

/**
 * @
 */

/*
  namespace AST {
      interface Program extends Node {
          body: Statement[];
          blockParams: string[];
      }

      interface Statement extends Node {}
      interface MustacheStatement extends Statement {
          type: 'MustacheStatement';
          path: PathExpression | Literal;
          params: Expression[];
          hash: Hash;
          escaped: boolean;
          strip: StripFlags;
      }

      interface Decorator extends MustacheStatement { }

      interface BlockStatement extends Statement {
          type: 'BlockStatement';
          path: PathExpression;
          params: Expression[];
          hash: Hash;
          program: Program;
          inverse: Program;
          openStrip: StripFlags;
          inverseStrip: StripFlags;
          closeStrip: StripFlags;
      }

      interface DecoratorBlock extends BlockStatement { }

      interface PartialStatement extends Statement {
          type: 'PartialStatement';
          name: PathExpression | SubExpression;
          params: Expression[];
          hash: Hash;
          indent: string;
          strip: StripFlags;
      }

      interface PartialBlockStatement extends Statement {
          type: 'PartialBlockStatement';
          name: PathExpression | SubExpression;
          params: Expression[];
          hash: Hash;
          program: Program;
          openStrip: StripFlags;
          closeStrip: StripFlags;
      }

      interface ContentStatement extends Statement {
          type: 'ContentStatement';
          value: string;
          original: StripFlags;
      }

      interface CommentStatement extends Statement {
          type: 'CommentStatement';
          value: string;
          strip: StripFlags;
      }

      interface Expression extends Node {}

      interface SubExpression extends Expression {
          type: 'SubExpression';
          path: PathExpression;
          params: Expression[];
          hash: Hash;
      }

      interface PathExpression extends Expression {
          type: 'PathExpression';
          data: boolean;
          depth: number;
          parts: string[];
          original: string;
      }

      interface Literal extends Expression {}
     interface StringLiteral extends Literal {
          type: 'StringLiteral';
          value: string;
          original: string;
      }

      interface BooleanLiteral extends Literal {
          type: 'BooleanLiteral';
          value: boolean;
          original: boolean;
      }

      interface NumberLiteral extends Literal {
          type: 'NumberLiteral';
          value: number;
          original: number;
      }

      interface UndefinedLiteral extends Literal {
          type: 'UndefinedLiteral';
	  }

      interface NullLiteral extends Literal {
          type: 'NullLiteral';
	  }

      interface Hash extends Node {
          type: 'Hash';
          pairs: HashPair[];
      }

      interface HashPair extends Node {
          type: 'HashPair';
          key: string;
          value: Expression;
      }

      interface StripFlags {
          open: boolean;
          close: boolean;
      }

      interface helpers {
          helperExpression(node: Node): boolean;
          scopeId(path: PathExpression): boolean;
          simpleId(path: PathExpression): boolean;
      }
  }
} 
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




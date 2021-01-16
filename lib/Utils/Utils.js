const _ = require('underscore')



/**
 * This function mutates to original "context".  Sets the "context"
 * property of the given "key" as follows:
 * 1. to "newValue" if not undefined, or
 * 2. to "context[newValue]" if not undefined, finally
 * 3. to "defaultValue"
 *
 * @param {T} newValue
 * @param {T} defaultValue
 * @param {string} key
 * @param {Object}
 *
 * @return {Object}
 */
function set_context_property
  ( newValue
  , defaultValue
  , key
  , context
  ) {
    const is_new_value_defined = !( _.isUndefined(newValue) )
    const is_original_value_defined = !( _.isUndefined(context[key]) )

    if( is_new_value_defined ){
      context[key] = newValue
    } else if( is_original_value_defined ){
      context[key] = context[key]
    } else {
      context[key] = defaultValue
    }


    return context
  }


module.exports.set_context_property = set_context_property



/**
 * validate a data item against the given schema.
 *
 * @param {Object} schema
 * @param {*} data
 *
 * @return {boolean}
 * @TODO!!!
 *   - see: https://ajv.js.org/
 */
function validate
  ( schema
  , data
  ) {
    return true
  }


module.exports.validate = validate



/**
 * Produce a new array where the first element is the first element of
 * the input array, and the second element is an array containing the
 * remainder of the input array.
 *
 * @param {Array<*>}
 * @return {Array<[*, [*]]>}
 */
function first_and_rest
  ( array
  ) {
    return [ _.first(array), _.rest(array) ]
  }


module.exports.first_and_rest = first_and_rest



/**
 * Reslove a single resource by checking in each directory provided
 * in the "resolveContext" array.
 *
 * @param {Function} resolve_path - The webpack loader api resolve
 * function. see:
     - resolve function documentation (https://webpack.js.org/api/loaders/#thisresolve)
 *
 * @param {Array<string>} resolveContext - an array of directories in
 * which the partial will be searched for.
 *
 * @param {string} resourcePath - path to the resource being resolved.
 *
 * @return {Promise<(string|null)>}
 */
function do_contextual_resource_resolve
  ( resolve_path
  , resolveContexts
  , resourcePath
  ) {
    return new Promise(
      ( resolve
      ) => {
        let context
        let _resolveContexts

        const resultCallback
          = (err, result) => {
              if( !err ) {
                resolve(result)
              } else {
                [context, _resolveContexts]
                  = first_and_rest(_resolveContexts)

                if( context ) {
                  resolve_path
                    ( context
                    , resourcePath
                    , resultCallback
                    )
                } else {
                  resolve(null)
                }
              }
            }

        resultCallback(true)
      }
    )
  }


module.exports.do_contextual_resource_resolve
  = do_contextual_resource_resolve



/**
 * calls the given function and produce the result of the call on
 * success or catch and produce the error on failure.
 *
 * @param {Function} fn - the function to execute.
 * @param {...*} args - whatever arguments the function will need.
 *
 * @return {(Error|*)}
 */
function produce_result_or_error
  ( fn
  , ... args
  ) {
    try {
      return fn( ... args )
    } catch (err) {
      return err
    }
  }


module.exports.produce_result_or_error = produce_result_or_error



function make_regexp
  ( stringOrRE
  ) {
    if( _.isRegExp(stringOrRE) ) { return stringOrRe }

    if( typeof stringOrRE === 'string') {
      return new RegExp(stringOrRE)
    }

    return null
  }


module.exports.make_regexp = make_regexp




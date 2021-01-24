const _ = require('underscore')
const path = require('path')



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
    return (
      array
        ? [ _.first(array), _.rest(array) ]
        : []
    )
  }


module.exports.first_and_rest = first_and_rest



/**
 * Resolve a single resource relative to the given context.
 *
 * @param {Function} resolve_resource - the function that will be used
 * to resolve the resource. See loaderAPI.resolve documentation (Webpack
 * Loader Interface "resolve" Docs #thisresolve)
 *
 * @param {string} context - an absolute directory, the given resource
 * will be resolved relative to this directory.
 *
 * @param {string} resourcePath - the path to the resource you want to
 * resolve.
 *
 * @return {Promise<(Error|string)>}
 */
function resolve_resource_in_context
  ( resolve_resource
  , context
  , relativePath
  ){
    return new Promise(
      ( resolve
      , reject
      ) => {
        const resultCallback
          = (err, result) => {
              if( err ) {
                reject(err)
              } else {
                resolve(result)
              }
            }

        resolve_resource
          ( context
          , resourcePath
          , resultCallback
          )
      }
    )
  }


module.exports.resolve_resource_in_context = resolve_resource_in_context



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
  , modifier
  ) {
    if( _.isRegExp(stringOrRE) ) { return stringOrRe }

    if( typeof stringOrRE === 'string') {
      return new RegExp(stringOrRE, modifier)
    }

    return null
  }


module.exports.make_regexp = make_regexp


function random_number
  (){
    return (
      Math
        .random()
        .toString()
        .slice(2)
    )
  }


module.exports.random_number = random_number



/**
 * produce true if the given file is a JavaScript file.
 */
function is_js_file
  ( filename
  ) {
    const ext = path.extname(filename)
    return ext === '.js'
  }


module.exports.is_js_file = is_js_file




const _ = require('underscore')



/**
 * This function mutates to original "context".  Sets the "context"
 * property of the given "key" as follows:
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




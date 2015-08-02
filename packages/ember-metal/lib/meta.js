// Remove "use strict"; from transpiled module until
// https://bugs.webkit.org/show_bug.cgi?id=138038 is fixed
//
'REMOVE_USE_STRICT: true';

import isEnabled from 'ember-metal/features';

/**
@module ember-metal
*/

function Meta(obj) {
  // map from strings to integer, with plain prototypical inheritance,
  // cloned at meta creation.
  this.watching = {};

  // plain map with no inheritance
  this.cache = undefined;

  // used only internally by meta() to distinguish meta-from-prototype
  // from instance's own meta
  this.source = obj;

  // map of maps, with two-level prototypical inheritance, cloned on access
  this.deps = undefined;

  // map from keys to lists. Has own __source__ property that's used
  // to distinguish whether it is being inherited or not. Each list
  // also has a __source__property. Both levels are inherited on
  // demand with o_create.
  this.listeners = undefined;

  // o_create inherited on demand
  this.mixins = undefined;

  // o_create inherited on demand. May also get wiped out with a
  // direct `m.bindings = {}` after they're handled.
  this.bindings = undefined;

  // instance of ChainNode, inherited on demand via ChainNode.copy
  this.chains = undefined;

  // instanceof ChainWatchers. Created on demand with a fresh new
  // ChainWatchers at each level in prototype chain, by testing
  // m.chainWatchers.obj.
  this.chainWatchers = undefined;

  // plain inheritance, cloned at meta creation
  this.values = undefined;

  // when meta(obj).proto === obj, the object is intended to be only a
  // prototype and doesn't need to actually be observable itself
  this.proto = undefined;
}

export var META_DESC = {
  writable: true,
  configurable: true,
  enumerable: false,
  value: null
};

var EMBER_META_PROPERTY = {
  name: '__ember_meta__',
  descriptor: META_DESC
};

// Placeholder for non-writable metas.
export var EMPTY_META = new Meta(null);

if (isEnabled('mandatory-setter')) {
  EMPTY_META.values = {};
}

/**
  Retrieves the meta hash for an object. If `writable` is true ensures the
  hash is writable for this object as well.

  The meta object contains information about computed property descriptors as
  well as any watched properties and other information. You generally will
  not access this information directly but instead work with higher level
  methods that manipulate this hash indirectly.

  @method meta
  @for Ember
  @private

  @param {Object} obj The object to retrieve meta for
  @param {Boolean} [writable=true] Pass `false` if you do not intend to modify
    the meta hash, allowing the method to avoid making an unnecessary copy.
  @return {Object} the meta hash for an object
*/
export function meta(obj, writable) {
  var ret = obj.__ember_meta__;
  if (writable === false) {
    return ret || EMPTY_META;
  }

  if (obj.__defineNonEnumerable) {
    obj.__defineNonEnumerable(EMBER_META_PROPERTY);
  } else {
    Object.defineProperty(obj, '__ember_meta__', META_DESC);
  }

  if (!ret) {
    ret = new Meta(obj);

    if (isEnabled('mandatory-setter')) {
      ret.values = {};
    }
  } else if (ret.source !== obj) {
    ret = Object.create(ret);
    ret.watching  = Object.create(ret.watching);
    ret.cache     = undefined;
    ret.source    = obj;

    if (isEnabled('mandatory-setter')) {
      ret.values = Object.create(ret.values);
    }
  }
  obj.__ember_meta__ = ret;
  return ret;
}

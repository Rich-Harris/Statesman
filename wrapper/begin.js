;(function ( global ) {

'use strict';

var Statesman,
	Subset,

	statesmanProto = {},
	subsetProto = {},

	events,

	// static methods and properties,
	compile,
	utils,

	// helper functions
	isEqual,
	isNumeric,
	normalise,
	augment,

	set,
	get,
	
	clearCache,
	notifyObservers,
	notifyMultipleObservers,
	propagateChanges,
	propagateChange,
	registerDependant,
	unregisterDependant,

	defineProperty,
	defineProperties,

	// internal caches
	normalisedKeypathCache = {};



// we're creating a defineProperty function here - we don't want to add
// this to _legacy.js since it's not a polyfill. It won't allow us to set
// non-enumerable properties. That shouldn't be a problem, unless you're
// using for...in on a (modified) array, in which case you deserve what's
// coming anyway
try {
	Object.defineProperty({}, 'test', { value: 0 });
	Object.defineProperties({}, { test: { value: 0 } });

	defineProperty = Object.defineProperty;
	defineProperties = Object.defineProperties;
} catch ( err ) {
	// Object.defineProperty doesn't exist, or we're in IE8 where you can
	// only use it with DOM objects (what the fuck were you smoking, MSFT?)
	defineProperty = function ( obj, prop, desc ) {
		obj[ prop ] = desc.value;
	};

	defineProperties = function ( obj, props ) {
		var prop;

		for ( prop in props ) {
			if ( props.hasOwnProperty( prop ) ) {
				defineProperty( obj, prop, props[ prop ] );
			}
		}
	};
}
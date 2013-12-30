define( function () {

	'use strict';

	return function ( a, b ) {
		// workaround for null, because typeof null = 'object'...
		if ( a === null && b === null ) {
			return true;
		}

		// If a or b is an object, return false. Otherwise `set( key, value )` will fail to notify
		// observers of `key` if `value` is the same object or array as it was before, even though
		// the contents of changed
		if ( typeof a === 'object' || typeof b === 'object' ) {
			return false;
		}

		// we're left with a primitive
		return a === b;
	};

});
define([
	'Statesman/prototype/compute/Computation'
], function (
	Computation
) {

	'use strict';

	return function ( keypath, signature ) {
		var result, k, computation;

		if ( typeof keypath === 'object' ) {
			result = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					computation = new Computation( this, k, keypath[k] );
					result[k] = computation.value;
				}
			}

			return result;
		}

		computation = new Computation( this, keypath, signature );
		return computation.value;
	};

});
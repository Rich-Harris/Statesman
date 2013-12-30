define([
	'Statesman/prototype/compute/Computed'
], function (
	Computed
) {

	'use strict';

	return function ( keypath, signature ) {
		var result, k, computed;

		if ( typeof keypath === 'object' ) {
			result = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					computed = new Computed( this, k, keypath[k] );
					result[k] = computed.value;
				}
			}

			return result;
		}

		computed = new Computed( this, keypath, signature );
		return computed.value;
	};

});
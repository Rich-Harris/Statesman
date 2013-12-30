define([
	'Statesman/prototype/compute/compile'
], function (
	compile
) {

	'use strict';

	return function ( keypath, signature ) {

		var result, k;

		if ( typeof keypath === 'object' ) {
			result = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					result[k] = compute( this, k, keypath[k] );
				}
			}

			return result;
		}

		return compute( this, keypath, signature );

	};

	function compute ( subset, keypath, signature ) {

		var path = subset.pathDot, i;

		if ( typeof signature === 'string' ) {
			signature = compile( signature, subset.root, path );
			return subset.root.compute( path + keypath, signature );
		}

		if ( typeof signature === 'function' ) {
			signature = signature();
		}

		// prefix dependencies
		if ( signature.dependsOn ) {
			if ( typeof signature.dependsOn === 'string' ) {
				signature.dependsOn = [ signature.dependsOn ];
			}

			i = signature.dependsOn.length;
			while ( i-- ) {
				signature.dependsOn = ( path + signature.dependsOn );
			}
		}

		if ( !signature.context ) {
			signature.context = subset;
		}

		return subset.root.compute( path + keypath, signature );
	}

});
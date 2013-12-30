define( function () {

	'use strict';

	var emptyArray = [], // no need to create this more than once!
		asyncPattern = /async/;

	return function ( keypath, signature, debug ) {

		if ( !signature.compiled ) {
			if ( !signature.get && !signature.set ) {
				throw new Error( 'Computed values must have either a get() or a set() method, or both' );
			}

			if ( !signature.set && ( signature.readonly !== false ) ) {
				signature.readonly = true;
			}

			if ( !signature.dependsOn ) {
				signature.dependsOn = emptyArray;
			} else if ( typeof signature.dependsOn === 'string' ) {
				signature.dependsOn = [ signature.dependsOn ];
			}

			if ( !signature.dependsOn.length ) {
				if ( signature.cache && debug ) {
					throw new Error( 'Computed values with no dependencies must be uncached' );
				}

				signature.cache = false;
			}

			if ( signature.cache !== false ) {
				signature.cache = true;
			}

			if ( signature.get && asyncPattern.test( signature.get ) ) {
				signature.async = true;
			}
		}

		if ( signature.dependsOn.indexOf( keypath ) !== -1 ) {
			throw new Error( 'A computed value ("' + keypath + '") cannot depend on itself' );
		}

		return signature;

	};

});
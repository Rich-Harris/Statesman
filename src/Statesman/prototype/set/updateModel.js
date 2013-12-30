define( function () {

	'use strict';

	var integerPattern = /^\s*[0-9]+\s*$/;

	return function ( obj, keypath, value ) {
		var key, keys = keypath.split( '.' );

		while ( keys.length > 1 ) {
			key = keys.shift();

			// If this branch doesn't exist yet, create a new one - if the next
			// key matches /^\s*[0-9]+\s*$/, assume we want an array branch rather
			// than an object
			if ( !obj[ key ] ) {
				obj[ key ] = ( integerPattern.test( keys[0] ) ? [] : {} );
			}

			obj = obj[ key ];
		}

		obj[ keys[0] ] = value;
	};

});
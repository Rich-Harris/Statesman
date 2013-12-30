define( function () {

	'use strict';

	return function ( current, extra ) {
		var i = extra.length, keypath;

		while ( i-- ) {
			keypath = extra[i];

			if ( !current[ '_' + keypath ] ) {
				current[ '_' + keypath ] = true; // we don't want to accidentally overwrite 'length'!
				current[ current.length ] = keypath;
			}
		}
	};

});
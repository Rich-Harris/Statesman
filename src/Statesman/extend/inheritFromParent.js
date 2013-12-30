define([
	'utils/clone',
	'Statesman/extend/extendable'
], function (
	clone,
	extendable
) {

	'use strict';

	return function ( Child, Parent ) {
		extendable.forEach( function ( property ) {
			if ( Parent[ property ] ) {
				Child[ property ] = clone( Parent[ property ] );
			}
		});
	};

});
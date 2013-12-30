define([
	'Statesman/prototype/shared/isNumeric'
], function (
	isNumeric
) {

	'use strict';

	return function ( keypath, d ) {
		var value = this.get( keypath );

		if ( d === undefined ) {
			d = 1;
		}

		if ( isNumeric( value ) && isNumeric( d ) ) {
			this.set( keypath, +value - ( d === undefined ? 1 : +d ) );
		}
	};

});


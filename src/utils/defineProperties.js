define([
	'utils/defineProperty'
], function (
	defineProperty
) {

	'use strict';

	if ( Object.defineProperties ) {
		return Object.defineProperties;
	}

	return function ( obj, props ) {
		var prop;

		for ( prop in props ) {
			if ( props.hasOwnProperty( prop ) ) {
				defineProperty( obj, prop, props[ prop ] );
			}
		}
	};

});
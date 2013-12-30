define( function () {

	'use strict';

	if ( Object.defineProperty ) {
		return Object.defineProperty;
	}

	return function ( obj, prop, desc ) {
		obj[ prop ] = desc.value;
	};

});
define( function () {

	'use strict';

	// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
	return function ( n ) {
		return !isNaN( parseFloat( n ) ) && isFinite( n );
	};

});
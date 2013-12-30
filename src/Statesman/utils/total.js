define( function () {

	'use strict';

	return function ( arr ) {
		return arr.reduce( function ( prev, curr ) {
			return prev + curr;
		});
	};

});
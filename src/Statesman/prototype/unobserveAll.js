define( function () {

	'use strict';

	return function () {
		var keypath;

		for ( keypath in this.observers ) {
			this.unobserve( keypath );
		}
	};

});
define( function () {

	'use strict';

	return function () {
		var keypath;

		for ( keypath in this.deps ) {
			this.unobserve( keypath );
		}
	};

});
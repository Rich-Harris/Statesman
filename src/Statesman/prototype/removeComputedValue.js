define( function () {

	'use strict';

	return function ( keypath ) {
		var computation;

		if ( computation = this.computations[ keypath ] ) {
			computation.teardown();
		}

		return this;
	};

});
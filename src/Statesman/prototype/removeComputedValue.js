define( function () {

	'use strict';

	return function ( keypath ) {
		if ( this.computed[ keypath ] ) {
			this.computed[ keypath ].teardown();
		}

		return this;
	};

});
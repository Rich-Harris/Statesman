define( function () {

	'use strict';

	return function ( keypath ) {
		this.set( keypath, !this.get( keypath ) );
	};

});
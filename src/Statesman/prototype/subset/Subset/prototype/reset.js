define( function () {

	'use strict';

	return function ( data ) {
		this.root.set( this.path, data );
		return this;
	};

});
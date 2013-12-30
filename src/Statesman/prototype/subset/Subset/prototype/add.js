define( function () {

	'use strict';

	return function ( keypath, d ) {
		this.root.add( this.pathDot + keypath, d );
	};

});
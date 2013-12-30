define( function () {

	'use strict';

	return function ( keypath, d ) {
		this.root.subtract( this.pathDot + keypath, d );
	};

});


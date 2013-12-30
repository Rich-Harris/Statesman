define( function () {

	'use strict';

	return function ( keypath ) {
		this.root.toggle( this.pathDot + keypath );
	};

});


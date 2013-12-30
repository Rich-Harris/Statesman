define( function () {

	'use strict';

	return function ( keypath ) {
		return this.root.subset( this.pathDot + keypath );
	};

});
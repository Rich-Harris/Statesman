define( function () {

	'use strict';

	return function ( keypath ) {
		if ( !keypath ) {
			return this.root.get( this.path );
		}

		return this.root.get( this.pathDot + keypath );
	};

});
define( function () {

	'use strict';

	return function ( keypath ) {
		this.root.removeComputedValue( this.pathDot + keypath );
		return this;
	};

});
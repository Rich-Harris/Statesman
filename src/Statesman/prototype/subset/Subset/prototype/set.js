define( function () {

	'use strict';

	return function ( keypath, value, options ) {
		var k, map;

		if ( typeof keypath === 'object' ) {
			options = value;
			map = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					map[ this.pathDot + k ] = keypath[ k ];
				}
			}

			this.root.set( map, options );
			return this;
		}

		this.root.set( this.pathDot + keypath, value, options );
		return this;
	};

});


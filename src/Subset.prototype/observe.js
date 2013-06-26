subsetProto.observe = function ( keypath, callback, options ) {
	var k, map;

	// overload - observe multiple keypaths
	if ( typeof keypath === 'object' ) {
		options = callback;

		map = {};
		for ( k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				map[ this.pathDot + k ] = keypath[ k ];
			}
		}

		if ( options ) {
			options.context = options.context || this;
		} else {
			options = { context: this };
		}

		return this.root.observe( map, options );
	}

	// overload - omit keypath to observe root
	if ( typeof keypath === 'function' ) {
		options = callback;
		callback = keypath;
		keypath = this.path;
	}

	else if ( keypath === '' ) {
		keypath = this.path;
	}

	else {
		keypath = ( this.pathDot + keypath );
	}

	if ( options ) {
		options.context = options.context || this;
	} else {
		options = { context: this };
	}

	return this.root.observe( keypath, callback, options );
};
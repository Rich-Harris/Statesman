subsetProto.observe = function ( keypath, callback, options ) {
	var args, k, map;

	args = Array.prototype.slice.call( arguments );

	// overload - observe multiple keypaths
	if ( typeof keypath === 'object' ) {
		options = callback;

		map = {};
		for ( k in keypath ) {
			map[ this._pathDot + k ] = keypath[ k ];
		}

		if ( options ) {
			options.context = options.context || this;
		} else {
			options = { context: this };
		}

		return this._root.observe( map, options );
	}

	// overload - omit keypath to observe root
	if ( typeof keypath === 'function' ) {
		options = callback;
		callback = keypath;
		keypath = this._path;
	}

	else if ( keypath === '' ) {
		keypath = this._path;
	}

	else {
		keypath = ( this._pathDot + keypath );
	}

	if ( options ) {
		options.context = options.context || this;
	} else {
		options = { context: this };
	}

	return this._root.observe( keypath, callback, options );
};
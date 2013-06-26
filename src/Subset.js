Subset = function( path, state ) {
	var self = this, keypathPattern, pathDotLength;

	this._path = path;
	this._pathDot = path + '.';
	this._root = state;

	// events stuff
	this._subs = {};
	keypathPattern = new RegExp( '^' + this._pathDot.replace( '.', '\\.' ) );
	pathDotLength = this._pathDot.length;

	this._root.on( 'set', function ( keypath, value, options ) {
		var localKeypath, k, unprefixed;

		if ( typeof keypath === 'object' ) {
			options = value;
			unprefixed = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) && keypathPattern.test( k ) ) {
					localKeypath = k.substring( pathDotLength );
					unprefixed[ localKeypath ] = keypath[k];
				}
			}

			self.fire( 'set', unprefixed, options );
			return;
		}

		if ( keypath === this._path ) {
			self.fire( 'reset' );
			return;
		}

		if ( keypathPattern.test( keypath ) ) {
			localKeypath = keypath.substring( pathDotLength );
			self.fire( 'set', localKeypath, value, options );
		}
	});
};
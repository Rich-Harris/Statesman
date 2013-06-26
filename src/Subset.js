Subset = function( path, state ) {
	var self = this, keypathPattern, pathDotLength;

	this.path = path;
	this.pathDot = path + '.';
	this.root = state;

	// events stuff
	this.subs = {};
	keypathPattern = new RegExp( '^' + this.pathDot.replace( '.', '\\.' ) );
	pathDotLength = this.pathDot.length;

	this.root.on( 'set', function ( keypath, value, options ) {
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

		if ( keypath === this.path ) {
			self.fire( 'reset' );
			return;
		}

		if ( keypathPattern.test( keypath ) ) {
			localKeypath = keypath.substring( pathDotLength );
			self.fire( 'set', localKeypath, value, options );
		}
	});
};
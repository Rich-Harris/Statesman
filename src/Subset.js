Subset = function( path, state ) {
	var self = this, keypathPattern, pathDotLength;

	this.path = path;
	this.pathDot = path + '.';
	this.root = state;

	// events stuff
	this.subs = {};
	keypathPattern = new RegExp( '^' + this.pathDot.replace( '.', '\\.' ) );
	pathDotLength = this.pathDot.length;

	this.root.on( 'change', function ( changeHash ) {
		var localKeypath, keypath, unprefixed, changed;

		unprefixed = {};

		for ( keypath in changeHash ) {
			if ( changeHash.hasOwnProperty( keypath ) && keypathPattern.test( keypath ) ) {
				localKeypath = keypath.substring( pathDotLength );
				unprefixed[ localKeypath ] = changeHash[ keypath ];

				changed = true;
			}
		}

		if ( changed ) {
			self.fire( 'change', unprefixed );
		}
	});
};
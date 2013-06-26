subsetProto.set = function ( keypath, value, options ) {
	var k, map;

	if ( typeof keypath === 'object' ) {
		options = value;
		map = {};

		for ( k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				map[ this._pathDot + k ] = keypath[ k ];
			}
		}
		
		this._root.set( map, options );
		return this;
	}

	this._root.set( this._pathDot + keypath, value, options );
	return this;
};
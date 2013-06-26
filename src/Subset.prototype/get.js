subsetProto.get = function ( keypath ) {
	if ( !keypath ) {
		return this._root.get( this._path );
	}

	return this._root.get( this._pathDot + keypath );
};
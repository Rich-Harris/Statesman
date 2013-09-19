subsetProto.get = subsetProto.toJSON = function ( keypath ) {
	if ( !keypath ) {
		return this.root.get( this.path );
	}

	return this.root.get( this.pathDot + keypath );
};
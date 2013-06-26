statesmanProto.subset = function ( path ) {
	if ( !path ) {
		throw 'No subset path specified';
	}

	if ( !this._subsets[ path ] ) {
		this._subsets[ path ] = new Subset( path, this );
	}

	return this._subsets[ path ];
};
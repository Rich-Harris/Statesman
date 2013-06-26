subsetProto.subset = function ( keypath ) {
	return this._root.subset( this._pathDot + keypath );
};
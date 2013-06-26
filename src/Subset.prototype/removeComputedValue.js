subsetProto.removeComputedValue = function ( keypath ) {
	this._root.removeComputedValue( this._pathDot + keypath );
	return this;
};
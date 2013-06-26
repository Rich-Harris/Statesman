subsetProto.removeComputedValue = function ( keypath ) {
	this.root.removeComputedValue( this.pathDot + keypath );
	return this;
};
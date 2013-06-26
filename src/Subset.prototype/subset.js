subsetProto.subset = function ( keypath ) {
	return this.root.subset( this.pathDot + keypath );
};
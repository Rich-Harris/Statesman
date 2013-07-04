subsetProto.subtract = function ( keypath, d ) {
	this.root.subtract( this.pathDot + keypath, d );
};
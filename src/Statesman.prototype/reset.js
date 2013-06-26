statesmanProto.reset = function ( data, options ) {
	this.data = {};
	
	this.set( data, { silent: true });
	this.fire( 'reset' );

	notifyDependantsOf( this, '' );

	return this;
};
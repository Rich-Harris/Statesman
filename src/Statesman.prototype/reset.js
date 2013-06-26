statesmanProto.reset = function ( data, options ) {
	this.data = {};
	
	// TODO to get proper change hash, should we just do a non-silent set?
	// what about e.g. Ractive adaptor?
	this.set( data, { silent: true });
	this.fire( 'reset' );

	notifyObservers( this, '' );

	return this;
};
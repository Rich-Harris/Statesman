statesmanProto.removeComputedValue = function ( keypath ) {
	if ( this._computed[ keypath ] ) {
		this._computed[ keypath ].teardown();
	}

	return this;
};
statesmanProto.removeComputedValue = function ( keypath ) {
	if ( this.computed[ keypath ] ) {
		this.computed[ keypath ].teardown();
	}

	return this;
};
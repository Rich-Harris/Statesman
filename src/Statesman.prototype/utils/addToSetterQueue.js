/*var addToSetterQueue = function ( statesman, keypath, value, options ) {
	var payload, k;

	if ( typeof keypath === 'object' ) {
		options = value;
		for ( k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				statesman._addToSetterQueue( k, keypath[k], options );
			}
		}
		return;
	}

	if ( options && options.silent ) {
		if ( !statesman._silentSetterPayload ) {
			statesman._silentSetterPayload = {};
		}

		payload = statesman._silentSetterPayload;
	} else {
		if ( !statesman._setterPayload ) {
			statesman._setterPayload = {};
		}

		payload = statesman._setterPayload;
	}

	payload[ keypath ] = value;
};*/
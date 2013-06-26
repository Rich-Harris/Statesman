statesmanProto.get = function ( keypath ) {
	return get( this, keypath && normalise( keypath ) );
};

var get = function ( statesman, keypath, keys, forceCache ) {
	var computed, key, lastKey, parentKeypath, parentValue, value;

	if ( !keypath ) {
		return statesman.data;
	}

	// if this is a non-cached computed value, compute it, unless we
	// specifically want the cached value
	if ( computed = statesman._computed[ keypath ] ) {
		if ( !forceCache && !computed.cache && !computed.override ) {
			statesman._cache[ keypath ] = computed.getter();
		}
	}

	// cache hit?
	if ( statesman._cache.hasOwnProperty( keypath ) ) {
		return statesman._cache[ keypath ];
	}

	keys = keys || keypath.split( '.' );
	lastKey = keys.pop();

	parentKeypath = keys.join( '.' );
	parentValue = get( statesman, parentKeypath, keys );

	if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
		value = parentValue[ lastKey ];
		statesman._cache[ keypath ] = value;

		if ( !statesman._cacheMap[ parentKeypath ] ) {
			statesman._cacheMap[ parentKeypath ] = [];
		}
		statesman._cacheMap[ parentKeypath ].push( keypath );
	}

	return value;
};
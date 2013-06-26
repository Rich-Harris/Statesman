var clearCache = function ( statesman, keypath ) {
	var children = statesman._cacheMap[ keypath ];

	// TODO
	delete statesman._cache[ keypath ];

	if ( !children ) {
		return;
	}

	while ( children.length ) {
		clearCache( statesman, children.pop() );
	}
};
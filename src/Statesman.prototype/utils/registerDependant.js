var registerDependant = function ( dependant, isReference ) {

	var statesman, keypath, deps, keys, parentKeypath, map, baseDeps, baseMap;

	statesman = dependant.statesman;
	keypath = dependant.keypath;

	if ( isReference ) {
		baseDeps = statesman._refs;
		baseMap = statesman._refsMap;
	} else {
		baseDeps = statesman._deps;
		baseMap = statesman._depsMap;
	}

	deps = baseDeps[ keypath ] || ( baseDeps[ keypath ] = [] );
	deps[ deps.length ] = dependant;

	// update dependants map
	keys = keypath.split( '.' );
	
	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );
	
		map = baseMap[ parentKeypath ] || ( baseMap[ parentKeypath ] = [] );

		if ( map[ keypath ] === undefined ) {
			map[ keypath ] = 0;
			map[ map.length ] = keypath;
		}

		map[ keypath ] += 1;

		keypath = parentKeypath;
	}
};
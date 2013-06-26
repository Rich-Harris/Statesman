var notifyDependantsOf = function ( statesman, keypath, directOnly ) {

	var deps, i, map;

	deps = statesman._deps[ keypath ];

	if ( deps ) {
		i = deps.length;
		while ( i-- ) {
			deps[i].update();
		}
	}

	if ( directOnly ) {
		return;
	}

	map = statesman._depsMap[ keypath ];
	if ( map ) {
		i = map.length;
		while ( i-- ) {
			notifyDependantsOf( statesman, map[i] );
		}
	}
	
};
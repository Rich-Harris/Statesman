var notifyObservers = function ( statesman, keypath, directOnly ) {

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
			notifyObservers( statesman, map[i] );
		}
	}	
};

var notifyMultipleObservers = function ( statesman, keypaths, directOnly ) {
	var i;

	i = keypaths.length;
	while ( i-- ) {
		notifyObservers( statesman, keypaths[i],directOnly );
	}
};
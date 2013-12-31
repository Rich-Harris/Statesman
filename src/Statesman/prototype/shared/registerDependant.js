define( function () {

	'use strict';

	return function ( dependant, isReference ) {

		var statesman, keypath, dependants, keys, parentKeypath, map, baseDeps, baseMap;

		statesman = dependant.statesman;
		keypath = dependant.keypath;

		if ( isReference ) {
			baseDeps = statesman.references;
			baseMap = statesman.referencesMap;
		} else {
			baseDeps = statesman.observers;
			baseMap = statesman.observersMap;
		}

		dependants = baseDeps[ keypath ] || ( baseDeps[ keypath ] = [] );
		dependants[ dependants.length ] = dependant;

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

});
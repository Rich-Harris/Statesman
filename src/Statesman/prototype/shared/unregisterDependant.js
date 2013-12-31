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

		dependants = baseDeps[ keypath ];
		dependants.splice( dependants.indexOf( dependant ), 1 );

		// update dependants map
		keys = keypath.split( '.' );

		while ( keys.length ) {
			keys.pop();
			parentKeypath = keys.join( '.' );

			map = baseMap[ parentKeypath ];

			map[ keypath ] -= 1;

			if ( !map[ keypath ] ) {
				map.splice( map.indexOf( keypath ), 1 );
				map[ keypath ] = undefined;
			}

			keypath = parentKeypath;
		}
	};

});
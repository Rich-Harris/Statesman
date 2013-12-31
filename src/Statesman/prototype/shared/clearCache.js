define( function () {

	'use strict';

	return function clearCache ( statesman, keypath ) {
		var children = statesman.cacheMap[ keypath ];

		statesman.cache[ keypath ] = undefined;

		if ( !children ) {
			return;
		}

		while ( children.length ) {
			clearCache( statesman, children.pop() );
		}
	};

});
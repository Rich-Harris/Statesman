define( function () {

	'use strict';

	return function clearCache ( statesman, keypath ) {
		var children = statesman.cacheMap[ keypath ];

		// TODO
		delete statesman.cache[ keypath ];

		if ( !children ) {
			return;
		}

		while ( children.length ) {
			clearCache( statesman, children.pop() );
		}
	};

});
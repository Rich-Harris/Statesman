define( function () {

	'use strict';

	var flush = function ( statesman, keypath, computations, directOnly ) {

		var dependants, i, map;

		dependants = ( computations ? statesman.references[ keypath ] : statesman.observers[ keypath ] );

		if ( dependants ) {
			i = dependants.length;
			while ( i-- ) {
				dependants[i].update();
			}
		}

		if ( directOnly ) {
			return;
		}

		map = ( computations ? statesman.referencesMap[ keypath ] : statesman.observersMap[ keypath ] );
		if ( map ) {
			i = map.length;
			while ( i-- ) {
				flush( statesman, map[i], computations );
			}
		}
	};

	flush.all = function ( statesman, keypaths, computations, directOnly ) {
		var i;

		i = keypaths.length;
		while ( i-- ) {
			flush( statesman, keypaths[i], computations, directOnly );
		}
	};

	return flush;

});
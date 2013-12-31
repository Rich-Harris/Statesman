define([
	'Statesman/prototype/shared/normalise'
], function (
	normalise
) {

	'use strict';

	return function ( keypath ) {
		var observers, i;

		keypath = ( keypath === undefined ? '' : normalise( keypath ) );

		observers = this.observers[ keypath ];

		if ( !observers ) {
			return;
		}

		i = observers.length;
		while ( i-- ) {
			observers[i].teardown();
		}
	};

});
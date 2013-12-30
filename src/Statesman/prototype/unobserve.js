define([
	'Statesman/prototype/shared/normalise',
	'Statesman/prototype/shared/Observer'
], function (
	normalise,
	Observer
) {

	'use strict';

	return function ( keypath ) {
		var deps, i;

		keypath = ( keypath === undefined ? '' : normalise( keypath ) );

		deps = this.deps[ keypath ];

		if ( !deps ) {
			return;
		}

		i = deps.length;
		while ( i-- ) {
			if ( deps[i] instanceof Observer ) {
				deps[i].teardown();
			}
		}
	};

});
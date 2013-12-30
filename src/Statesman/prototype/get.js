define([
	'Statesman/prototype/shared/normalise',
	'Statesman/prototype/shared/get'
], function (
	normalise,
	get
) {

	'use strict';

	return function ( keypath ) {
		return get( this, keypath && normalise( keypath ) );
	};

});


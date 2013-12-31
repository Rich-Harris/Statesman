define([
	'Statesman/prototype/shared/get',
	'Statesman/prototype/shared/clearCache',
	'Statesman/prototype/set/updateModel'
], function (
	get,
	clearCache,
	updateModel
) {

	'use strict';

	return function ( statesman, keypath, value ) {
		var previous, computation;

		// if this is a computed value, make sure it has a setter or can be
		// overridden. Unless it called set itself
		if ( ( computation = statesman.computations[ keypath ] ) && !computation.setting ) {
			computation.setter( value );
			return;
		}

		previous = get( statesman, keypath, null, true );

		// update the model, if necessary
		if ( previous !== value ) {
			updateModel( statesman.data, keypath, value );
		}

		else {
			// if value is a primitive, we don't need to do anything else -
			// we can be certain that no change has occurred
			if ( typeof value !== 'object' ) {
				return;
			}
		}

		// Clear cache
		clearCache( statesman, keypath );

		// add this keypath to the notification queue
		statesman.changes.push( keypath );
		statesman.changeHash[ keypath ] = value;

	};

});
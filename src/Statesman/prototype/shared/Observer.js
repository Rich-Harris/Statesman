define([
	'Statesman/prototype/shared/normalise',
	'Statesman/prototype/shared/isEqual',
	'Statesman/prototype/shared/registerDependant',
	'Statesman/prototype/shared/unregisterDependant'
], function (
	normalise,
	isEqual,
	registerDependant,
	unregisterDependant
) {

	'use strict';

	var Observer = function ( statesman, keypath, callback, options ) {
		this.statesman = statesman;
		this.keypath = normalise( keypath );
		this.callback = callback;

		// default to root as context, but allow it to be overridden
		this.context = ( options && options.context ? options.context : statesman );

		registerDependant( this );
	};

	Observer.prototype = {
		update: function () {
			var value;

			value = this.statesman.get( this.keypath );

			if ( !isEqual( value, this.value ) ) {
				// wrap the callback in a try-catch block, and only throw error in
				// debug mode
				try {
					this.callback.call( this.context, value, this.value );
				} catch ( err ) {
					if ( this.statesman.debug ) {
						throw err;
					}
				}
				this.value = value;
			}
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};

	return Observer;

});
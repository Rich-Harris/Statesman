define([
	'Statesman/prototype/shared/isEqual',
	'Statesman/prototype/shared/registerDependant',
	'Statesman/prototype/shared/unregisterDependant'
], function (
	isEqual,
	registerDependant,
	unregisterDependant
) {

	'use strict';

	var Reference = function ( computation, keypath ) {
		this.computation = computation;
		this.statesman = computation.statesman;
		this.keypath = keypath;

		this.value = this.statesman.get( keypath );

		registerDependant( this, true );
	};

	Reference.prototype = {
		update: function () {
			var value;

			value = this.statesman.get( this.keypath );

			if ( !isEqual( value, this.value ) ) {
				this.value = value;
				this.computation.bubble();
			}
		},

		teardown: function () {
			unregisterDependant( this, true );
		}
	};

	return Reference;

});
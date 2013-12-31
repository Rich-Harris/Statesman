define([
	'Statesman/prototype/shared/flush'
], function (
	flush
) {

	'use strict';

	return function ( data ) {
		this.data = {};

		// TODO to get proper change hash, should we just do a non-silent set?
		// what about e.g. Ractive adaptor?
		this.set( data, { silent: true });
		this.fire( 'reset' );

		flush( this, '', true, false );
		flush( this, '', false, false );

		return this;
	};

});


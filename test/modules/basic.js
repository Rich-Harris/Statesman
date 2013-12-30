define([ 'Statesman' ], function ( Statesman ) {

	'use strict';

	window.Statesman = Statesman;

	return function () {

		module( 'Basic setup' );

		test( 'Statesman exists and is a function', function ( t ) {
			t.ok( Statesman !== undefined );
			t.ok( _.isFunction( Statesman ) );
		});

		test( 'Statesman instance has following methods: get, set, reset, observe, unobserve', function ( t ) {
			var model = new Statesman();

			t.ok( _.isFunction( model.get ) );
			t.ok( _.isFunction( model.set ) );
			t.ok( _.isFunction( model.reset ) );
			t.ok( _.isFunction( model.observe ) );
		});

		test( 'Statesman instance stores data passed in at initialization on the data member', function ( t ) {
			var data = { foo: 'bar' }, model = new Statesman( data );

			t.equal( data, model.data );
		});

	};

});
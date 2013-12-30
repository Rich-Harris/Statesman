define([ 'Statesman' ], function ( Statesman ) {

	'use strict';

	window.Statesman = Statesman;

	return function () {

		module( 'Events' );

		test( '.on() and .fire() work as expected', function ( t ) {
			var model = new Statesman(), message, entity;

			model.on( 'test', function ( msg, ent ) {
				message = msg;
				entity = ent;
			});

			equal( message, undefined );
			equal( entity, undefined );

			model.fire( 'test', 'hello', 'world' );

			equal( message, 'hello' );
			equal( entity, 'world' );
		});

		test( '.on() can add multiple listeners simultaneously', function ( t ) {
			var model = new Statesman(), message, entity;

			model.on({
				greeting: function ( msg, ent ) {
					message = msg;
					entity = ent;
				},
				farewell: function ( msg, ent ) {
					message = msg;
					entity = ent;
				}
			});

			equal( message, undefined );
			equal( entity, undefined );

			model.fire( 'greeting', 'hello', 'world' );

			equal( message, 'hello' );
			equal( entity, 'world' );

			model.fire( 'farewell', 'goodbye', 'everybody' );

			equal( message, 'goodbye' );
			equal( entity, 'everybody' );
		});

		test( '.on() returns an object with a cancel property which removes listeners', function ( t ) {
			var model = new Statesman(), listener, triggered = 0;

			listener = model.on( 'test', function () {
				triggered += 1;
			});

			equal( triggered, 0 );

			model.fire( 'test' );
			equal( triggered, 1 );

			listener.cancel();
			model.fire( 'test' );
			equal( triggered, 1 );
		});

		test( '.on() with multiple callbacks returns an object with a cancel property which removes all listeners', function ( t ) {
			var model = new Statesman(), listener, triggered1 = 0, triggered2 = 0;

			listener = model.on({
				test1: function () {
					triggered1 += 1;
				},
				test2: function () {
					triggered2 += 1;
				}
			});

			equal( triggered1, 0 );
			equal( triggered2, 0 );

			model.fire( 'test1' );
			equal( triggered1, 1 );
			equal( triggered2, 0 );

			listener.cancel();
			model.fire( 'test1' );
			equal( triggered1, 1 );
			equal( triggered2, 0 );
		});

		test( '.off() without arguments removes all listeners', function ( t ) {
			var model = new Statesman(), message, entity;

			model.on({
				greeting: function ( msg, ent ) {
					message = msg;
					entity = ent;
				},
				farewell: function ( msg, ent ) {
					message = msg;
					entity = ent;
				}
			});

			equal( message, undefined );
			equal( entity, undefined );

			model.off();

			model.fire( 'greeting', 'hello', 'world' );

			equal( message, undefined );
			equal( entity, undefined );

			model.fire( 'farewell', 'goodbye', 'everybody' );

			equal( message, undefined );
			equal( entity, undefined );
		});
	};

});
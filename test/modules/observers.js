define([ 'Statesman' ], function ( Statesman ) {

	'use strict';

	window.Statesman = Statesman;

	return function () {

		module( 'Observers' );

		test( 'Observing "foo" adds a dependant to state.deps.foo', function ( t ) {
			var state = new Statesman(), callback = function () {}, observer;

			state.observe( 'foo', callback );
			ok( _.isArray( state.deps.foo ) );
			ok( _.isObject( state.deps.foo[0] ) );

			observer = state.deps.foo[0];

			equal( callback, observer.callback );
		});

		test( 'Observing "foo", then setting "foo", triggers the callback', function ( t ) {
			var state = new Statesman(), value;

			state.observe( 'foo', function ( val ) {
				value = val;
			});

			state.set( 'foo', 'bar' );
			equal( value, 'bar' );
		});

		test( 'Observing "foo", then setting "foo" silently, does not trigger the callback', function ( t ) {
			var state = new Statesman(), value;

			state.observe( 'foo', function ( val ) {
				value = val;
			});

			state.set( 'foo', 'bar', { silent: true });
			equal( value, undefined );
		});

		test( 'Observers can be cancelled', function ( t ) {
			var state, observer, triggered = 0;

			state = new Statesman({
				foo: 'bar'
			});

			observer = state.observe( 'foo', function () {
				triggered += 1;
			}, { init: false });

			state.set( 'foo', 'baz' );

			observer.cancel();
			state.set( 'foo', 'bar' );

			equal( triggered, 1 );
		});

		test( 'Setting an item only triggers callbacks if the value changes', function ( t ) {
			var state = new Statesman(), i = 0;

			state.observe( 'foo', function () {
				i += 1;
			}, { init: false });

			state.set( 'foo', 'bar' );
			state.set( 'foo', 'bar' );

			equal( i, 1 );
		});

		test( 'Callbacks are passed both new and previous value', function ( t ) {
			var state = new Statesman(), oldValue, newValue;

			state.observe( 'foo', function ( n, o ) {
				newValue = n;
				oldValue = o;
			});

			state.set( 'foo', 'bar' );
			equal( newValue, 'bar' );
			equal( oldValue, undefined );

			state.set( 'foo', 'baz' );
			equal( newValue, 'baz' );
			equal( oldValue, 'bar' );
		});

		test( 'Setting a value causes downstream observers to be notified', function ( t ) {
			var state = new Statesman(), value;

			state.observe( 'foo.bar', function ( val ) {
				value = val;
			});

			state.set( 'foo', { bar: 'baz' } );

			equal( value, 'baz' );
		});

		test( 'Notifications are skipped for values that haven\'t changed when upstream values change', function ( t ) {
			var triggered, state = new Statesman({
				foo: {
					a: 1,
					b: 2,
					bar: 'baz'
				}
			});

			state.observe( 'foo.bar', function () {
				triggered = true;
			}, { init: false });

			state.set( 'foo', { c: 3, d: 4, bar: 'baz' } );

			ok( !triggered );
		});

		test( 'Observers are notified when downstream keypaths are set', function ( t ) {
			var triggered, state = new Statesman({
				foo: {
					a: 1,
					b: 2,
					bar: 'baz'
				}
			});

			state.observe( 'foo', function () {
				triggered = true;
			});

			state.set( 'foo.bar', 'boo' );

			ok( triggered );
		});

		test( 'Observers are not notified when downstream keypaths are set but not changed', function ( t ) {
			var triggered, state = new Statesman({
				foo: {
					a: 1,
					b: 2,
					bar: 'baz'
				}
			});

			state.observe( 'foo', function () {
				console.log( 'triggering' );
				triggered = true;
			}, { init: false });

			state.set( 'foo.bar', 'baz' );

			ok( !triggered );
		});

		test( 'Multiple observers can be set in one go', function ( t ) {
			var state, finalFoo, finalBar, finalBaz;

			state = new Statesman({
				foo: 'bar',
				bar: 'baz',
				baz: 'foo'
			});

			state.observe({
				foo: function ( newFoo ) {
					finalFoo = newFoo;
				},
				bar: function ( newBar ) {
					finalBar = newBar;
				},
				baz: function ( newBaz ) {
					finalBaz = newBaz;
				}
			});

			state.set({
				foo: 'baz',
				bar: 'foo',
				baz: 'bar'
			});

			equal( finalFoo, 'baz' );
			equal( finalBar, 'foo' );
			equal( finalBaz, 'bar' );
		});

		test( 'Omitting a keypath causes the entire state model to be observed', function ( t ) {
			var observers, state, currentFoo, currentBar;

			state = new Statesman({
				foo: 'bar',
				bar: 'baz'
			});

			observers = state.observe( function ( state ) {
				currentFoo = state.foo;
				currentBar = state.bar;
			});

			state.set( 'foo', 'baz' );
			state.set( 'bar', 'boo' );

			equal( currentFoo, 'baz' );
			equal( currentBar, 'boo' );
		});

		test( 'Observers can be cancelled with state.unobserve( keypath )', function ( t ) {
			var state, observer, triggered = 0;

			state = new Statesman({
				foo: 'bar'
			});

			observer = state.observe( 'foo', function () {
				triggered += 1;
			}, { init: false });

			state.set( 'foo', 'baz' );
			equal( triggered, 1 );

			state.unobserve( 'foo' );

			state.set( 'foo', 'bar' );
			equal( triggered, 1 );
		});

		test( 'state.unobserve() with no keypath cancels root observers', function ( t ) {
			var state, observer, triggered = 0;

			state = new Statesman({
				foo: 'bar'
			});

			observer = state.observe( function () {
				triggered += 1;
			}, { init: false });

			equal( triggered, 0 );

			state.set( 'foo', 'baz' );
			equal( triggered, 1 );

			state.unobserve();

			state.set( 'foo', 'bar' );
			equal( triggered, 1 );
		});

		test( 'state.unobserveAll() removes all observers', function ( t ) {
			var state, observer1, observer2, triggered = 0;

			state = new Statesman({
				foo: 'bar'
			});

			observer1 = state.observe( 'foo', function () {
				triggered += 1;
			}, { init: false });

			observer2 = state.observe( function () {
				triggered += 1;
			}, { init: false });

			equal( triggered, 0 );

			state.set( 'foo', 'baz' );
			equal( triggered, 2 );

			state.unobserveAll();

			state.set( 'foo', 'bar' );
			equal( triggered, 2 );
		});

		test( 'Keypaths passed to state.unobserve are normalised', function ( t ) {
			var state, observer1, observer2, triggered = 0;

			state = new Statesman({
				array: [ 1, 2, 3 ]
			});

			observer1 = state.observe( 'array[0]', function () {
				triggered += 1;
			}, { init: false });

			observer2 = state.observe( 'array[1]', function () {
				triggered += 1;
			}, { init: false });

			equal( triggered, 0 );

			state.set( 'array[0]', 4 );
			state.set( 'array.1', 5 );
			equal( triggered, 2 );

			state.unobserve( 'array[0]' );
			state.unobserve( 'array.1' );

			state.set( 'array[0]', 5 );
			state.set( 'array.1', 6 );
			equal( triggered, 2 );
		});
	};

});
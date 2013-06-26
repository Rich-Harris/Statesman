modules[ modules.length ] = {
	name: 'Observers',
	tests: [
		{
			title: 'Observing "foo" adds a dependant to state._observers.foo',
			test: function () {
				var state = new Statesman(), callback = function () {}, observer;

				state.observe( 'foo', callback );
				ok( _.isArray( state._deps.foo ) );
				ok( _.isObject( state._deps.foo[0] ) );

				observer = state._deps.foo[0];

				equal( callback, observer.callback );
			}
		},

		{
			title: 'Observing "foo", then setting "foo", triggers the callback',
			test: function () {
				var state = new Statesman(), value;

				state.observe( 'foo', function ( val ) {
					value = val;
				});

				state.set( 'foo', 'bar' );
				equal( value, 'bar' );
			}
		},

		{
			title: 'Observing "foo", then setting "foo" silently, does not trigger the callback',
			test: function () {
				var state = new Statesman(), value;

				state.observe( 'foo', function ( val ) {
					value = val;
				});

				state.set( 'foo', 'bar', { silent: true });
				equal( value, undefined );
			}
		},

		{
			title: 'Observers can be cancelled',
			test: function () {
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
			}
		},

		{
			title: 'Setting an item only triggers callbacks if the value changes',
			test: function () {
				var state = new Statesman(), i = 0;

				state.observe( 'foo', function () {
					i += 1;
				}, { init: false });

				state.set( 'foo', 'bar' );
				state.set( 'foo', 'bar' );

				equal( i, 1 );
			}
		},

		{
			title: 'Callbacks are passed both new and previous value',
			test: function () {
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
			}
		},

		{
			title: 'Setting a value causes downstream observers to be notified',
			test: function () {
				var state = new Statesman(), value;

				state.observe( 'foo.bar', function ( val ) {
					value = val;
				});

				state.set( 'foo', { bar: 'baz' } );

				equal( value, 'baz' );
			}
		},

		{
			title: 'Notifications are skipped for values that haven\'t changed when upstream values change',
			test: function () {
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
			}
		},

		{
			title: 'Observers are notified when downstream keypaths are set',
			test: function () {
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
			}
		},

		{
			title: 'Observers are not notified when downstream keypaths are set but not changed',
			test: function () {
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
			}
		},

		{
			title: 'Multiple observers can be set in one go',
			test: function () {
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
			}
		},

		{
			title: 'Omitting a keypath causes the entire state model to be observed',
			test: function () {
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
			}
		}
	]
};
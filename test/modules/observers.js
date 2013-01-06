modules[ modules.length ] = {
	name: 'Observers',
	tests: [
		{
			title: '.observe() returns an array of observers',
			test: function () {
				var model = new Statesman(), observers;

				observers = model.observe( 'foo', function () {} );
				ok( _.isArray( observers ) && observers[0] );
			}
		},

		{
			title: 'An observer has: observedKeypath, originalKeypath, callback, group',
			test: function () {
				var model, callback, observers, observer;

				model = new Statesman({
					foo: 'bar'
				});

				callback = function () {};

				observers = model.observe( 'foo', callback );
				observer = observers[0];

				equal( observer.observedKeypath, 'foo' );
				equal( observer.originalKeypath, 'foo' );
				equal( observer.callback, callback );
				equal( observer.group, observers );
			}
		},

		{
			title: 'Observing "foo" adds an observer to model._observers.foo',
			test: function () {
				var model = new Statesman(), callback = function () {}, observer;

				model.observe( 'foo', callback );
				ok( _.isArray( model._observers.foo ) );
				ok( _.isObject( model._observers.foo[0] ) );

				observer = model._observers.foo[0];

				equal( callback, observer.callback );
			}
		},

		{
			title: 'Observing "foo", then setting "foo", triggers the callback',
			test: function () {
				var model = new Statesman(), value;

				model.observe( 'foo', function ( val ) {
					value = val;
				});

				model.set( 'foo', 'bar' );
				equal( value, 'bar' );
			}
		},

		{
			title: 'Observing "foo", then setting "foo" silently, does not trigger the callback',
			test: function () {
				var model = new Statesman(), value;

				model.observe( 'foo', function ( val ) {
					value = val;
				});

				model.set( 'foo', 'bar', { silent: true });
				equal( value, undefined );
			}
		},

		{
			title: 'Observers can be cancelled',
			test: function () {
				var model, observers, triggered = 0;

				model = new Statesman({
					foo: 'bar'
				});

				observers = model.observe( 'foo', function () {
					triggered += 1;
				});

				model.set( 'foo', 'baz' );

				model.unobserve( observers );
				model.set( 'foo', 'bar' );

				equal( triggered, 1 );
			}
		},

		{
			title: 'Setting an item only triggers callbacks if the value changes',
			test: function () {
				var model = new Statesman(), i = 0;

				model.observe( 'foo', function () {
					i += 1;
				});

				model.set( 'foo', 'bar' );
				model.set( 'foo', 'bar' );

				equal( i, 1 );
			}
		},

		{
			title: 'Setting an item with force=true triggers callbacks even if there is no change',
			test: function () {
				var model = new Statesman(), i = 0;

				model.observe( 'foo', function () {
					i += 1;
				});

				model.set( 'foo', 'bar', { force: true });
				model.set( 'foo', 'bar', { force: true });

				equal( i, 2 );
			}
		},

		{
			title: 'Silent > force',
			test: function () {
				var model = new Statesman(), i = 0;

				model.observe( 'foo', function () {
					i += 1;
				});

				model.set( 'foo', 'bar', { silent: true, force: true });
				model.set( 'foo', 'bar', { silent: true, force: true });

				equal( i, 0 );
			}
		},

		{
			title: 'Callbacks are passed both new and previous value',
			test: function () {
				var model = new Statesman(), oldValue, newValue;

				model.observe( 'foo', function ( n, o ) {
					newValue = n;
					oldValue = o;
				});

				model.set( 'foo', 'bar' );
				equal( newValue, 'bar' );
				equal( oldValue, undefined );

				model.set( 'foo', 'baz' );
				equal( newValue, 'baz' );
				equal( oldValue, 'bar' );
			}
		},

		{
			title: 'Setting a value causes downstream observers to be notified',
			test: function () {
				var model = new Statesman(), value;

				model.observe( 'foo.bar', function ( val ) {
					value = val;
				});

				model.set( 'foo', { bar: 'baz' } );

				equal( value, 'baz' );
			}
		},

		{
			title: 'Notifications are skipped for values that haven\'t changed when upstream values change',
			test: function () {
				var triggered, model = new Statesman({
					foo: {
						a: 1,
						b: 2,
						bar: 'baz'
					}
				});

				model.observe( 'foo.bar', function () {
					triggered = true;
				});

				model.set( 'foo', { c: 3, d: 4, bar: 'baz' } );

				ok( !triggered );
			}
		},

		{
			title: 'Observers are notified when downstream keypaths are set',
			test: function () {
				var triggered, model = new Statesman({
					foo: {
						a: 1,
						b: 2,
						bar: 'baz'
					}
				});

				model.observe( 'foo', function () {
					triggered = true;
				});

				model.set( 'foo.bar', 'boo' );
				
				ok( triggered );
			}
		},

		{
			title: 'Observers are not notified when downstream keypaths are set but not changed',
			test: function () {
				var triggered, model = new Statesman({
					foo: {
						a: 1,
						b: 2,
						bar: 'baz'
					}
				});

				model.observe( 'foo', function () {
					triggered = true;
				});

				model.set( 'foo.bar', 'baz' );
				
				ok( !triggered );
			}
		}
	]
};
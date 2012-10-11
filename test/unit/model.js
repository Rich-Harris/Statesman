test( 'Miso.Model exists and is a function', function() {
	ok( Miso.Model !== undefined );
	ok( _.isFunction( Miso.Model ) );
});

test( 'Model instance has following methods: get, set, observe, unobserve, unobserveAll', function () {
	var model = new Miso.Model();

	ok( _.isFunction( model.get ) );
	ok( _.isFunction( model.set ) );
	ok( _.isFunction( model.observe ) );
	ok( _.isFunction( model.unobserve ) );
	ok( _.isFunction( model.unobserveAll ) );
});

test( 'Model instance has empty _data and _observers members', function () {
	var model = new Miso.Model();

	ok( _.isObject( model._data ) && _.isEmpty( model._data ) );
	ok( _.isObject( model._observers ) && _.isEmpty( model._observers ) );
});

test( 'Model stores data passed in at initialization on the _data member', function () {
	var data = { foo: 'bar' }, model = new Miso.Model( data );

	equal( data, model._data );
});

test( 'Data passed in at initialization can be read with .get()', function () {
	var data = { foo: 'bar' }, model = new Miso.Model( data );

	equal( data.foo, model.get( 'foo' ) );
});

test( 'Data can be set using .set() and got using .get()', function () {
	var model = new Miso.Model();

	model.set( 'foo', 'bar' );
	equal( model.get( 'foo' ), 'bar' );
});

test( '.get() will fetch nested data', function () {
	var data = { foo: { bar: 'baz' } }, model = new Miso.Model( data );

	equal( model.get( 'foo.bar' ), 'baz' );
});

test( '.set() will set nested data', function () {
	var model = new Miso.Model();

	model.set( 'foo.bar', 'baz' );

	deepEqual( model._data, { foo: { bar: 'baz' } } );
});

test( '.set() and .get() will work with array or dot notation for numbers', function () {
	var model = new Miso.Model();

	model.set( 'foo.bar[0]', 'baz' );
	deepEqual( model._data, { foo: { bar: [ 'baz' ] } } );

	equal( model.get( 'foo.bar[0]' ), 'baz' );
	equal( model.get( 'foo.bar.0' ), 'baz' );
});

test( '.observe() returns an array of observer references', function () {
	var model = new Miso.Model(), observerRefs;

	observerRefs = model.observe( 'foo', function () {} );
	ok( _.isArray( observerRefs ) && observerRefs[0] );
});

test( 'An observer reference has a keypath and an observer', function () {
	var model = new Miso.Model(), observerRefs, observerRef;

	observerRefs = model.observe( 'foo', function () {} );
	observerRef = observerRefs[0];

	equal( observerRef.keypath, 'foo' );
	ok( _.isObject( observerRef.observer ) );
});

test( 'An observer has an originalKeypath and a function callback', function () {
	var model = new Miso.Model(), observerRefs, observerRef, observer;

	observerRefs = model.observe( 'foo', function () {} );
	observerRef = observerRefs[0];
	observer = observerRef.observer;

	equal( observer.originalKeypath, 'foo' );
	ok( _.isFunction( observer.callback ) );
});

test( 'Observing "foo" adds an observer to model._observers.foo', function () {
	var model = new Miso.Model(), callback = function () {}, observer;

	model.observe( 'foo', callback );
	ok( _.isArray( model._observers.foo ) );
	ok( _.isObject( model._observers.foo[0] ) );

	observer = model._observers.foo[0];

	equal( callback, observer.callback );
});

test( 'Observing "foo", then setting "foo", triggers the callback', function () {
	var model = new Miso.Model(), value;

	model.observe( 'foo', function ( val ) {
		value = val;
	});

	model.set( 'foo', 'bar' );
	equal( value, 'bar' );
});

test( 'Observing "foo", then setting "foo" silently, does not trigger the callback', function () {
	var model = new Miso.Model(), value;

	model.observe( 'foo', function ( val ) {
		value = val;
	});

	model.set( 'foo', 'bar', true ); // silent=true
	equal( value, undefined );
});

test( 'Setting an item only triggers callbacks if the value changes', function () {
	var model = new Miso.Model(), i = 0;

	model.observe( 'foo', function () {
		i += 1;
	});

	model.set( 'foo', 'bar' );
	model.set( 'foo', 'bar' );

	equal( i, 1 );
});

test( 'Setting an item with force=true triggers callbacks even if there is no change', function () {
	var model = new Miso.Model(), i = 0;

	model.observe( 'foo', function () {
		i += 1;
	});

	model.set( 'foo', 'bar', null, true ); // force=true
	model.set( 'foo', 'bar', null, true );

	equal( i, 2 );
});

test( 'Silent > force', function () {
	var model = new Miso.Model(), i = 0;

	model.observe( 'foo', function () {
		i += 1;
	});

	model.set( 'foo', 'bar', true, true );
	model.set( 'foo', 'bar', true, true );

	equal( i, 0 );
});

test( 'Callbacks are passed both new and previous value', function () {
	var model = new Miso.Model(), oldValue, newValue;

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
});

test( 'Setting a value causes downstream observers to be notified', function () {
	var model = new Miso.Model(), value;

	model.observe( 'foo.bar', function ( val ) {
		value = val;
	});

	model.set( 'foo', { bar: 'baz' } );

	equal( value, 'baz' );
});

test( 'Setting "foo.bar[0]" or "foo.bar.0" on an empty model causes foo.bar to be initialised as an array', function () {
	var model = new Miso.Model();

	model.set( 'foo.bar[0]', 'baz' );
	ok( _.isArray( model.get( 'foo.bar' ) ) );

	model.set( 'bar.baz.0', 'foo' );
	ok( _.isArray( model.get( 'bar.baz' ) ) );
});

test( 'Setting multiple keypaths in one go', function () {
	var model = new Miso.Model();

	model.set({
		one: 1,
		two: 2,
		three: 3,
		'foo.bar[0]': 'baz'
	});

	equal( model.get( 'one' ), 1 );
	equal( model.get( 'two' ), 2 );
	equal( model.get( 'three' ), 3 );
	equal( model.get( 'foo.bar[0]' ), 'baz' );
});

test( 'Notifications are skipped for values that haven\'t changed when upstream values change', function () {
	var triggered, model = new Miso.Model({
		foo: {
			a: 1,
			b: 2,
			bar: 'baz'
		}
	});

	model.observe( 'foo.bar', function () {
		console.log( 'triggering' );
		triggered = true;
	});

	model.set( 'foo', { c: 3, d: 4, bar: 'baz' } );

	ok( !triggered );
});
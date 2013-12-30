define([ 'Statesman' ], function ( Statesman ) {

	'use strict';

	window.Statesman = Statesman;

	return function () {

		module( 'Subsets' );

		test( 'Statesman instances have a subset method', function ( t ) {
			var state, subset;

			state = new Statesman();
			ok( _.isFunction( state.subset ) );

			subset = state.subset( 'test' );
		});

		test( 'Subset must have a path', function ( t ) {
			var state, subset, error;

			state = new Statesman();
			try {
				subset = state.subset();
			} catch ( err ) {
				error = true;
			}

			ok( error );
		});

		test( 'Subset path need not currently exist on the root instance', function ( t ) {
			var state, subset;

			state = new Statesman();
			subset = state.subset( 'foo' );

			// we haven't thrown an error yet...
			ok( subset );
		});

		test( 'Subset proxies state.set', function ( t ) {
			var state, subset;

			state = new Statesman({
				foo: {
					bar: 'baz'
				}
			});

			subset = state.subset( 'foo' );

			subset.set( 'bar', 'ben' );
			equal( state.get( 'foo.bar' ), 'ben' );
		});

		test( 'subset.set augments rather than replaces', function ( t ) {
			var state, subset;

			state = new Statesman({
				foo: {
					a: 1,
					b: 2,
					c: 3
				}
			});

			subset = state.subset( 'foo' );

			subset.set({
				d: 4,
				e: 5
			});

			deepEqual( subset.get(), { a: 1, b: 2, c: 3, d: 4, e: 5 });
		});

		test( 'subset.reset replaces rather than augments', function ( t ) {
			var state, subset;

			state = new Statesman({
				foo: {
					a: 1,
					b: 2,
					c: 3
				}
			});

			subset = state.subset( 'foo' );

			subset.reset({
				d: 4,
				e: 5
			});

			deepEqual( subset.get(), { d: 4, e: 5 });
		});

		test( 'Subset proxies state.get', function ( t ) {
			var state, subset;

			state = new Statesman({
				foo: {
					bar: 'baz'
				}
			});

			subset = state.subset( 'foo' );

			state.set( 'foo.bar', 'ben' );
			equal( subset.get( 'bar' ), 'ben' );
		});

		test( 'Subset proxies state.observe', function ( t ) {
			var state, subset, finalBar;

			state = new Statesman({
				foo: {
					bar: 'baz'
				}
			});

			subset = state.subset( 'foo' );

			subset.observe( 'bar', function ( newBar ) {
				finalBar = newBar;
			});

			state.set( 'foo.bar', 'ben' );
			equal( finalBar, 'ben' );
		});

		test( 'subset.observe() without a keypath observes the whole subset', function ( t ) {
			var state, subset, finalBar;

			state = new Statesman({
				foo: {
					bar: 'baz'
				}
			});

			subset = state.subset( 'foo' );

			subset.observe( function ( subset ) {
				finalBar = subset.bar;
			});

			state.set( 'foo.bar', 'ben' );
			equal( finalBar, 'ben' );
		});

		test( 'subset.observe() with empty string observes the whole subset', function ( t ) {
			var state, subset, finalBar;

			state = new Statesman({
				foo: {
					bar: 'baz'
				}
			});

			subset = state.subset( 'foo' );

			subset.observe( '', function ( subset ) {
				finalBar = subset.bar;
			});

			state.set( 'foo.bar', 'ben' );
			equal( finalBar, 'ben' );
		});

		test( 'Subset proxies state.compute', function ( t ) {
			var state, subset;

			state = new Statesman({
				text: {
					lower: 'foo'
				}
			});

			subset = state.subset( 'text' );

			subset.compute( 'upper', {
				dependsOn: 'lower',
				get: function ( lower ) {
					return lower.toUpperCase();
				}
			});

			equal( subset.get( 'upper' ), 'FOO' );
			subset.set( 'lower', 'bar' );
			equal( subset.get( 'upper' ), 'BAR' );
		});

		test( 'Subset proxies state.compute with compiled computed values', function ( t ) {
			var model, subset, finalValue;

			model = new Statesman({
				sub: {
					foo: 2,
					bar: 4
				}
			});

			window.model = model;

			subset = model.subset( 'sub' );
			subset.compute( 'baz', '${foo} + ${bar}' );

			equal( subset.get( 'baz' ), 6 );

			subset.observe( 'baz', function ( baz ) {
				finalValue = baz;
			});

			subset.set({
				foo: 10,
				bar: 20
			});

			equal( subset.get( 'baz' ), 30 );
			equal( finalValue, 30 );
		});

		test( 'Subset proxies state.removeComputedValue', function ( t ) {
			var state, subset;

			state = new Statesman({
				text: {
					lower: 'foo'
				}
			});

			subset = state.subset( 'text' );

			subset.compute( 'upper', {
				dependsOn: 'lower',
				get: function ( lower ) {
					return lower.toUpperCase();
				}
			});

			equal( subset.get( 'upper' ), 'FOO' );

			subset.removeComputedValue( 'upper' );

			subset.set( 'lower', 'bar' );
			equal( subset.get( 'upper' ), 'FOO' );
		});

		test( 'Subset proxies state.subset', function ( t ) {
			var state, subset, subsetSubset;

			state = new Statesman();

			subset = state.subset( 'foo' );
			subsetSubset = subset.subset( 'bar' );

			equal( subsetSubset.root, state );
			equal( subsetSubset.path, 'foo.bar' );
		});

		test( 'Subset observers are called with the subset as context (by default)', function ( t ) {
			var state, subset, bar;

			state = new Statesman({
				foo: {
					bar: 'baz'
				}
			});

			subset = state.subset( 'foo' );

			subset.observe( 'bar', function ( value ) {
				bar = value;
			});

			equal( bar, 'baz' );

			state.set( 'foo.bar', 'ben' );
			equal( bar, 'ben' );

			subset.set( 'bar', 'baz' );
			equal( bar, 'baz' );
		});
	};

});
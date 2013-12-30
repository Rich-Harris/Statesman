define([ 'Statesman' ], function ( Statesman ) {

	'use strict';

	window.Statesman = Statesman;

	return function () {

		module( 'Computed values' );

		test( 'Can create a computed value', function ( t ) {
			var model = new Statesman({
				foo: [ 1, 2, 3, 4 ]
			});

			model.compute( 'sum', {
				dependsOn: 'foo',
				get: function ( foo ) {
					var sum;

					sum = foo.reduce( function ( prev, curr ) {
						return prev + curr;
					});

					return sum;
				}
			});

			t.equal( model.get( 'sum' ), 10 );
		});

		test( 'Computed values update as expected', function ( t ) {
			var model = new Statesman({
				foo: [ 1, 2, 3, 4 ]
			});

			model.compute( 'sum', {
				dependsOn: 'foo',
				get: function ( foo ) {
					var sum;

					sum = foo.reduce( function ( prev, curr ) {
						return prev + curr;
					});

					return sum;
				}
			});

			model.set( 'foo[4]', 5 );

			t.equal( model.get( 'sum' ), 15 );
		});

		test( 'Computed values notify observers when their dependencies change', function ( t ) {
			var result, model = new Statesman({
				foo: [ 1, 2, 3, 4 ]
			});

			model.compute( 'sum', {
				dependsOn: 'foo',
				get: function ( foo ) {
					var sum;

					sum = foo.reduce( function ( prev, curr ) {
						return prev + curr;
					});

					return sum;
				}
			});

			model.observe( 'sum', function ( sum ) {
				result = sum;
			});

			model.set( 'foo[4]', 5 );

			t.equal( result, 15 );
		});

		test( 'Computed values only notify observers once even if multiple dependencies change simultaneously', function ( t ) {
			var triggered = 0, finalValue, model = new Statesman({
				foo: 2,
				bar: 4
			});

			model.compute( 'baz', {
				dependsOn: [ 'foo', 'bar' ],
				get: function ( foo, bar ) {
					return foo + bar;
				}
			});

			model.observe( 'baz', function ( baz ) {
				triggered += 1;
				finalValue = baz;
			});

			t.equal( triggered, 1 ); // init

			model.set({
				foo: 10,
				bar: 20
			});

			t.equal( finalValue, 30 );
			t.equal( triggered, 2 );
		});

		test( 'Computed values can be observed before they are defined, or after', function ( t ) {
			var model, sumResult, productResult;

			model = new Statesman({
				foo: [ 1, 2, 3, 4 ]
			});

			// observe sum
			model.observe( 'sum', function ( sum ) {
				sumResult = sum;
			});

			// create sum computed value
			model.compute( 'sum', {
				dependsOn: 'foo',
				get: function ( foo ) {
					var sum;

					sum = foo.reduce( function ( prev, curr ) {
						return prev + curr;
					});

					return sum;
				}
			});

			// create product computed value
			model.compute( 'product', {
				dependsOn: 'foo',
				get: function ( foo ) {
					var product;

					product = foo.reduce( function ( prev, curr ) {
						return prev * curr;
					}, 1 );

					return product;
				}
			});

			// observe product
			model.observe( 'product', function ( product ) {
				productResult = product;
			});

			t.equal( sumResult, 10 );
			t.equal( productResult, 24 );

			model.set( 'foo[4]', 5 );

			t.equal( sumResult, 15 );
			t.equal( productResult, 120 );
		});

		test( 'Computed values can be created without dependencies', function ( t ) {
			var model = new Statesman();

			model.compute( 'foo', {
				get: function () {
					return 'bar';
				}
			});

			t.equal( model.get( 'foo' ), 'bar' );
		});

		test( 'Uncached computed values are computed once at initialisation, and once for each get()', function ( t ) {
			var triggered = 0, model = new Statesman();

			model.compute( 'random', {
				get: function () {
					triggered += 1;
					return Math.random();
				}
			});

			t.equal( triggered, 1 );

			model.get( 'random' );
			t.equal( triggered, 2 );

			model.get( 'random' );
			t.equal( triggered, 3 );
		});

		test( 'Cached computed values are computed once at initialisation but not for subsequent get() calls', function ( t ) {
			var triggered = 0, model = new Statesman();

			model.compute( 'random', {
				dependsOn: 'foo',
				get: function () {
					triggered += 1;
					return Math.random();
				},
				cache: true
			});

			t.equal( triggered, 1 );

			model.get( 'random' );
			t.equal( triggered, 1 );

			model.get( 'random' );
			t.equal( triggered, 1 );
		});

		test( 'Uncached computed values with dependencies are triggered once for each time their dependencies are changed', function ( t ) {
			var triggered = 0, model = new Statesman({
				foo: 'bar'
			});

			model.compute( 'FOO', {
				dependsOn: 'foo',
				get: function ( foo ) {
					triggered += 1;
					return foo.toUpperCase();
				}
			});

			t.equal( triggered, 1 );

			model.set( 'foo', 'baz' );
			t.equal( triggered, 2 );

			model.set( 'foo', 'baz' );
			t.equal( triggered, 2 );

			model.set( 'foo', 'boo' );
			t.equal( triggered, 3 );
		});

		test( 'Cached computed values with dependencies are triggered once for each time their dependencies are changed', function ( t ) {
			var triggered = 0, model = new Statesman({
				foo: 'bar'
			});

			model.compute( 'FOO', {
				dependsOn: 'foo',
				get: function ( foo ) {
					triggered += 1;
					return foo.toUpperCase();
				},
				cache: true
			});

			t.equal( triggered, 1 );

			model.set( 'foo', 'baz' );
			t.equal( triggered, 2 );

			model.set( 'foo', 'baz' );
			t.equal( triggered, 2 );

			model.set( 'foo', 'boo' );
			t.equal( triggered, 3 );
		});

		test( 'Computed values can have multiple dependencies', function ( t ) {
			var result, model = new Statesman({
				firstname: 'Henry',
				lastname: 'Jekyll'
			});

			model.compute( 'fullname', {
				dependsOn: [ 'firstname', 'lastname' ],
				get: function ( firstname, lastname ) {
					return firstname + ' ' + lastname;
				}
			});

			model.observe( 'fullname', function ( fullname ) {
				result = fullname;
			});

			model.set( 'lastname', 'Hyde' );
			t.equal( result, 'Henry Hyde' );

			model.set( 'firstname', 'Edward' );
			t.equal( result, 'Edward Hyde' );
		});

		test( 'Computed values that are downstream of their dependencies do not result in infinite loops', function ( t ) {
			var triggered = 0, model = new Statesman({
				name: {
					first: 'what',
					last: 'ever'
				}
			});

			model.observe( 'name', function () {
				triggered += 1;
			});

			model.compute( 'name.full', {
				dependsOn: 'name',
				get: function ( name ) {
					return name.first + ' ' + name.last;
				}
			});

			t.ok( true );
		});

		test( 'Computed values are readonly by default and cannot therefore be manually set', function ( t ) {
			var model = new Statesman();

			model.debug = true;

			model.compute( 'foo', {
				get: function () {
					return 'bar';
				}
			});

			try {
				model.set( 'foo', 'baz' );
			} catch ( err ) {
				t.equal( err.message, 'You cannot overwrite a computed value ("foo"), unless its readonly flag is set to `false`' );
			}
		});

		test( 'Computed values can have the readonly flag set false, and can therefore be manually set', function ( t ) {
			var model = new Statesman();

			model.compute( 'foo', {
				get: function () {
					return 'bar';
				},
				readonly: false
			});

			model.set( 'foo', 'baz' );
			t.equal( model.get( 'foo' ), 'baz' );
		});

		test( 'Computed values with dependencies can have the readonly flag set false, and can therefore be manually set', function ( t ) {
			var model = new Statesman();

			model.compute( 'foo', {
				dependsOn: [ 'ben' ],
				get: function () {
					return 'bar';
				},
				readonly: false
			});

			model.set( 'foo', 'baz' );
			t.equal( model.get( 'foo' ), 'baz' );
		});

		test( 'Computed values can work in both directions without infinite loops', function ( t ) {
			var triggered = 0, model = new Statesman({
				lower: 'foo',
				upper: 'FOO'
			});

			model.compute( 'lower', {
				dependsOn: 'upper',
				get: function ( upper ) {
					triggered += 1;
					return upper.toLowerCase();
				},
				readonly: false
			});

			model.compute( 'upper', {
				dependsOn: 'lower',
				get: function ( lower ) {
					return lower.toUpperCase();
				},
				readonly: false
			});

			model.set( 'lower', 'bar' );
			t.equal( model.get( 'upper' ), 'BAR' );

			model.set( 'upper', 'BAZ' );
			t.equal( model.get( 'lower' ), 'baz' );

			model.set( 'lower', 'Foo' );
			t.equal( model.get( 'lower' ), 'foo' );
		});

		test( 'A computed value cannot be its own dependency', function ( t ) {
			var model = new Statesman();

			try {
				model.compute( 'test', {
					dependsOn: 'test',
					get: function () {
						// noop
					}
				});
			} catch ( err ) {
				t.equal( err.message, 'A computed value ("test") cannot depend on itself' );
			}
		});

		test( 'Computed values overwrite existing non-computed values', function ( t ) {
			var model = new Statesman({
				foo: 'bar'
			});

			model.compute( 'foo', {
				get: function () {
					return 'baz';
				}
			});

			t.equal( model.get( 'foo' ), 'baz' );
		});

		test( 'Multiple computed values can be set in one go - the method will return a hash of values', function ( t ) {
			var computed, model = new Statesman();

			computed = model.compute({
				foo: {
					get: function () { return 'bar'; }
				},
				bar: {
					get: function () { return 'baz'; }
				}
			});

			t.equal( computed.foo, 'bar' );
			t.equal( computed.bar, 'baz' );

			t.equal( model.get( 'foo' ), 'bar' );
			t.equal( model.get( 'bar' ), 'baz' );
		});

		test( 'Computed values can be removed, and their references will be torn down', function ( t ) {
			var model = new Statesman({
				foo: 'bar',
				bar: 'baz'
			});

			model.compute( 'foobar', {
				dependsOn: [ 'foo', 'bar' ],
				get: function ( foo, bar ) {
					return foo + bar;
				}
			});

			t.ok( _.isArray( model.refs.foo ) && model.refs.foo.length === 1 );
			t.ok( _.isArray( model.refs.bar ) && model.refs.bar.length === 1 );
			t.ok( _.isObject( model.computed.foobar ) );

			model.removeComputedValue( 'foobar' );

			t.ok( model.refs.foo.length === 0 );
			t.ok( model.refs.bar.length === 0 );
			t.ok( _.isNull( model.computed.foobar ) );
		});

		test( 'Observers of computed values will only be notified once if multiple dependencies are changed simultaneously', function ( t ) {
			var triggered = 0, before, after, model = new Statesman({
				firstname: 'Gisele',
				lastname: 'Bündchen'
			});

			model.compute( 'fullname', {
				dependsOn: [ 'firstname', 'lastname' ],
				get: function ( firstname, lastname ) {
					triggered += 1;
					return firstname + ' ' + lastname;
				}
			});

			before = triggered;

			model.set({
				firstname: 'Kate',
				lastname: 'Moss'
			});

			after = triggered;

			t.equal( after - before, 1 );
		});

		test( 'Computed values can be created using declarative syntax', function ( t ) {
			var model = new Statesman({
				foo: [ 1, 2, 3, 4 ]
			});

			model.compute( 'sum', '${ foo }.reduce( function ( prev, curr ) { return prev + curr });' );

			t.equal( model.get( 'sum' ), 10 );
		});

		test( 'Computed values can be created using declarative syntax, using Statesman.utils', function ( t ) {
			var model = new Statesman({
				foo: [ 1, 2, 3, 4 ]
			});

			model.compute( 'sum', 'utils.total( ${ foo } )' );

			t.equal( model.get( 'sum' ), 10 );
		});

		test( 'Compiled computed values trigger notifications when their values change', function ( t ) {
			var finalValue, model = new Statesman({
				foo: 2
			});

			model.compute( 'double', '2 * ${foo}' );

			t.equal( model.get( 'double' ), 4 );

			model.observe( 'double', function ( newValue, oldValue ) {
				finalValue = newValue;
			});

			model.set( 'foo', 4 );

			t.equal( finalValue, 8 );
		});

		test( 'Compiled computed values don\'t trigger notifications when their dependsOn change but they don\'t', function ( t ) {
			var triggered = 0, model = new Statesman({
				foo: 2,
				bar: 4
			});

			model.compute( 'baz', '${foo} + ${bar}' );

			t.equal( model.get( 'baz' ), 6 );

			model.observe( 'baz', function ( newValue, oldValue ) {
				triggered += 1;
			});

			t.equal( triggered, 1 ); // init

			model.set({
				foo: 3,
				bar: 3
			});

			t.equal( triggered, 1 );
		});

		test( 'Compiled computed values only notify observers once even if multiple dependsOn change simultaneously', function ( t ) {
			var triggered = 0, finalValue, model = new Statesman({
				foo: 2,
				bar: 4
			});

			model.compute( 'baz', '${foo} + ${bar}' );

			t.equal( model.get( 'baz' ), 6 );

			model.observe( 'baz', function ( baz ) {
				triggered += 1;
				finalValue = baz;
			});

			t.equal( triggered, 1 ); // init

			model.set({
				foo: 10,
				bar: 20
			});

			t.equal( finalValue, 30 );
			t.equal( triggered, 2 );
		});

		test( 'Multiple computed values that share a trigger are rolled into one `set` event', function ( t ) {
			var model, lastChange;

			model = new Statesman({
				foo: 'bar'
			});

			model.compute({
				FOO: '${foo}.toUpperCase()',
				oof: '${foo}.split("").reverse().join("")'
			});

			t.equal( model.get( 'FOO' ), 'BAR' );
			t.equal( model.get( 'oof' ), 'rab' );

			model.on( 'change', function ( hash ) {
				lastChange = hash;
			});

			model.set( 'foo', 'baz' );

			t.deepEqual( lastChange, { FOO: 'BAZ', oof: 'zab', foo: 'baz' });
		});
	};

});
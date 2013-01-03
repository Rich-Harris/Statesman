/*global QUnit, Supermodel, _, modules */

(function ( QUnit, Supermodel, _, modules ) {
	
	'use strict';

	var i, tests, module, test, equal, ok, runTest;

	module = QUnit.module;
	test   = QUnit.test;
	equal  = QUnit.equal;
	ok     = QUnit.ok;

	modules[ modules.length ] = {
		name: 'Computed values',
		tests: [
			{
				title: 'Can create a computed value',
				test: function () {
					var model = new Supermodel({
						foo: [ 1, 2, 3, 4 ]
					});

					model.compute( 'sum', {
						triggers: 'foo',
						fn: function ( foo ) {
							var sum;

							sum = foo.reduce( function ( prev, curr ) {
								return prev + curr;
							});

							return sum;
						}
					});

					equal( model.get( 'sum' ), 10 );
				}
			},

			{
				title: 'Computed values update as expected',
				test: function () {
					var model = new Supermodel({
						foo: [ 1, 2, 3, 4 ]
					});

					model.compute( 'sum', {
						triggers: 'foo',
						fn: function ( foo ) {
							var sum;

								sum = foo.reduce( function ( prev, curr ) {
								return prev + curr;
							});

							return sum;
						}
					});

					model.set( 'foo[4]', 5 );

					equal( model.get( 'sum' ), 15 );
				}
			},

			{
				title: 'Computed values notify observers when their triggers change',
				test: function () {
					var result, model = new Supermodel({
						foo: [ 1, 2, 3, 4 ]
					});

					model.compute( 'sum', {
						triggers: 'foo',
						fn: function ( foo ) {
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

					equal( result, 15 );
				}
			},

			{
				title: 'Computed values can be observed before they are defined, or after',
				test: function () {
					var model, sumResult, productResult;

					model = new Supermodel({
						foo: [ 1, 2, 3, 4 ]
					});

					// observe sum
					model.observe( 'sum', function ( sum ) {
						sumResult = sum;
					});

					// create sum computed value
					model.compute( 'sum', {
						triggers: 'foo',
						fn: function ( foo ) {
							var sum;

							sum = foo.reduce( function ( prev, curr ) {
								return prev + curr;
							});

							return sum;
						}
					});

					// create product computed value
					model.compute( 'product', {
						triggers: 'foo',
						fn: function ( foo ) {
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
					}, true );

					equal( sumResult, 10 );
					equal( productResult, 24 );

					model.set( 'foo[4]', 5 );

					equal( sumResult, 15 );
					equal( productResult, 120 );
				}
			},

			{
				title: 'Computed values can be created without triggers',
				test: function () {
					var model = new Supermodel();

					model.compute( 'foo', {
						fn: function () {
							return 'bar';
						}
					});

					equal( model.get( 'foo' ), 'bar' );
				}
			},

			{
				title: 'Uncached computed values are computed once at initialisation, and once for each get()',
				test: function () {
					var triggered = 0, model = new Supermodel();

					model.compute( 'random', {
						fn: function () {
							triggered += 1;
							return Math.random();
						}
					});

					equal( triggered, 1 );

					model.get( 'random' );
					equal( triggered, 2 );

					model.get( 'random' );
					equal( triggered, 3 );
				}
			},

			{
				title: 'Cached computed values are computed once at initialisation but not for subsequent get() calls',
				test: function () {
					var triggered = 0, model = new Supermodel();

					model.compute( 'random', {
						triggers: 'foo',
						fn: function () {
							triggered += 1;
							return Math.random();
						},
						cache: true
					});

					equal( triggered, 1 );

					model.get( 'random' );
					equal( triggered, 1 );

					model.get( 'random' );
					equal( triggered, 1 );
				}
			},

			{
				title: 'Uncached computed values with triggers are triggered once for each time their triggers are changed',
				test: function () {
					var triggered = 0, model = new Supermodel({
						foo: 'bar'
					});

					model.compute( 'FOO', {
						triggers: 'foo',
						fn: function ( foo ) {
							triggered += 1;
							return foo.toUpperCase();
						}
					});

					equal( triggered, 1 );

					model.set( 'foo', 'baz' );
					equal( triggered, 2 );

					model.set( 'foo', 'baz' );
					equal( triggered, 2 );

					model.set( 'foo', 'boo' );
					equal( triggered, 3 );
				}
			},

			{
				title: 'Cached computed values with triggers are triggered once for each time their triggers are changed',
				test: function () {
					var triggered = 0, model = new Supermodel({
						foo: 'bar'
					});

					model.compute( 'FOO', {
						triggers: 'foo',
						fn: function ( foo ) {
							triggered += 1;
							return foo.toUpperCase();
						},
						cache: true
					});

					equal( triggered, 1 );

					model.set( 'foo', 'baz' );
					equal( triggered, 2 );

					model.set( 'foo', 'baz' );
					equal( triggered, 2 );

					model.set( 'foo', 'boo' );
					equal( triggered, 3 );
				}
			},

			{
				title: 'Computed values can have multiple triggers',
				test: function () {
					var result, model = new Supermodel({
						firstname: 'Henry',
						lastname: 'Jekyll'
					});

					model.compute( 'fullname', {
						triggers: [ 'firstname', 'lastname' ],
						fn: function ( firstname, lastname ) {
							return firstname + ' ' + lastname;
						}
					});

					model.observe( 'fullname', function ( fullname ) {
						result = fullname;
					});

					model.set( 'lastname', 'Hyde' );
					equal( result, 'Henry Hyde' );

					model.set( 'firstname', 'Edward' );
					equal( result, 'Edward Hyde' );
				}
			},

			{
				title: 'Computed values that are downstream of their triggers do not result in infinite loops',
				test: function () {
					var triggered = 0, model = new Supermodel({
						name: {
							first: 'what',
							last: 'ever'
						}
					});

					model.observe( 'name', function () {
						triggered += 1;
					});

					model.compute( 'name.full', {
						triggers: 'name',
						fn: function ( name ) {
							return name.first + ' ' + name.last;
						}
					});

					ok( true );
				}
			},

			{
				title: 'Computed values are readonly by default and cannot therefore be manually set',
				test: function () {
					var model = new Supermodel();

					model.compute( 'foo', {
						fn: function () {
							return 'bar';
						}
					});

					try {
						model.set( 'foo', 'baz' );
					} catch ( err ) {
						equal( err, 'The computed value "foo" has readonly set true and cannot be changed manually' );
					}
				}
			},

			{
				title: 'Computed values can have the readonly flag set false, and can therefore be manually set',
				test: function () {
					var model = new Supermodel();

					model.compute( 'foo', {
						fn: function () {
							return 'bar';
						},
						readonly: false
					});

					model.set( 'foo', 'baz' );
					equal( model.get( 'foo' ), 'baz' );
				}
			},

			{
				title: 'Computed values can work in both directions without infinite loops',
				test: function () {
					var triggered = 0, model = new Supermodel({
						lower: 'foo',
						upper: 'FOO'
					});

					model.compute( 'lower', {
						triggers: 'upper',
						fn: function ( upper ) {
							triggered += 1;
							return upper.toLowerCase();
						},
						readonly: false
					});

					model.compute( 'upper', {
						triggers: 'lower',
						fn: function ( lower ) {
							return lower.toUpperCase();
						},
						readonly: false
					});

					model.set( 'lower', 'bar' );
					equal( model.get( 'upper' ), 'BAR' );

					model.set( 'upper', 'BAZ' );
					equal( model.get( 'lower' ), 'baz' );

					model.set( 'lower', 'Foo' );
					equal( model.get( 'lower' ), 'foo' );
				}
			},

			{
				title: 'A computed value cannot be its own trigger',
				test: function () {
					var model = new Supermodel();

					try {
						model.compute( 'test', {
							triggers: 'test',
							fn: function () {
								// noop
							}
						});
					} catch ( err ) {
						equal( err, 'A computed value cannot be its own trigger' );
					}
				}
			},

			{
				title: 'Computed values overwrite existing non-computed values',
				test: function () {
					var model = new Supermodel({
						foo: 'bar'
					});

					model.compute( 'foo', {
						fn: function () {
							return 'baz';
						}
					});

					equal( model.get( 'foo' ), 'baz' );
				}
			},

			{
				title: 'Multiple computed values can be set in one go - the method will return a hash of values',
				test: function () {
					var computed, model = new Supermodel();

					computed = model.compute({
						foo: {
							fn: function () { return 'bar'; }
						},
						bar: {
							fn: function () { return 'baz'; }
						}
					});

					equal( computed.foo, 'bar' );
					equal( computed.bar, 'baz' );

					equal( model.get( 'foo' ), 'bar' );
					equal( model.get( 'bar' ), 'baz' );
				}
			},

			{
				title: 'Triggers can be set using "trigger" or "triggers"',
				test: function () {
					var model = new Supermodel({
						value: 1
					});

					model.compute( 'double', {
						trigger: 'value',
						fn: function ( value ) {
							return 2 * value;
						}
					});

					model.compute( 'triple', {
						triggers: 'value',
						fn: function ( value ) {
							return 3 * value;
						}
					});

					model.set( 'value', 2 );

					equal( model.get( 'double' ), 4 );
					equal( model.get( 'triple' ), 6 );
				}
			},

			{
				title: 'Computed values can be removed, and their observers will be detached',
				test: function () {
					var model = new Supermodel({
						foo: 'bar',
						bar: 'baz'
					});

					model.compute( 'foobar', {
						triggers: [ 'foo', 'bar' ],
						fn: function ( foo, bar ) {
							return foo + bar;
						}
					});

					ok( _.isArray( model._observers.foo ) && model._observers.foo.length === 1 );
					ok( _.isArray( model._observers.bar ) && model._observers.bar.length === 1 );
					ok( _.isObject( model._computed.foobar ) );

					model.removeComputedValue( 'foobar' );

					ok( _.isUndefined( model._observers.foo ) );
					ok( _.isUndefined( model._observers.bar ) );
					ok( _.isUndefined( model._computed.foobar ) );
				}
			},

			{
				title: 'Observers of computed values will only be notified once if multiple triggers are changed simultaneously',
				test: function () {
					var triggered = 0, before, after, model = new Supermodel({
						firstname: 'Gisele',
						lastname: 'Bündchen'
					});

					model.compute( 'fullname', {
						triggers: [ 'firstname', 'lastname' ],
						fn: function ( firstname, lastname ) {
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

					equal( after - before, 1 );
				}
			}
		]
	};

}( QUnit, Supermodel, _, modules ));


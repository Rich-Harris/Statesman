/*global QUnit, Supermodel, _, modules */

(function ( QUnit, Supermodel, _, modules ) {
	
	'use strict';

	var i, tests, module, test, equal, ok, runTest;

	module = QUnit.module;
	test   = QUnit.test;
	equal  = QUnit.equal;
	ok     = QUnit.ok;

	modules[ modules.length ] = {
		name: '.get() and .set()',
		tests: [
			{
				title: 'Data passed in at initialization can be read with .get()',
				test: function () {
					var data = { foo: 'bar' }, model = new Supermodel( data );

					equal( data.foo, model.get( 'foo' ) );
				}
			},

			{
				title: 'Data can be set using .set() and got using .get()',
				test: function () {
					var model = new Supermodel();

					model.set( 'foo', 'bar' );
					equal( model.get( 'foo' ), 'bar' );
				}
			},

			{
				title: '.get() will fetch nested data',
				test: function () {
					var data = { foo: { bar: 'baz' } }, model = new Supermodel( data );

					equal( model.get( 'foo.bar' ), 'baz' );
				}
			},

			{
				title: '.set() will set nested data',
				test: function () {
					var model = new Supermodel();

					model.set( 'foo.bar', 'baz' );

					deepEqual( model._data, { foo: { bar: 'baz' } } );
				}
			},

			{
				title: '.set() and .get() will work with array or dot notation for numbers',
				test: function () {
					var model = new Supermodel();

					model.set( 'foo.bar[0]', 'baz' );
					deepEqual( model._data, { foo: { bar: [ 'baz' ] } } );

					equal( model.get( 'foo.bar[0]' ), 'baz' );
					equal( model.get( 'foo.bar.0' ), 'baz' );
				}
			},

			{
				title: 'Setting "foo.bar[0]" or "foo.bar.0" on an empty model causes foo.bar to be initialised as an array',
				test: function () {
					var model = new Supermodel();

					model.set( 'foo.bar[0]', 'baz' );
					ok( _.isArray( model.get( 'foo.bar' ) ) );

					model.set( 'bar.baz.0', 'foo' );
					ok( _.isArray( model.get( 'bar.baz' ) ) );
				}
			},

			{
				title: 'Setting multiple keypaths in one go',
				test: function () {
					var model = new Supermodel();

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
				}
			}
		]
	};

}( QUnit, Supermodel, _, modules ));
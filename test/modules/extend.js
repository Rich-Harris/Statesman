define([ 'Statesman' ], function ( Statesman ) {

	'use strict';

	window.Statesman = Statesman;

	return function () {

		module( 'Statesman.extend' );

		test( 'Statesman.extend returns a subclass of Statesman', function ( t ) {
			var Subclass = Statesman.extend(), subclass = new Subclass();

			t.ok( subclass instanceof Subclass );
			t.ok( subclass instanceof Statesman );
		});

		test( 'Unadorned subclasses behave like Statesman instances', function ( t ) {
			var Subclass = Statesman.extend(), subclass = new Subclass();

			subclass.set( 'foo', 'bar' );
			t.equal( subclass.get( 'foo' ), 'bar' );
		});

		test( 'Subclass methods are applied to the prototype', function ( t ) {
			var subclass, Subclass = Statesman.extend({
				hello: function () {
					return 'world';
				}
			});

			t.ok( typeof Subclass.prototype.hello === 'function' );

			subclass = new Subclass();

			t.equal( subclass.hello(), 'world' );
		});

		test( 'Subclass properties are applied to the prototype', function ( t ) {
			var subclass, Subclass = Statesman.extend({
				foo: 'bar'
			});

			t.equal( Subclass.prototype.foo, 'bar' );

			subclass = new Subclass();

			t.equal( subclass.foo, 'bar' );
		});

		test( 'Subclasses can themselves be extended', function ( t ) {
			var subSubclass, Subclass, SubSubclass;

			Subclass = Statesman.extend({
				foo: 'bar',

				hello: function () {
					return 'world';
				}
			});

			SubSubclass = Subclass.extend({
				bar: 'baz'
			});

			t.equal( SubSubclass.prototype.foo, 'bar' );
			t.equal( SubSubclass.prototype.bar, 'baz' );
			t.equal( typeof SubSubclass.prototype.hello, 'function' );

			subSubclass = new SubSubclass();

			t.equal( subSubclass.foo, 'bar' );
			t.equal( subSubclass.bar, 'baz' );
			t.equal( typeof subSubclass.hello, 'function' );
		});

		test( 'Subclasses can have default data', function ( t ) {
			var subClass, Subclass;

			Subclass = Statesman.extend({
				data: {
					foo: 'bar'
				}
			});

			subClass = new Subclass();

			t.equal( subClass.get( 'foo' ), 'bar' );
		});

		test( 'Subclasses can extend default data', function ( t ) {
			var subClass, Subclass;

			Subclass = Statesman.extend({
				data: {
					foo: 'bar'
				}
			});

			subClass = new Subclass({ bar: 'baz' });

			t.equal( subClass.get( 'foo' ), 'bar' );
			t.equal( subClass.get( 'bar' ), 'baz' );
		});

		test( 'Subclass data can be extended', function ( t ) {
			var subSubclass, Subclass, SubSubclass;

			Subclass = Statesman.extend({
				data: {
					foo: 'bar'
				}
			});

			SubSubclass = Subclass.extend({
				data: {
					bar: 'baz'
				}
			});

			subSubclass = new SubSubclass({ baz: 'foo' });

			t.equal( subSubclass.get( 'foo' ), 'bar' );
			t.equal( subSubclass.get( 'bar' ), 'baz' );
			t.equal( subSubclass.get( 'baz' ), 'foo' );
		});

		test( 'Subclasses can have default computed values', function ( t ) {
			var subClass, Subclass;

			Subclass = Statesman.extend({
				computed: {
					FOO: '${foo}.toUpperCase()'
				}
			});

			subClass = new Subclass({ foo: 'bar' });

			t.equal( subClass.get( 'FOO' ), 'BAR' );
		});

	};

});
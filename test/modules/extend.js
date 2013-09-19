modules[ modules.length ] = {
	name: 'Statesman.extend',
	tests: [
		{
			title: 'Statesman.extend returns a subclass of Statesman',
			test: function ( t ) {
				var Subclass = Statesman.extend(), subclass = new Subclass();

				t.ok( subclass instanceof Subclass );
				t.ok( subclass instanceof Statesman );
			}
		},

		{
			title: 'Unadorned subclasses behave like Statesman instances',
			test: function ( t ) {
				var Subclass = Statesman.extend(), subclass = new Subclass();

				subclass.set( 'foo', 'bar' );
				t.equal( subclass.get( 'foo' ), 'bar' );
			}
		},

		{
			title: 'Subclass methods are applied to the prototype',
			test: function ( t ) {
				var subclass, Subclass = Statesman.extend({
					hello: function () {
						return 'world';
					}
				});

				t.ok( typeof Subclass.prototype.hello === 'function' );

				subclass = new Subclass();

				t.equal( subclass.hello(), 'world' );
			}
		},

		{
			title: 'Subclass properties are applied to the prototype',
			test: function ( t ) {
				var subclass, Subclass = Statesman.extend({
					foo: 'bar'
				});

				t.equal( Subclass.prototype.foo, 'bar' );

				subclass = new Subclass();

				t.equal( subclass.foo, 'bar' );
			}
		},

		{
			title: 'Subclasses can themselves be extended',
			test: function ( t ) {
				var subSubClass, SubClass, SubSubClass;

				Subclass = Statesman.extend({
					foo: 'bar',

					hello: function () {
						return 'world';
					}
				});

				SubSubClass = Subclass.extend({
					bar: 'baz'
				});

				t.equal( SubSubClass.prototype.foo, 'bar' );
				t.equal( SubSubClass.prototype.bar, 'baz' );
				t.equal( typeof SubSubClass.prototype.hello, 'function' );

				subSubClass = new SubSubClass();

				t.equal( subSubClass.foo, 'bar' );
				t.equal( subSubClass.bar, 'baz' );
				t.equal( typeof subSubClass.hello, 'function' );
			}
		},

		{
			title: 'Subclasses can have default data',
			test: function ( t ) {
				var subClass, Subclass;

				SubClass = Statesman.extend({
					data: {
						foo: 'bar'
					}
				});

				subClass = new SubClass();

				t.equal( subClass.get( 'foo' ), 'bar' );
			}
		},

		{
			title: 'Subclasses can extend default data',
			test: function ( t ) {
				var subClass, Subclass;

				SubClass = Statesman.extend({
					data: {
						foo: 'bar'
					}
				});

				subClass = new SubClass({ bar: 'baz' });

				t.equal( subClass.get( 'foo' ), 'bar' );
				t.equal( subClass.get( 'bar' ), 'baz' );
			}
		},

		{
			title: 'Subclass data can be extended',
			test: function ( t ) {
				var subSubClass, Subclass, SubSubClass;

				SubClass = Statesman.extend({
					data: {
						foo: 'bar'
					}
				});

				SubSubClass = SubClass.extend({
					data: {
						bar: 'baz'
					}
				});

				subSubClass = new SubSubClass({ baz: 'foo' });

				t.equal( subSubClass.get( 'foo' ), 'bar' );
				t.equal( subSubClass.get( 'bar' ), 'baz' );
				t.equal( subSubClass.get( 'baz' ), 'foo' );
			}
		},

		{
			title: 'Subclasses can have default computed values',
			test: function ( t ) {
				var subClass, SubClass;

				SubClass = Statesman.extend({
					computed: {
						FOO: '${foo}.toUpperCase()'
					}
				});

				subClass = new SubClass({ foo: 'bar' });

				t.equal( subClass.get( 'FOO' ), 'BAR' );
			}
		}
	]
};
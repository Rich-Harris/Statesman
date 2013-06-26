modules[ modules.length ] = {
	name: '.get() and .set()',
	tests: [
		{
			title: 'Data passed in at initialization can be read with .get()',
			test: function () {
				var data = { foo: 'bar' }, state = new Statesman( data );

				equal( data.foo, state.get( 'foo' ) );
			}
		},

		{
			title: 'Data can be set using .set() and got using .get()',
			test: function () {
				var state = new Statesman();

				state.set( 'foo', 'bar' );
				equal( state.get( 'foo' ), 'bar' );
			}
		},

		{
			title: '.get() will fetch nested data',
			test: function () {
				var data = { foo: { bar: 'baz' } }, state = new Statesman( data );

				equal( state.get( 'foo.bar' ), 'baz' );
			}
		},

		{
			title: '.set() will set nested data',
			test: function () {
				var state = new Statesman();

				state.set( 'foo.bar', 'baz' );

				deepEqual( state.data, { foo: { bar: 'baz' } } );
			}
		},

		{
			title: '.set() and .get() will work with array or dot notation for numbers',
			test: function () {
				var state = new Statesman();

				state.set( 'foo.bar[0]', 'baz' );
				deepEqual( state.data, { foo: { bar: [ 'baz' ] } } );

				equal( state.get( 'foo.bar[0]' ), 'baz' );
				equal( state.get( 'foo.bar.0' ), 'baz' );
			}
		},

		{
			title: 'Setting "foo.bar[0]" or "foo.bar.0" on an empty state model causes foo.bar to be initialised as an array',
			test: function () {
				var state = new Statesman();

				state.set( 'foo.bar[0]', 'baz' );
				ok( _.isArray( state.get( 'foo.bar' ) ) );

				state.set( 'bar.baz.0', 'foo' );
				ok( _.isArray( state.get( 'bar.baz' ) ) );
			}
		},

		{
			title: 'Setting multiple keypaths in one go',
			test: function () {
				var state = new Statesman();

				state.set({
					one: 1,
					two: 2,
					three: 3,
					'foo.bar[0]': 'baz'
				});

				equal( state.get( 'one' ), 1 );
				equal( state.get( 'two' ), 2 );
				equal( state.get( 'three' ), 3 );
				equal( state.get( 'foo.bar[0]' ), 'baz' );
			}
		},

		{
			title: 'Augmenting existing data with state.set()',
			test: function () {
				var state = new Statesman({
					a: 1,
					b: 2,
					c: 3
				});

				state.set({
					d: 4,
					e: 5
				});

				deepEqual( state.get(), { a: 1, b: 2, c: 3, d: 4, e: 5 });
			}
		},

		{
			title: 'Replacing existing data with state.reset()',
			test: function () {
				var state = new Statesman({
					a: 1,
					b: 2,
					c: 3
				});

				state.reset({
					d: 4,
					e: 5
				});

				deepEqual( state.get(), { d: 4, e: 5 });
			}
		}
	]
};
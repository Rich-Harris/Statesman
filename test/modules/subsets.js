modules[ modules.length ] = {
	name: 'Subsets',
	tests: [
		{
			title: 'Statesman instances have a subset method',
			test: function () {
				var state, subset;

				state = new Statesman();
				ok( _.isFunction( state.subset ) );
				
				subset = state.subset( 'test' );
			}
		},

		{
			title: 'Subset must have a path',
			test: function () {
				var state, subset, error;

				state = new Statesman();
				try {
					subset = state.subset();
				} catch ( err ) {
					error = true;
				}

				ok( error );
			}
		},

		{
			title: 'Subset path need not currently exist on the root instance',
			test: function () {
				var state, subset;

				state = new Statesman();
				subset = state.subset( 'foo' );

				// we haven't thrown an error yet...
				ok( subset );
			}
		},

		{
			title: 'Subset proxies state.set',
			test: function () {
				var state, subset;

				state = new Statesman({
					foo: {
						bar: 'baz'
					}
				});

				subset = state.subset( 'foo' );

				subset.set( 'bar', 'ben' );
				equal( state.get( 'foo.bar' ), 'ben' );
			}
		},

		{
			title: 'subset.set augments rather than replaces',
			test: function () {
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
			}
		},

		{
			title: 'subset.reset replaces rather than augments',
			test: function () {
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
			}
		},

		{
			title: 'Subset proxies state.get',
			test: function () {
				var state, subset;

				state = new Statesman({
					foo: {
						bar: 'baz'
					}
				});

				subset = state.subset( 'foo' );

				state.set( 'foo.bar', 'ben' );
				equal( subset.get( 'bar' ), 'ben' );
			}
		},

		{
			title: 'Subset proxies state.observe',
			test: function () {
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
			}
		},

		{
			title: 'subset.observe() without a keypath observes the whole subset',
			test: function () {
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
			}
		},

		{
			title: 'subset.observe() with empty string observes the whole subset',
			test: function () {
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
			}
		},

		{
			title: 'Subset proxies state.compute',
			test: function () {
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
			}
		},

		{
			title: 'Subset proxies state.compute with compiled computed values',
			test: function () {
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
			}
		},

		{
			title: 'Subset proxies state.removeComputedValue',
			test: function () {
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
			}
		},

		{
			title: 'Subset proxies state.subset',
			test: function () {
				var state, subset, subsetSubset;

				state = new Statesman();

				subset = state.subset( 'foo' );
				subsetSubset = subset.subset( 'bar' );

				equal( subsetSubset._root, state );
				equal( subsetSubset._path, 'foo.bar' );
			}
		}
	]
};
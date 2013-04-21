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
			title: 'Subset proxies state.observeOnce',
			test: function () {
				var state, subset, finalBar;

				state = new Statesman({
					foo: {
						bar: 'baz'
					}
				});

				subset = state.subset( 'foo' );

				subset.observeOnce( 'bar', function ( newBar ) {
					finalBar = newBar;
				});

				state.set( 'foo.bar', 'ben' );
				state.set( 'foo.bar', 'somethingElseEntirely' );
				
				equal( finalBar, 'ben' );
			}
		},

		{
			title: 'Subset proxies state.unobserve',
			test: function () {
				var state, subset, observers, triggered;

				state = new Statesman({
					foo: {
						bar: 'baz'
					}
				});

				subset = state.subset( 'foo' );

				observers = subset.observe( 'bar', function () {
					triggered = true;
				}, { init: false });

				state.unobserve( observers );

				subset.set( 'bar', 'ben' );
				
				ok( !triggered );
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
					trigger: 'lower',
					fn: function ( lower ) {
						return lower.toUpperCase();
					}
				});

				equal( subset.get( 'upper' ), 'FOO' );
				subset.set( 'lower', 'bar' );
				equal( subset.get( 'upper' ), 'BAR' );
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
					trigger: 'lower',
					fn: function ( lower ) {
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
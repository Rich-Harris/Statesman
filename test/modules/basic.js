modules[ modules.length ] = {
	name: 'Basic setup',
	tests: [
		{
			title: 'Statesman exists and is a function',
			test: function () {
				ok( Statesman !== undefined );
				ok( _.isFunction( Statesman ) );
			}
		},

		{
			title: 'Statesman instance has following methods: get, set, reset, observe, unobserve',
			test: function () {
				var model = new Statesman();

				ok( _.isFunction( model.get ) );
				ok( _.isFunction( model.set ) );
				ok( _.isFunction( model.reset ) );
				ok( _.isFunction( model.observe ) );
			}
		},

		{
			title: 'Statesman instance stores data passed in at initialization on the data member',
			test: function () {
				var data = { foo: 'bar' }, model = new Statesman( data );

				equal( data, model.data );
			}
		}
	]
};
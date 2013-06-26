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
			title: 'Model instance has following methods: get, set, reset, observe, unobserve',
			test: function () {
				var model = new Statesman();

				ok( _.isFunction( model.get ) );
				ok( _.isFunction( model.set ) );
				ok( _.isFunction( model.reset ) );
				ok( _.isFunction( model.observe ) );
			}
		},

		{
			title: 'Model instance has empty data and _observers members',
			test: function () {
				var model = new Statesman();

				ok( _.isObject( model.data ) && _.isEmpty( model.data ) );
				ok( _.isObject( model._observers ) && _.isEmpty( model._observers ) );
			}
		},

		{
			title: 'Model stores data passed in at initialization on the data member',
			test: function () {
				var data = { foo: 'bar' }, model = new Statesman( data );

				equal( data, model.data );
			}
		}
	]
};
/*global QUnit, Supermodel, _, modules */

(function ( QUnit, Supermodel, _, modules ) {
	
	'use strict';

	var i, tests, module, test, equal, ok, runTest;

	module = QUnit.module;
	test   = QUnit.test;
	equal  = QUnit.equal;
	ok     = QUnit.ok;

	modules[ modules.length ] = {
		name: 'Basic setup',
		tests: [
			{
				title: 'Supermodel exists and is a function',
				test: function () {
					ok( Supermodel !== undefined );
					ok( _.isFunction( Supermodel ) );
				}
			},

			{
				title: 'Model instance has following methods: get, set, observe, unobserve',
				test: function () {
					var model = new Supermodel();

					ok( _.isFunction( model.get ) );
					ok( _.isFunction( model.set ) );
					ok( _.isFunction( model.observe ) );
					ok( _.isFunction( model.unobserve ) );
				}
			},

			{
				title: 'Model instance has empty _data and _observers members',
				test: function () {
					var model = new Supermodel();

					ok( _.isObject( model._data ) && _.isEmpty( model._data ) );
					ok( _.isObject( model._observers ) && _.isEmpty( model._observers ) );
				}
			},

			{
				title: 'Model stores data passed in at initialization on the _data member',
				test: function () {
					var data = { foo: 'bar' }, model = new Supermodel( data );

					equal( data, model._data );
				}
			}
		]
	};

	// runTest = function ( i ) {
	// 	test( tests[i].title, function () {
	// 		console.group( i+1 );
			
	// 		try {
	// 			tests[i].test();
	// 		} catch ( err ) {
	// 			console.error( err );
	// 		}

	// 		console.groupEnd();
	// 	});
	// };

	// i = 0;
	// for ( i=0; i<tests.length; i+=1 ) {
	// 	runTest( i );
	// }

}( QUnit, Supermodel, _, modules ));
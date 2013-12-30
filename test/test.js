var modules = [], k=0;

QUnit.config.reorder = false;

window.onload = function () {
	var i, j, k, runModuleTests;

	k = 0;

	runModuleTests = function ( i ) {
		var currentModule, currentTests, runTest;

		currentModule = modules[i];
		currentTests = currentModule.tests;

		module( currentModule.name );

		runTest = function ( currentTest ) {
			test( currentTest.title, function ( t ) {
				console.group( ++k );

				currentTest.test( t );

				console.groupEnd();
			});
		};

		for ( j=0; j<currentTests.length; j+=1 ) {
			runTest( currentTests[j] );
		}
	};

	for ( i=0; i<modules.length; i+=1 ) {
		runModuleTests( i );
	}
};
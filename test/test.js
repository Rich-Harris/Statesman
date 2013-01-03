var modules = [];

window.onload = function () {
	var i, j, k, runModuleTests;

	k = 0;

	runModuleTests = function ( i ) {
		var currentModule, currentTests, runTest;

		currentModule = modules[i];
		currentTests = currentModule.tests;

		runTest = function ( j ) {
			test( currentTests[j].title, function () {
				console.group( ++k );
				
				try {
					currentTests[j].test();
				} catch ( err ) {
					console.error( err );
				}

				console.groupEnd();
			});
		};

		QUnit.module( currentModule.name );

		for ( j=0; j<currentTests.length; j+=1 ) {
			runTest( j );
		}
	};

	for ( i=0; i<modules.length; i+=1 ) {
		runModuleTests( i );
	}
};
var modules = [];

window.onload = function () {
	var i, j, k, runModuleTests;

	k = 0;

	runModuleTests = function ( i ) {
		var currentModule, currentTests, runTest;

		currentModule = modules[i];
		currentTests = currentModule.tests;

		module( currentModule.name );

		for ( j=0; j<currentTests.length; j+=1 ) {
			test( currentTests[j].title, currentTests[j].test );
		}
	};

	for ( i=0; i<modules.length; i+=1 ) {
		runModuleTests( i );
	}
};
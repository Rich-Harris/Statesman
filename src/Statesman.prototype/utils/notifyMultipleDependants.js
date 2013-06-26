var notifyMultipleDependants = function ( statesman, keypaths, directOnly ) {
	var i;

	i = keypaths.length;
	while ( i-- ) {
		notifyDependantsOf( statesman, keypaths[i],directOnly );
	}
};
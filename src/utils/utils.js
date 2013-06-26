// Miscellaneous helper functions
isEqual = function ( a, b ) {
	// workaround for null, because typeof null = 'object'...
	if ( a === null && b === null ) {
		return true;
	}

	// If a or b is an object, return false. Otherwise `set( key, value )` will fail to notify
	// observers of `key` if `value` is the same object or array as it was before, even though
	// the contents of changed
	if ( typeof a === 'object' || typeof b === 'object' ) {
		return false;
	}

	// we're left with a primitive
	return a === b;
};

normalise = function ( keypath ) {
	return normalisedKeypathCache[ keypath ] || ( normalisedKeypathCache[ keypath ] = keypath.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ) );
};

augment = function ( target, source ) {
	var key;

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = source[ key ];
		}
	}
};
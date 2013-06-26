toString = Object.prototype.toString;

isArray = function ( thing ) {
	return toString.call( thing ) === '[object Array]';
}

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

getObservers = function ( model, keypath ) {
	var observers, upstream, observer, keys, i;

	// direct and downstream observers
	observers = model._observers[ keypath ];

	// upstream
	keys = keypath.split( '.' );

	while ( keys.length ) {
		keys.pop();
		keypath = keys.join( '.' );
		upstream = model._observers[ keypath ];

		i = upstream.length;
		while ( i-- ) {
			observer = upstream[i];

			// we only want direct observers of the upstream keypath
			if ( observer.observedKeypath === keypath ) {
				observers[ observers.length ] = observer;
			}
		}
	}

	if ( model._rootObservers ) {
		observers = observers.concat( model._rootObservers );
	}

	return observers;
};

notifyObservers = function ( model, observers ) {
	var i, observer;

	model._setOps = [];

	while ( i-- ) {
		observer = observers[i];

		
	}
};

augment = function ( target, source ) {
	var key;

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = source[ key ];
		}
	}
};
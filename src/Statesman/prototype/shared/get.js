define([

], function (

) {

	'use strict';

	return function get ( statesman, keypath, keys, forceCache ) {
		var computation, lastKey, parentKeypath, parentValue, value;

		if ( !keypath ) {
			return statesman.data;
		}

		// if this is a non-cached computation, compute it, unless we
		// specifically want the cached value
		if ( computation = statesman.computations[ keypath ] ) {
			if ( !forceCache && !computation.cache && !computation.override ) {
				statesman.cache[ keypath ] = computation.getter();
			}
		}

		// cache hit?
		if ( ( value = statesman.cache[ keypath ] ) !== undefined ) {
			return value;
		}

		keys = keys || keypath.split( '.' );
		lastKey = keys.pop();

		parentKeypath = keys.join( '.' );
		parentValue = get( statesman, parentKeypath, keys );

		if ( parentValue && parentValue[ lastKey ] !== undefined ) {
			value = parentValue[ lastKey ];
			statesman.cache[ keypath ] = value;

			if ( !statesman.cacheMap[ parentKeypath ] ) {
				statesman.cacheMap[ parentKeypath ] = [];
			}
			statesman.cacheMap[ parentKeypath ].push( keypath );
		}

		return value;
	};

});
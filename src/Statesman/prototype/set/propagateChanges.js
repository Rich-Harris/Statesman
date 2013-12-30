define( function () {

	'use strict';

	return function ( statesman ) {
		var i, changes, upstreamChanges, keypath, computed;

		changes = statesman.changes;
		upstreamChanges = statesman.upstreamChanges;

		statesman.changes = [];
		statesman.upstreamChanges = [];

		// upstream first
		i = upstreamChanges.length;
		while ( i-- ) {
			keypath = upstreamChanges[i];
			propagateChange( statesman, keypath, true );
		}

		i = changes.length;
		while ( i-- ) {
			keypath = changes[i];
			propagateChange( statesman, keypath );
		}

		while ( statesman.deferred.length ) {
			computed = statesman.deferred.pop();
			computed.update();
			computed.deferred = false;
		}
	};


	function propagateChange ( statesman, keypath, directOnly ) {

		var refs, map, i;

		refs = statesman.refs[ keypath ];
		if ( refs ) {
			i = refs.length;
			while ( i-- ) {
				refs[i].update();
			}
		}

		// if we're propagating upstream changes, we only want to notify
		// direct dependants, not dependants of downstream keypaths
		if ( directOnly ) {
			return;
		}

		map = statesman.refsMap[ keypath ];
		if ( map ) {
			i = map.length;
			while ( i-- ) {
				propagateChange( statesman, map[i] );
			}
		}
	}

});
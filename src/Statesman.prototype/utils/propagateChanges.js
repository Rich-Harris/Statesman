var propagateChanges = function ( statesman ) {
	var i, changes, upstreamChanges, keypath, refs, map, computed;

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

	while ( statesman._deferred.length ) {
		computed = statesman._deferred.pop();
		computed.update();
		computed.deferred = false;
	}
};


var propagateChange = function ( statesman, keypath, directOnly ) {

	var refs, map, i;

	refs = statesman._refs[ keypath ];
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

	map = statesman._refsMap[ keypath ];
	if ( map ) {
		i = map.length;
		while ( i-- ) {
			propagateChange( map[i] );
		}
	}
};
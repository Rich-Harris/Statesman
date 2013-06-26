(function ( statesmanProto ) {

	var integerPattern = /^\s*[0-9]+\s*$/, updateModel, mergeChanges;

	statesmanProto.set = function ( keypath, value, options ) {
		var allChanges, allUpstreamChanges, k, normalised;

		this.changes = [];
		this.upstreamChanges = [];

		this.changeHash = {};

		// setting multiple values in one go
		if ( typeof keypath === 'object' ) {
			options = value;

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					normalised = normalise( k );
					value = keypath[k];

					set( this, normalised, value );
				}
			}
		}

		// setting a single value
		else {
			normalised = normalise( keypath );
			set( this, normalised, value );
		}

		allChanges = [];
		allUpstreamChanges = [];

		// propagate changes via computed values
		while ( this.changes.length ) {
			mergeChanges( allChanges, this.changes );
			mergeChanges( allUpstreamChanges, this.upstreamChanges );
			propagateChanges( this );
		}

		// If this was a silent update, don't trigger any observers or events
		if ( options && options.silent ) {
			return this;
		}

		// Notify direct dependants of upstream keypaths...
		notifyMultipleObservers( this, allUpstreamChanges, true );

		// ...and dependants of this and downstream keypaths
		if ( allChanges.length ) {
			notifyMultipleObservers( this, allChanges );
		}

		

		// fire event
		if ( allChanges.length ) {
			this.fire( 'change', this.changeHash );
		}

		return this;
	};

	set = function ( statesman, keypath, value ) {
		var previous, keys, computed;

		// if this is a computed value, make sure it has a setter or can be
		// overridden. Unless it called set itself
		if ( ( computed = statesman.computed[ keypath ] ) && !computed.setting ) {
			computed.setter( value );
			return;
		}

		previous = get( statesman, keypath, null, true );
		
		// update the model, if necessary
		if ( previous !== value ) {
			updateModel( statesman.data, keypath, value );
		}

		else {
			// if value is a primitive, we don't need to do anything else -
			// we can be certain that no change has occurred
			if ( typeof value !== 'object' ) {
				return;
			}
		}

		// Clear cache
		clearCache( statesman, keypath );

		// add this keypath to the notification queue
		statesman.changes[ statesman.changes.length ] = keypath;
		statesman.changeHash[ keypath ] = value;

		// add upstream changes
		keys = keypath.split( '.' );
		while ( keys.length ) {
			keys.pop();
			keypath = keys.join( '.' );
			
			if ( statesman.upstreamChanges[ keypath ] ) {
				break; // all upstream keypaths will have already been added
			}

			statesman.upstreamChanges[ keypath ] = true;
			statesman.upstreamChanges.push( keypath );
		}
		
	};


	updateModel = function ( obj, keypath, value ) {
		var key, keys = keypath.split( '.' );

		while ( keys.length > 1 ) {
			key = keys.shift();

			// If this branch doesn't exist yet, create a new one - if the next
			// key matches /^\s*[0-9]+\s*$/, assume we want an array branch rather
			// than an object
			if ( !obj[ key ] ) {
				obj[ key ] = ( integerPattern.test( keys[0] ) ? [] : {} );
			}

			obj = obj[ key ];
		}

		obj[ keys[0] ] = value;
	};

	mergeChanges = function ( current, extra ) {
		var i = extra.length, keypath;

		while ( i-- ) {
			keypath = extra[i];

			if ( !current[ '_' + keypath ] ) {
				current[ '_' + keypath ] = true; // we don't want to accidentally overwrite 'length'!
				current[ current.length ] = keypath;
			}
		}
	};

}( statesmanProto ));
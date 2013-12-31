define([
	'Statesman/prototype/shared/flush',
	'Statesman/prototype/shared/normalise',
	'Statesman/prototype/set/set'
], function (
	flush,
	normalise,
	set
) {

	'use strict';

	return function ( keypath, value ) {
		var changes, upstreamChanges, k, normalised, topLevel, allChanges, observersToNotify, deferredComputations, computation;

		if ( !this.changeHash ) {
			this.changes = [];
			this.changeHash = {};

			topLevel = true;
		}

		// setting multiple values in one go
		if ( typeof keypath === 'object' ) {
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

		// If this wasn't a top-level `set()` call, we can bug out here.
		// The next stuff only happens once per cycle
		if ( !topLevel ) {
			return;
		}

		allChanges = [];

		// We need to run this loop inside itself, so that we flush all
		// computations, then notify observers so any resulting changes
		// from `set()` calls within observers) can also be flushed
		// through the system
		while ( this.changes.length ) {
			observersToNotify = [];

			while ( this.changes.length ) {
				changes = this.changes.splice( 0 );
				upstreamChanges = getUpstreamChanges( changes );

				// notify computed values that are dependants of upstream values
				flush.all( this, upstreamChanges, true, true );

				// notify computed values that are direct dependants of these values
				flush.all( this, changes, true, false );

				allChanges = allChanges.concat( changes );
				observersToNotify = observersToNotify.concat( changes );

				while ( this.deferredComputations.length ) {
					deferredComputations = this.deferredComputations.splice( 0 );

					// TODO sort computations so that if `a` depends on `b`, `b`
					// is computed first. otherwise we need to go round again

					while ( computation = deferredComputations.pop() ) {
						computation.deferredUpdate();
					}
				}
			}

			// Notify observers of these changes
			flush.all( this, getUpstreamChanges( observersToNotify ), false, true );
			flush.all( this, observersToNotify, false, false );

		}

		if ( allChanges.length ) {
			this.fire( 'change', this.changeHash );
		}

		this.changes = this.changeHash = null;

		return this;
	};

	function getUpstreamChanges ( changes ) {
		var upstreamChanges = [ '' ], i, keypath, keys, upstreamKeypath;

		i = changes.length;
		while ( i-- ) {
			keypath = changes[i];
			keys = keypath.split( '.' );

			while ( keys.length > 1 ) {
				keys.pop();
				upstreamKeypath = keys.join( '.' );

				if ( !upstreamChanges[ upstreamKeypath ] ) {
					upstreamChanges[ upstreamChanges.length ] = upstreamKeypath;
					upstreamChanges[ upstreamKeypath ] = true;
				}
			}
		}

		return upstreamChanges;
	}

});
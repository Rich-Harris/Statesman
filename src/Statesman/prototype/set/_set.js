define([
	'Statesman/prototype/shared/notifyObservers',
	'Statesman/prototype/shared/normalise',
	'Statesman/prototype/set/set',
	'Statesman/prototype/set/propagateChanges',
	'Statesman/prototype/set/mergeChanges'
], function (
	notifyObservers,
	normalise,
	set,
	propagateChanges,
	mergeChanges
) {

	'use strict';

	return function ( keypath, value, options ) {
		var allChanges, allUpstreamChanges, k, normalised, existingChangeHash;

		this.changes = [];
		this.upstreamChanges = [];

		existingChangeHash = this.changeHash;
		if ( !existingChangeHash ) {
			this.changeHash = existingChangeHash || {};
		}

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
		notifyObservers.multiple( this, allUpstreamChanges, true );

		// ...and dependants of this and downstream keypaths
		if ( allChanges.length ) {
			notifyObservers.multiple( this, allChanges );
		}



		// fire event
		if ( allChanges.length && !existingChangeHash ) {
			this.fire( 'change', this.changeHash );
		}

		this.changeHash = existingChangeHash;

		return this;
	};

});
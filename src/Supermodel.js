
/*global module, define */

(function ( global ) {

	'use strict';

	var Supermodel,

	// Helper functions
	splitKeypath,
	parseArrayNotation,
	standardise,
	isEqual,

	// Cached regexes
	integerPattern = /^[0-9]+$/,
	arrayNotationPattern = /\[([0-9]+)\]/;



	// Constructor
	// -----------
	Supermodel = function ( data ) {
		this._data = data || {};
		this._observers = {};
	};


	// Prototype
	// ---------
	Supermodel.prototype = {
		
		// Set item on our model. Can be deeper than the top layer, e.g.
		// `model.set( 'foo.bar', 'baz' )`.
		//
		// Branches in the model tree will be created as necessary (as
		// arrays if appropriate, e.g.
		//
		//     model.set( 'foo.bar[0]', 'baz' )
		//     => { foo: { bar: [ 'baz' ] } }
		//
		// Observers are notified if the value changes unless `silent = true`.
		// Set `force = true` to notify observers even if no change occurs
		// (will do nothing if `silent === true`).
		//
		// Setting an item will also notify observers of downstream keypaths
		// e.g. an observer of `'foo.bar'` will be notified when `'foo'` changes
		// (provided the `'bar'` property changes as a result) - `silent` and
		// `force` still apply
		set: function ( keypath, value, silent, force ) {
			var k, keys, key, obj, i, branch, previous;

			// Multiple items can be set in one go:
			//
			//     model.set({
			//       one: 1,
			//       two: 2,
			//       three: 3
			//     }, true );	// sets all three items silently
			if ( typeof keypath === 'object' ) {
				silent = value;
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						this.set( k, keypath[k], silent );
					}
				}

				return;
			}
			
			// Store previous value
			previous = this.get( keypath );

			// Split keypath (`'foo.bar.baz[0]'`) into keys (`['foo','bar','baz',0]`)
			keys = splitKeypath( keypath );

			// Standardise keypath (without calling `standardise()`, since
			// half the work is already done)
			keypath = keys.join( '.' );

			obj = this._data;
			while ( keys.length > 1 ) {
				key = keys.shift();

				// Proceed down the tree. If we need to create a new branch, determine
				// if it is a hash or an array
				if ( !obj[ key ] ) {
					
					// If there is a numeric key following this one, create an array
					if ( keys[0] === parseInt( keys[0], 10 ) || integerPattern.test( keys[0] ) ) {
						obj[ key ] = [];
					}

					// Otherwise create a hash
					else {
						obj[ key ] = {};
					}
				}

				// Step down, then lather/rinse/repeat
				obj = obj[ key ];
			}

			key = keys[0];

			// Set the value
			obj[ key ] = value;

			// If `silent === false`, and either `force` is true or the new value
			// is different to the old value, notify observers
			if ( !silent && ( force || !isEqual( previous, value ) ) ) {
				this._notifyObservers( keypath, value, previous, force );
			}

			return this;
		},

		// Get item from our model. Again, can be arbitrarily deep, e.g.
		// `model.get( 'foo.bar.baz[0]' )`
		get: function ( keypath ) {
			var keys, result;

			if ( !keypath ) {
				return undefined;
			}

			keys = splitKeypath( keypath );

			result = this._data;
			while ( keys.length ) {
				try {
					result = result[ keys.shift() ];
				} catch ( err ) {
					return undefined;
				}
				
				if ( result === undefined ) {
					return undefined;
				}
			}

			return result;
		},

		// Register a function to be called when the model changes. Not
		// quite the same as 'subscribe', as upstream changes will cause
		// notifications to fire
		//
		// e.g.
		//
		//     model.observe( 'foo.bar', function ( newValue, oldValue ) {
		//       alert( newValue );
		//     });
		//
		//     model.set( 'foo', { bar: 'baz' } ); // alerts 'baz'
		//
		// Returns an array of observers which must be used with
		// `model.unobserve()`. The length of said array is determined
		// by the depth of the observed keypath, e.g. `'foo'` returns a
		// single observer, `'foo.bar.baz[0]'` returns four - one for
		// the keypath itself, one for the three upstream branches
		observe: function ( keypath, callback, initialize ) {
			
			var self = this,
				originalKeypath,
				returnedObservers = [],
				observe;

			if ( !keypath ) {
				return undefined;
			}

			// Standardise (`'foo[0]'`' => `'foo.0'`) and store keypath (for when we
			// observe upstream keypaths)
			originalKeypath = keypath = standardise( keypath );

			observe = function ( keypath ) {
				var observers, observer;

				observers = self._observers[ keypath ] = ( self._observers[ keypath ] || [] );

				observer = {
					observedKeypath: keypath,
					originalKeypath: originalKeypath,
					callback: callback,
					previousValue: self.get( originalKeypath )
				};

				observers[ observers.length ] = observer;
				returnedObservers[ returnedObservers.length ] = observer;
			};

			while ( keypath.lastIndexOf( '.' ) !== -1 ) {
				observe( keypath );

				// Remove the last item in the keypath so we can observe
				// upstream keypaths
				keypath = keypath.substr( 0, keypath.lastIndexOf( '.' ) );
			}

			observe( keypath );

			if ( initialize ) {
				callback( this.get( keypath ) );
			}

			return returnedObservers;
		},

		observeOnce: function ( keypath, callback ) {
			var self = this, suicidalObservers;

			suicidalObservers = this.observe( keypath, function ( value, previousValue ) {
				callback( value, previousValue );
				self.unobserve( suicidalObservers );
			});

			return this;
		},

		// Cancel observer(s)
		unobserve: function ( observerToCancel ) {
			var observers, index, keypath;

			// Allow a single observer, or an array
			if ( observerToCancel.hasOwnProperty( 'length' ) ) {
				while ( observerToCancel.length ) {
					this.unobserve( observerToCancel.shift() );
				}
				return;
			}

			keypath = standardise( observerToCancel.observedKeypath );

			observers = this._observers[ keypath ];
			if ( !observers ) {
				// Nothing to unobserve
				return;
			}

			index = observers.indexOf( observerToCancel );

			if ( index === -1 ) {
				// Nothing to unobserve
				return;
			}

			// Remove the observer from the list...
			observers.splice( index, 1 );

			// ...then tidy up if necessary
			if ( observers.length === 0 ) {
				delete this._observers[ keypath ];
			}

			return this;
		},

		// Internal publish method
		_notifyObservers: function ( keypath, value, previousValue, force ) {
			var self = this, observers = this._observers[ keypath ] || [], i, observer;

			for ( i=0; i<observers.length; i+=1 ) {
				observer = observers[i];

				if ( keypath !== observer.originalKeypath ) {
					previousValue = observer.previousValue;
					value = self.get( observer.originalKeypath );

					// If this value hasn't changed, skip the callback, unless `force === true`
					if ( !force && isEqual( value, previousValue ) ) {
						continue;
					}

					observer.previousValue = value;
				}
				observer.callback( value, previousValue );
			}
		}
	};


	// Helper functions
	// ----------------

	// turn `'foo.bar.baz'` into `['foo','bar','baz']`
	splitKeypath = function ( keypath ) {
		var firstPass, secondPass = [], numKeys, key, i, startIndex, pattern, match;

		// Start by splitting on periods
		firstPass = keypath.split( '.' );

		// Then see if any keys use array notation instead of dot notation
		for ( i=0; i<firstPass.length; i+=1 ) {
			secondPass = secondPass.concat( parseArrayNotation( firstPass[i] ) );
		}

		return secondPass;
	};

	// Split key with array notation (`'baz[0]'`) into identifier
	// and array pointer(s) (`['baz',0]`)
	parseArrayNotation = function ( key ) {
		var index, arrayPointers, match, result;

		index = key.indexOf( '[' );

		if ( index === -1 ) {
			return key;
		}

		result = [ key.substr( 0, index ) ];
		arrayPointers = key.substring( index );

		while ( arrayPointers.length ) {
			match = arrayNotationPattern.exec( arrayPointers );

			if ( !match ) {
				return result;
			}

			result[ result.length ] = +match[1];
			arrayPointers = arrayPointers.substring( match[0].length );
		}

		return result;
	};

	// turn `'foo.bar.baz[0]'` into `'foo.bar.baz.0'`
	standardise = function ( keypath ) {
		return splitKeypath( keypath ).join( '.' );
	};

	isEqual = function ( a, b ) {
		
		// workaround for null...
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

	

	// CommonJS - add to exports
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Supermodel;
	}

	// AMD - define module
	else if ( typeof define === 'function' && define.amd ) {
		define( function () {
			return Supermodel;
		});
	}

	// Browsers - create global variable
	else {
		global.Supermodel = Supermodel;
	}
	

}( this ));
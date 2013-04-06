/**
* statesman - State management made straightforward
*
* v0.1.4 - 2013-04-06
*
* https://github.com/Rich-Harris/Statesman.git
*
* Copyright (c) 2013 Rich Harris
* Licensed MIT
*/
/*global module, define */
/*jslint white: true, nomen: true, plusplus: true */

(function ( global ) {

	'use strict';

	var Statesman, Subset,

	// Helper functions
	dispatchQueue,
	splitKeypath,
	parseArrayNotation,
	standardise,
	isEqual,
	indexOf,

	// Cached regexes
	integerPattern = /^[0-9]+$/,
	arrayNotationPattern = /\[([0-9]+)\]/;



	Statesman = function ( data ) {
		this._data = data || {};
		this._observers = {};
		this._computed = {};
		this._subsets = {};
		this._queue = [];
	};


	Statesman.prototype = {
		
		set: function ( keypath, value, options ) {
			var k, keys, key, obj, previous, computed;

			// allow multiple values to be set in one go
			if ( typeof keypath === 'object' ) {
				
				// we don't want to notify observers straight away, or some observers
				// will be notified multiple times. Instead, we queue the notifications -
				// later, they will be de-duped and dispatched.
				this._queueing = true;

				options = value;
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						this.set( k, keypath[k], options );
					}
				}

				this._dispatchQueue();
				this._queueing = false;

				return this;
			}

			// okay, now we're definitely dealing with a single value

			options = options || {};

			// determine whether we're dealing with a computed value
			computed = this._computed[ keypath ];
			if ( computed ) {
				
				// determine whether `model.set` was called 'manually', or by
				// the computed value's observer
				if ( !this._computing ) {
					
					// `model.set()` was called manually - if the value is readonly,
					// throw an error
					if ( computed.readonly ) {
						throw 'The computed value "' + keypath + '" has readonly set true and cannot be changed manually';
					}

					// flag the value as overridden so that `model.get` returns the
					// correct value...
					computed.override = true;
				} else {

					// ...until the next time the value is computed
					computed.override = false;
					this._computing = false;
				}
			}

			// store previous value
			this._referToCache = true;
			previous = this.get( keypath );
			this._referToCache = false;

			// split keypath (`'foo.bar.baz[0]'`) into keys (`['foo','bar','baz',0]`)
			keys = splitKeypath( keypath );

			// standardise keypath (without calling `standardise()`, since
			// half the work is already done)
			keypath = keys.join( '.' );

			obj = this._data;
			while ( keys.length > 1 ) {
				key = keys.shift();

				// proceed down the tree. If we need to create a new branch, determine
				// if it is a hash or an array
				if ( !obj[ key ] ) {
					
					// if there is a numeric key following this one, create an array
					if ( keys[0] === parseInt( keys[0], 10 ) || integerPattern.test( keys[0] ) ) {
						obj[ key ] = [];
					}

					// otherwise create a hash
					else {
						obj[ key ] = {};
					}
				}

				// step down, then lather/rinse/repeat
				obj = obj[ key ];
			}

			key = keys[0];

			// set the value
			obj[ key ] = value;

			// If `silent` is set to `false`, and either `force` is true or the new value
			// is different to the old value, notify observers
			if ( !options.silent && ( options.force || !isEqual( previous, value ) ) ) {
				this._notifyObservers( keypath, value, options.force );
			}

			return this;
		},

		get: function ( keypath ) {
			var keys, result, computed;

			if ( !keypath ) {
				return this._data;
			}

			// if we have a computed value with this keypath, get it, unless we specifically
			// want the cached value
			if ( !this._referToCache ) {
				computed = this._computed[ keypath ];
				if ( computed && !computed.cache && !computed.override ) {
					computed.setter(); // call setter, update data silently
				}
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

		observe: function ( keypath, callback, initialize ) {
			
			var self = this,
				originalKeypath,
				observerGroup = [],
				observe,
				k;

			// overload - allow observe to be called with no keypath (i.e. observe root)
			if ( typeof keypath === 'function' ) {
				initialize = callback;
				callback = keypath;

				keypath = '';
			}

			// overload - set multiple observers at once
			if ( typeof keypath === 'object' ) {
				
				initialize = callback;
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						observerGroup[ observerGroup.length ] = this.observe( k, keypath[k], initialize );
					}
				}

				return observerGroup;
			}

			// check arguments are valid
			if ( ( typeof keypath !== 'string' ) || typeof callback !== 'function' || ( initialize !== undefined && typeof initialize !== 'boolean' ) ) {
				throw 'Invalid arguments to observe()';
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
					group: observerGroup
				};

				observers[ observers.length ] = observer;
				observerGroup[ observerGroup.length ] = observer;
			};

			while ( keypath.lastIndexOf( '.' ) !== -1 ) {
				observe( keypath );

				// Remove the last item in the keypath so we can observe
				// upstream keypaths
				keypath = keypath.substr( 0, keypath.lastIndexOf( '.' ) );
			}

			observe( keypath );

			if ( initialize ) {
				callback.call( this, this.get( originalKeypath ) );
			}

			observerGroup.__previousValue = self.get( originalKeypath );

			return observerGroup;
		},

		
		observeOnce: function ( keypath, callback ) {
			var self = this, suicidalObservers;

			suicidalObservers = this.observe( keypath, function ( value, previousValue ) {
				callback.call( self, value, previousValue );
				self.unobserve( suicidalObservers );
			});

			return suicidalObservers;
		},

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

		compute: function ( keypath, options ) {
			var self = this, i, getter, setter, triggers, fn, context, cache, readonly, value, observerGroups, computed;

			// Allow multiple values to be set in one go
			if ( typeof keypath === 'object' ) {
				
				// We'll just use the `computed` variable, since it was lying
				// around and won't be needed elsewhere
				computed = {};

				// Ditto i
				for ( i in keypath ) {
					if ( keypath.hasOwnProperty( i ) ) {
						computed[ i ] = this.compute( i, keypath[ i ] );
					}
				}

				return computed;
			}

			// If a computed value with this keypath already exists, remove it
			if ( this._computed[ keypath ] ) {
				this.removeComputedValue( keypath );
			}

			fn = options.fn;
			triggers = options.triggers || options.trigger;
			context = options.context || this;
			
			// Ensure triggers is an array
			if ( !triggers ) {
				triggers = [];
			} else if ( typeof triggers === 'string' ) {
				triggers = [ triggers ];
			}

			// Throw an error if `keypath` is in `triggers`
			if ( indexOf( keypath, triggers ) !== -1 ) {
				throw 'A computed value cannot be its own trigger';
			}

			// If there are triggers, default `cache` to `true`. If not, set it to `false`
			if ( triggers.length ) {
				cache = ( options.cache === false ? false : true );
			} else {
				cache = false;
			}

			// Default to readonly
			readonly = ( options.readonly === false ? false : true );


			// Keep a reference to the observers, so we can remove this
			// computed value later if needs be
			observerGroups = [];

			
			// Create getter function. This is a wrapper for `fn`, which passes
			// it the current values of any triggers that have been defined
			getter = function () {
				var i, args = [];

				i = triggers.length;
				while ( i-- ) {
					args[i] = self.get( triggers[i] );
				}

				value = options.fn.apply( context, args );
				return value;
			};

			// Create setter function. This sets the `id` keypath to the value
			// returned from `getter`.
			setter = function () {
				computed.cache = true; // Prevent infinite loops by temporarily caching this value
				self._computing = true;
				self.set( keypath, getter() );
				computed.cache = cache; // Return to normal behaviour
			};

			// Store reference to this computed value
			computed = this._computed[ keypath ] = {
				getter: getter,
				setter: setter,
				cache: cache || false,
				readonly: readonly,
				observerGroups: observerGroups
			};

			// Call our setter, to initialise the value
			setter();

			// watch our triggers
			i = triggers.length;

			// if there are no triggers, `cache` must be false, otherwise
			// the value will never change
			if ( !i && cache ) {
				throw 'Cached computed values must have at least one trigger';
			}

			while ( i-- ) {
				observerGroups[ observerGroups.length ] = this.observe( triggers[i], setter );
			}

			return value;
		},

		removeComputedValue: function ( keypath ) {
			var observerGroups = this._computed[ keypath ].observerGroups;

			while ( observerGroups.length ) {
				this.unobserve( observerGroups.pop() );
			}

			delete this._computed[ keypath ];

			return this;
		},

		subset: function ( path ) {
			if ( !path ) {
				throw 'No subset path specified';
			}

			if ( !this._subsets[ path ] ) {
				this._subsets[ path ] = new Subset( path, this );
			}

			return this._subsets[ path ];
		},

		// Internal publish method
		_notifyObservers: function ( keypath, value, force ) {
			var self = this, observers = this._observers[ keypath ] || [], i, observer, actualValue, previousValue, notifyObserversOf;

			// Notify observers of this keypath, and any downstream keypaths
			for ( i=0; i<observers.length; i+=1 ) {
				observer = observers[i];

				previousValue = observer.group.__previousValue;
				
				if ( keypath !== observer.originalKeypath ) {
					actualValue = self.get( observer.originalKeypath );
				} else {
					actualValue = value;
				}

				observer.group.__previousValue = actualValue;
				
				// If this value hasn't changed, skip the callback, unless `force === true`
				if ( !force && isEqual( actualValue, previousValue ) ) {
					continue;
				}

				// If we are queueing callbacks, add this to the queue, otherwise fire immediately
				if ( this._queueing ) {
					this._addToQueue( observer.callback, actualValue, previousValue );
				} else {
					observer.callback.call( this, actualValue, previousValue );
				}
			}

			notifyObserversOf = function ( keypath ) {
				var observers = self._observers[ keypath ], i;

				if ( !observers ) {
					return;
				}

				i = observers.length;
				while ( i-- ) {
					observer = observers[i];
					if ( observer.observedKeypath === observer.originalKeypath ) {
						value = self.get( keypath );

						// See above - add to the queue, or fire immediately
						if ( self._queueing ) {
							
							// Since we're dealing with an object rather than a primitive (by
							// definition, as this is an upstream observer), there is no
							// distinction between the previous value and the current one -
							// it is the same object, even if its contents have changed. That's
							// why the next line looks a bit weird.
							self._addToQueue( observer.callback, value, value );
						} else {
							observer.callback.call( this, value, value );
						}
					}
				}
			};

			// Notify upstream observers
			while ( keypath.lastIndexOf( '.' ) !== -1 ) {
				keypath = keypath.substr( 0, keypath.lastIndexOf( '.' ) );

				notifyObserversOf( keypath );
			}

			// Notify observers of root
			notifyObserversOf( '' );
		},

		_addToQueue: function ( callback, value, previous ) {
			var i;

			// Remove queued item with this callback, if there is one
			for ( i=0; i<this._queue.length; i+=1 ) {
				if ( this._queue[i].c === callback ) {
					this._queue.splice( i, 1 );
					break;
				}
			}

			// Append a new item
			this._queue[ this._queue.length ] = {
				c: callback,
				v: value,
				p: previous
			};
		},

		_dispatchQueue: function () {
			var item;

			// Call each callback with the current and previous value
			while ( this._queue.length ) {
				item = this._queue.shift();
				item.c.call( this, item.v, item.p );
			}
		}
	};


	// Helper functions
	// ----------------

	// turn `'foo.bar.baz'` into `['foo','bar','baz']`
	splitKeypath = function ( keypath ) {
		var firstPass, secondPass = [], i;

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

	indexOf = function ( needle, haystack ) {
		var i;

		if ( haystack.indexOf ) {
			return haystack.indexOf( needle );
		}

		// IE, you bastard
		for ( i=0; i<haystack.length; i+=1 ) {
			if ( haystack[i] === needle ) {
				return i;
			}
		}

		return -1;
	};


	Subset = function( path, state ) {
		this._path = path;
		this._pathDot = path + '.';
		this._root = state;
	};

	Subset.prototype = {
		set: function ( keypath ) {
			var args, k, map;

			args = Array.prototype.slice.call( arguments );

			if ( typeof keypath === 'object' ) {
				args.unshift( this._path );
			}

			else {
				args[0] = ( this._pathDot + keypath );
			}

			this._root.set.apply( this._root, args );

			return this;
		},

		get: function ( keypath ) {
			if ( !keypath ) {
				return this._root.get( this._path );
			}

			return this._root.get( this._pathDot + keypath );
		},

		observe: function ( keypath ) {
			var args, k, map;

			args = Array.prototype.slice.call( arguments );

			// overload - omit keypath to observe root
			if ( typeof keypath === 'function' ) {
				args.unshift( this._path );
				return this._root.observe.apply( this._root, args );
			}

			if ( keypath === '' ) {
				args[0] = this._path;
				return this._root.observe.apply( this._root, args );
			}

			// overload - observe multiple keypaths
			if ( typeof keypath === 'object' ) {
				map = {};
				for ( k in keypath ) {
					map[ this._pathDot + k ] = keypath[ k ];
				}

				args[0] = map;
			}

			else {
				args[0] = ( this._pathDot + keypath );
			}

			return this._root.observe.apply( this._root, args );
		},

		observeOnce: function ( keypath, callback ) {
			return this._root.observeOnce( this._pathDot + keypath, callback );
		},

		unobserve: function ( observerToCancel ) {
			this._root.unobserve( observerToCancel );

			return this;
		},

		compute: function ( keypath, options ) {
			var self = this, k, map, processOptions, context, path;

			path = this._pathDot;

			processOptions = function ( options ) {
				var triggers, i;

				triggers = options.triggers || options.trigger;

				if ( typeof triggers === 'string' ) {
					triggers = [ triggers ];
				}

				if ( triggers ) {
					delete options.triggers;
					delete options.trigger;
				}

				i = triggers.length;
				while ( i-- ) {
					triggers[i] = path + triggers[i];
				}

				options.triggers = triggers;

				if ( !options.context ) {
					options.context = self;
				}
				return options;
			};

			if ( typeof keypath === 'object' ) {
				map = {};
				for ( k in keypath ) {
					map[ this._pathDot + k ] = processOptions( keypath[ k ] );
				}

				return this._root.compute( map );
			}

			return this._root.compute( this._pathDot + keypath, processOptions( options ) );
		},

		removeComputedValue: function ( keypath ) {
			this._root.removeComputedValue( this._pathDot + keypath );
			return this;
		},

		subset: function ( keypath ) {
			return this._root.subset( this._pathDot + keypath );
		}
	};

	

	// CommonJS - add to exports
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Statesman;
	}

	// AMD - define module
	else if ( typeof define === 'function' && define.amd ) {
		define( function () {
			return Statesman;
		});
	}

	// Browsers - create global variable
	else {
		global.Statesman = Statesman;
	}
	

}( this ));
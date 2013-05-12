/*! Statesman - v0.1.6 - 2013-05-09
* State management made straightforward

* 
* Copyright (c) 2013 Rich Harris; Licensed MIT */

/*jslint eqeq: true, plusplus: true */
/*global document, HTMLElement */


(function ( global ) {

'use strict';

var _internal = (function () {

	'use strict';

	return {

	};

}());
(function ( _internal ) {

	'use strict';

	_internal.on = function ( eventName, callback ) {
		var self = this, listeners, n, list;

		if ( typeof eventName === 'object' ) {
			list = [];
			for ( n in eventName ) {
				if ( eventName.hasOwnProperty( n ) ) {
					list[ list.length ] = this.on( n, eventName[n] );
				}
			}

			return {
				cancel: function () {
					while ( list.length ) {
						list.pop().cancel();
					}
				}
			};
		}

		if ( !this.subs[ eventName ] ) {
			this.subs[ eventName ] = [];
		}

		listeners = this.subs[ eventName ];
		listeners[ listeners.length ] = callback;

		return {
			cancel: function () {
				self.off( eventName, callback );
			}
		};
	};

	_internal.once = function ( eventName, callback ) {
		var self = this, listeners, n, list, suicidalCallback;

		if ( typeof eventName === 'object' ) {
			list = [];
			for ( n in eventName ) {
				if ( eventName.hasOwnProperty( n ) ) {
					list[ list.length ] = this.once( n, eventName[n] );
				}
			}

			return {
				cancel: function () {
					while ( list.length ) {
						list.pop().cancel();
					}
				}
			};
		}

		if ( !this.subs[ eventName ] ) {
			this.subs[ eventName ] = [];
		}

		listeners = this.subs[ eventName ];

		suicidalCallback = function () {
			callback.apply( self, arguments );
			self.off( eventName, suicidalCallback );
		};

		listeners[ listeners.length ] = suicidalCallback;

		return {
			cancel: function () {
				self.off( eventName, suicidalCallback );
			}
		};
	};

	_internal.off = function ( eventName, callback ) {
		var subscribers, index;

		if ( !eventName ) {
			this.subs = {};
			return this;
		}

		if ( !callback ) {
			delete this.subs[ eventName ];
			return this;
		}

		subscribers = this.subs[ eventName ];
		if ( subscribers ) {
			index = subscribers.indexOf( callback );

			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}

			if ( !subscribers.length ) {
				delete this.subs[ eventName ];
			}
		}

		return this;
	};

	_internal.fire = function ( eventName ) {
		var subscribers, args, len, i;

		subscribers = this.subs[ eventName ];

		if ( !subscribers ) {
			return this;
		}

		len = subscribers.length;
		args = Array.prototype.slice.call( arguments, 1 );

		for ( i=0; i<len; i+=1 ) {
			subscribers[i].apply( this, args );
		}
	};

}( _internal ));
var Statesman;

(function ( _internal ) {

	'use strict';

	var Subset,

	// Helper functions
	normalisedKeypathCache,
	normalise,
	splitKeypath,
	isEqual,
	varPattern,
	compile,

	// Cached regexes
	integerPattern = /^\s*[0-9]+\s*$/;



	Statesman = function ( data ) {
		this._data = data || {};
		this._observers = {};
		this._computed = {};
		this._subsets = {};
		this._queue = [];

		// events
		this.subs = {};

		this._cache = {};
		this._cacheMap = {};
	};


	Statesman.prototype = {
		
		reset: function ( data, options ) {
			this._data = {};
			this.fire( 'reset' );

			this.set( data, { silent: true });

			this._notifyAllObservers( options ? options.force : false );

			return this;
		},

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
			this.fire( 'set', keypath, value, options );
			this.fire( 'set:' + keypath, value, options );

			keypath = normalise( keypath );

			computed = this._computed[ keypath ];

			previous = this._referToCache ? this._cache[ keypath ] : this.get( keypath );

			options = options || {};

			// if the value hasn't changed, we can save ourselves a bunch of work
			if ( previous === value ) {
				// if it's an object, or force === true, we still need to notify observers
				// (unless silent is also true, in which case we ignore force)
				if ( !isEqual( previous, value ) || ( options.force && !options.silent ) ) {
					this._notifyObservers( keypath, options.force );
				}

				return;
			}

			// determine whether we're dealing with a computed value
			if ( computed = this._computed[ keypath ] ) {
				
				// determine whether `model.set` was called 'manually', or by
				// the computed value's observer
				if ( this._computing ) {
					// `model.set()` was called by the computed's setter

					// if the override flag was previously set, we can unset it now
					computed.override = false;
				}

				else {
					// `model.set()` was called manually...
					if ( computed.readonly ) {
						// ...but it's a readonly value
						throw 'The computed value "' + keypath + '" has readonly set true and cannot be changed manually';
					}

					else {
						// ...and it's not readonly, so we flag it as overridden so we can `get()` the
						// overridden value later
						computed.override = true;
					}
				}
			}

			// Clear the cache, so the next time we `get()` this value, it will be up to date
			this._clearCache( keypath );

			// Split normalised keypath (`'foo.bar.baz.0'`) into keys (`['foo','bar','baz',0]`)
			keys = keypath.split( '.' );

			obj = this._data;
			while ( keys.length > 1 ) {
				key = keys.shift();

				// proceed down the tree. If we need to create a new branch, determine
				// if it is a hash or an array
				if ( !obj[ key ] ) {
					
					// if there is a numeric key following this one, create an array, otherwise create a hash
					if ( !obj[ key ] ) {
						obj[ key ] = ( integerPattern.test( keys[0] ) ? [] : {} );
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
			if ( !options.silent ) {
				this._notifyObservers( keypath, options.force );
			}

			return this;
		},

		get: function ( keypath ) {
			var keys, lastKey, parentKeypath, parentValue, normalised, result, computed, value;

			if ( !keypath ) {
				return this._data;
			}

			normalised = normalise( keypath );

			// TODO update all downstream computed values, not just direct hits

			// if this is a non-cached computed value, compute it, unless we
			// specifically want the cached value
			if ( computed = this._computed[ normalised ] ) {
				if ( !this._referToCache && !computed.cache && !computed.override ) {
					this._cache[ normalised ] = computed.getter();
				}
			}

			// cache hit?
			if ( this._cache.hasOwnProperty( normalised ) ) {
				return this._cache[ normalised ];
			}

			keys = normalised.split( '.' );
			lastKey = keys.pop();

			parentKeypath = keys.join( '.' );
			parentValue = this.get( parentKeypath );

			if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
				value = parentValue[ lastKey ];
				this._cache[ normalised ] = value;

				if ( !this._cacheMap[ parentKeypath ] ) {
					this._cacheMap[ parentKeypath ] = [];
				}
				this._cacheMap[ parentKeypath ].push( normalised );
			} else {
				value = undefined;
			}

			return value;
		},

		observe: function ( keypath, callback, options ) {
			
			var self = this,
				originalKeypath,
				observerGroup = [],
				observe,
				k,
				init,
				context;

			// overload - allow observe to be called with no keypath (i.e. observe root)
			if ( typeof keypath === 'function' ) {
				options = callback;
				callback = keypath;

				keypath = '';
			}

			// overload - set multiple observers at once
			if ( typeof keypath === 'object' ) {
				
				options = callback;
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						observerGroup[ observerGroup.length ] = this.observe( k, keypath[k], options );
					}
				}

				return observerGroup;
			}

			if ( !options ) {
				options = {};
			}

			// check arguments are valid
			if ( ( typeof keypath !== 'string' ) || ( typeof callback !== 'function' ) || ( typeof options !== 'object' ) ) {
				throw 'Invalid arguments to observe()';
			}

			// Standardise (`'foo[0]'`' => `'foo.0'`) and store keypath (for when we
			// observe upstream keypaths)
			originalKeypath = keypath = normalise( keypath );

			observe = function ( keypath ) {
				var observers, observer;

				if ( !self._observers[ keypath ] ) {
					self._observers[ keypath ] = [];
				}

				observers = self._observers[ keypath ];

				observer = {
					observedKeypath: keypath,
					originalKeypath: originalKeypath,
					callback: callback,
					group: observerGroup,
					context: options.context || self
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

			// By default, initialise by calling the callback immediately
			if ( !options.hasOwnProperty( 'init' ) || options.init ) {
				callback.call( options.context || this, this.get( originalKeypath ) );
			}

			observerGroup.__previousValue = self.get( originalKeypath );

			return observerGroup;
		},

		
		observeOnce: function ( keypath, callback, options ) {
			var self = this, suicidalObservers;

			if ( !options ) {
				options = {};
			}

			options.init = false;

			suicidalObservers = this.observe( keypath, function ( value, previousValue ) {
				callback.call( this, value, previousValue );
				self.unobserve( suicidalObservers );
			}, options );

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

			keypath = normalise( observerToCancel.observedKeypath );

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

		// TODO refactor this!
		compute: function ( keypath, options ) {
			var self = this, i, getter, setter, triggers, fn, context, cache, readonly, value, observerGroups, computed, compiled;

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

			if ( !options ) {
				throw new Error( 'Bad arguments to compute()' );
			}

			keypath = normalise( keypath );

			// If a computed value with this keypath already exists, remove it
			if ( this._computed[ keypath ] ) {
				this.removeComputedValue( keypath );
			}

			// Were we just given a string? Compile it
			if ( typeof options === 'string' ) {
				compiled = Statesman.compile( options, this );

				getter = compiled.getter;
				triggers = compiled.triggers;
			}
			
			// Were we given a string among other options?
			else if ( typeof options.fn === 'string' ) {
				// This could have come from a subset, in which case we need to pass along the keypath prefix
				compiled = Statesman.compile( options.fn, options.context || this, options.prefix );
				
				getter = compiled.getter;
				triggers = compiled.triggers;
			}

			// Were we given a function?
			else {
				fn = options.fn;
				triggers = options.triggers || options.trigger;
				context = options.context || this;

				// Ensure triggers is an array
				if ( !triggers ) {
					triggers = [];
				} else if ( typeof triggers === 'string' ) {
					triggers = [ triggers ];
				}

				// Create getter function. This is a wrapper for `fn`, which passes
				// it the current values of any triggers that have been defined
				getter = function () {
					var i, args = [];

					i = triggers.length;
					while ( i-- ) {
						args[i] = self.get( triggers[i] );
					}

					value = fn.apply( context, args );
					return value;
				};
			}

			// Throw an error if `keypath` is in `triggers`
			if ( triggers.indexOf( keypath ) !== -1 ) {
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

			
			

			// Create setter function. This sets the `id` keypath to the value
			// returned from `getter`.
			setter = function () {
				var value;

				computed.cache = true; // Prevent infinite loops by temporarily caching this value
				self._computing = true;
				value = getter();
				self.set( keypath, value );
				self._computing = false;
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
				throw new Error( 'Cached computed values must have at least one trigger' );
			}

			while ( i-- ) {
				observerGroups[ observerGroups.length ] = this.observe( triggers[i], setter, {
					init: false, // we don't want to execute the setter for each trigger
					context: context
				});
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


		// Events
		on: _internal.on,
		off: _internal.off,
		once: _internal.once,
		fire: _internal.fire,

		// Internal methods
		_clearCache: function ( keypath ) {
			var children = this._cacheMap[ keypath ];

			delete this._cache[ keypath ];

			if ( !children ) {
				return;
			}

			while ( children.length ) {
				this._clearCache( children.pop() );
			}
		},

		_notifyObservers: function ( keypath, force ) {
			var self = this,
				observers = this._observers[ keypath ] || [],
				i,
				observer,
				newValue,
				previousValue,
				notifyObserversOf;

			// Notify observers of this keypath, and any downstream keypaths
			for ( i=0; i<observers.length; i+=1 ) {
				observer = observers[i];

				previousValue = observer.group.__previousValue;
				
				newValue = self.get( observer.originalKeypath );

				observer.group.__previousValue = newValue;
				
				// If this value hasn't changed, skip the callback, unless `force === true`
				if ( !force && isEqual( newValue, previousValue ) ) {
					continue;
				}

				// If we are queueing callbacks, add this to the queue, otherwise fire immediately
				if ( this._queueing ) {
					this._addToQueue( observer.callback, newValue, previousValue, observer.context || this );
				} else {
					observer.callback.call( observer.context || this, newValue, previousValue );
				}
			}

			notifyObserversOf = function ( keypath ) {
				var value, observers = self._observers[ keypath ], i;

				if ( !observers ) {
					return;
				}

				i = observers.length;
				while ( i-- ) {
					observer = observers[i];
					// We only want to notify direct observers of the upstream
					// keypath
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
							observer.callback.call( observer.context || this, value, value );
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

		_notifyAllObservers: function ( force ) {
			var keypath, observers, observer, i, numObservers, previousValue, value;

			for ( keypath in this._observers ) {
				if ( this._observers.hasOwnProperty( keypath ) ) {
					observers = this._observers[ keypath ];
					numObservers = observers.length;

					for ( i=0; i<numObservers; i+=1 ) {
						observer = observers[i];

						previousValue = observer.group.__previousValue;
						value = this.get( observer.originalKeypath );

						if ( force || !isEqual( value, previousValue ) ) {
							observer.callback.call( observer.context || this, value, previousValue );
						}
						
						observer.group.__previousValue = value;
					}
				}
			}
		},

		_addToQueue: function ( callback, value, previous, context ) {
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
				p: previous,
				cx: context
			};
		},

		_dispatchQueue: function () {
			var item;

			// Call each callback with the current and previous value
			while ( this._queue.length ) {
				item = this._queue.shift();
				item.c.call( item.cx, item.v, item.p );
			}
		}
	};


	// Helper functions
	// ----------------
	normalisedKeypathCache = {};

	normalise = function ( keypath ) {
		return normalisedKeypathCache[ keypath ] || ( normalisedKeypathCache[ keypath ] = keypath.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ) );
	};

	splitKeypath = function ( keypath ) {
		return normalise( keypath ).split( '.' );
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

	varPattern = /\$\{\s*([a-zA-Z0-9_$\[\]\.]+)\s*\}/g;

	Statesman.compile = function ( str, context, prefix ) {
		var compiled, triggers, expanded, fn, getter;

		prefix = prefix || '';
		triggers = [];

		expanded = str.replace( varPattern, function ( match, keypath ) {
			// make a note of which triggers are referenced, but de-dupe first
			if ( triggers.indexOf( keypath ) === -1 ) {
				triggers[ triggers.length ] = prefix + keypath;
			}

			return 'm.get("' + keypath + '")';
		});

		fn = new Function( 'utils', 'var m = this; return ' + expanded );

		if ( fn.bind ) {
			getter = fn.bind( context, Statesman.utils );
		} else {
			getter = function () {
				return fn.call( context, Statesman.utils );
			};
		}

		return {
			getter: getter,
			triggers: triggers
		};
	};

	Statesman.utils = {
		total: function ( arr ) {
			return arr.reduce( function ( prev, curr ) {
				return prev + curr;
			});
		}
	};

	return Statesman;

}( _internal ));
(function ( Statesman, _internal ) {

	'use strict';

	var Subset;

	Statesman.prototype.subset = function ( path ) {
		if ( !path ) {
			throw 'No subset path specified';
		}

		if ( !this._subsets[ path ] ) {
			this._subsets[ path ] = new Subset( path, this );
		}

		return this._subsets[ path ];
	};


	Subset = function( path, state ) {
		var self = this, keypathPattern, pathDotLength;

		this._path = path;
		this._pathDot = path + '.';
		this._root = state;

		// events stuff
		this.subs = {};
		keypathPattern = new RegExp( '^' + this._pathDot.replace( '.', '\\.' ) );
		pathDotLength = this._pathDot.length;

		this._root.on( 'set', function ( keypath, value, options ) {
			var localKeypath;

			if ( keypath === this._path ) {
				self.fire( 'reset' );
				return;
			}

			if ( keypathPattern.test( keypath ) ) {
				localKeypath = keypath.substring( pathDotLength );
				self.fire( 'set', localKeypath, value, options );
				self.fire( 'set:' + localKeypath, value, options );
			}
		});
	};

	Subset.prototype = {
		reset: function ( data ) {
			this._root.set( this._path, data );
			return this;
		},

		set: function ( keypath, value, options ) {
			var k, map;

			if ( typeof keypath === 'object' ) {
				options = value;
				map = {};

				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						map[ this._pathDot + k ] = keypath[ k ];
					}
				}
				
				this._root.set( map, options );
				return this;
			}

			this._root.set( this._pathDot + keypath, value, options );
			return this;
		},

		get: function ( keypath ) {
			if ( !keypath ) {
				return this._root.get( this._path );
			}

			return this._root.get( this._pathDot + keypath );
		},

		observe: function ( keypath, callback, options ) {
			var args, k, map;

			args = Array.prototype.slice.call( arguments );

			// overload - observe multiple keypaths
			if ( typeof keypath === 'object' ) {
				options = callback;

				map = {};
				for ( k in keypath ) {
					map[ this._pathDot + k ] = keypath[ k ];
				}

				if ( options ) {
					options.context = options.context || this;
				} else {
					options = { context: this };
				}

				return this._root.observe( map, options );
			}

			// overload - omit keypath to observe root
			if ( typeof keypath === 'function' ) {
				options = callback;
				callback = keypath;
				keypath = this._path;
			}

			else if ( keypath === '' ) {
				keypath = this._path;
			}

			else {
				keypath = ( this._pathDot + keypath );
			}

			if ( options ) {
				options.context = options.context || this;
			} else {
				options = { context: this };
			}

			return this._root.observe( keypath, callback, options );
		},

		observeOnce: function ( keypath, callback, options ) {
			if ( options ) {
				options.context = options.context || this;
			} else {
				options = { context: this };
			}

			var observers = this._root.observeOnce( this._pathDot + keypath, callback, options );
			return observers;
		},

		unobserve: function ( observerToCancel ) {
			this._root.unobserve( observerToCancel );

			return this;
		},

		compute: function ( keypath, options ) {
			var self = this, k, map, processOptions, context, path;

			path = this._pathDot;

			options.context = options.context || this;

			processOptions = function ( options ) {
				var triggers, i, compiled;

				if ( typeof options === 'string' ) {
					return {
						fn: options,
						context: self,
						prefix: path
					};
				}

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

			// Multiple computed values
			if ( typeof keypath === 'object' ) {
				map = {};
				for ( k in keypath ) {
					map[ this._pathDot + k ] = processOptions( keypath[ k ] );
				}

				return this._root.compute( map );
			}

			// Single computed value
			return this._root.compute( this._pathDot + keypath, processOptions( options ) );
		},

		removeComputedValue: function ( keypath ) {
			this._root.removeComputedValue( this._pathDot + keypath );
			return this;
		},

		subset: function ( keypath ) {
			return this._root.subset( this._pathDot + keypath );
		},

		on: _internal.on,
		off: _internal.off,
		once: _internal.once,
		fire: _internal.fire
	};

}( Statesman, _internal ));

// export
if ( typeof module !== "undefined" && module.exports ) module.exports = Statesman // Common JS
else if ( typeof define === "function" && define.amd ) define( function () { return Statesman } ) // AMD
else { global.Statesman = Statesman }

}( this ));
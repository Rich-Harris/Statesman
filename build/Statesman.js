/*! Statesman - v0.2.0 - 2013-07-04
* The JavaScript state management library

* 
* Copyright (c) 2013 Rich Harris; MIT Licensed */
/*jslint eqeq: true, plusplus: true */


;(function ( global ) {

'use strict';

var Statesman,
	Subset,

	statesmanProto = {},
	subsetProto = {},

	events,

	// static methods and properties,
	compile,
	utils,

	// helper functions
	isEqual,
	isNumeric,
	normalise,
	augment,

	set,
	get,
	
	clearCache,
	notifyObservers,
	notifyMultipleObservers,
	propagateChanges,
	propagateChange,
	registerDependant,
	unregisterDependant,

	defineProperty,
	defineProperties,

	// internal caches
	normalisedKeypathCache = {};



// we're creating a defineProperty function here - we don't want to add
// this to _legacy.js since it's not a polyfill. It won't allow us to set
// non-enumerable properties. That shouldn't be a problem, unless you're
// using for...in on a (modified) array, in which case you deserve what's
// coming anyway
try {
	Object.defineProperty({}, 'test', { value: 0 });
	Object.defineProperties({}, { test: { value: 0 } });

	defineProperty = Object.defineProperty;
	defineProperties = Object.defineProperties;
} catch ( err ) {
	// Object.defineProperty doesn't exist, or we're in IE8 where you can
	// only use it with DOM objects (what the fuck were you smoking, MSFT?)
	defineProperty = function ( obj, prop, desc ) {
		obj[ prop ] = desc.value;
	};

	defineProperties = function ( obj, props ) {
		var prop;

		for ( prop in props ) {
			if ( props.hasOwnProperty( prop ) ) {
				defineProperty( obj, prop, props[ prop ] );
			}
		}
	};
}
(function () {

	var varPattern = /\$\{\s*([a-zA-Z0-9_$\[\]\.]+)\s*\}/g;

	compile = function ( str, context, prefix ) {
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

		fn = new Function( 'utils', 'var m=this;try{return ' + expanded + '}catch(e){return undefined}' );

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

}());
Statesman = function ( data ) {
	defineProperties( this, {
		data: { value: data || {}, writable: true },

		// Events
		subs: { value: {}, writable: true },
		
		// Internal value cache
		cache: { value: {} },
		cacheMap: { value: {} },

		// Observers
		deps: { value: {} },
		depsMap: { value: {} },

		// Computed value references
		refs: { value: {} },
		refsMap: { value: {} },

		// Computed values
		computed: { value: {} },

		// Subsets
		subsets: { value: {} },
		
		// Deferred updates (i.e. computed values with more than one reference)
		deferred: { value: [] },

		// Place to store model changes prior to notifying consumers
		changes: { value: null, writable: true },
		upstreamChanges: { value: null, writable: true },
		changeHash: { value: null, writable: true }
	});
};
statesmanProto.add = function ( keypath, d ) {
	var value = this.get( keypath );

	if ( d === undefined ) {
		d = 1;
	}

	if ( isNumeric( value ) && isNumeric( d ) ) {
		this.set( keypath, +value + ( d === undefined ? 1 : +d ) );
	}
};
(function ( statesmanProto ) {

	var Computed, Reference, validate, emptyArray;

	statesmanProto.compute = function ( keypath, signature ) {
		var result, k, computed;

		if ( typeof keypath === 'object' ) {
			result = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					computed = new Computed( this, k, keypath[k] );
					result[k] = computed.value;
				}
			}

			return result;
		}

		computed = new Computed( this, keypath, signature );
		return computed.value;
	};

	Computed = function ( statesman, keypath, signature ) {
		
		var i;

		// teardown any existing computed values on this keypath
		if ( statesman.computed[ keypath ] ) {
			statesman.computed[ keypath ].teardown();
		}

		this.statesman = statesman;
		this.keypath = keypath;

		statesman.computed[ keypath ] = this;

		// if we were given a string, we need to compile it
		if ( typeof signature === 'string' ) {
			signature = compile( signature, statesman );
		}

		else {
			// if we were given a function (handy, as it provides a closure), call it
			if ( typeof signature === 'function' ) {
				signature = signature();
			}

			validate( keypath, signature, statesman.debug );
		}
		

		this.signature = signature;
		this.cache = signature.cache;

		this.refs = [];

		i = signature.dependsOn.length;
		
		// if this is a cacheable computed, we update proactively
		if ( this.cache ) {
			
			// if we only have one dependency, we can update whenever it changes
			if ( i === 1 ) {
				this.selfUpdating = true;
			}

			while ( i-- ) {
				this.refs[i] = new Reference( this, signature.dependsOn[i] );
			}
		}

		this.setting = true;
		statesman.set( this.keypath, ( this.value = this.getter() ) );
		this.setting = false;
	};

	Computed.prototype = {
		bubble: function () {
			if ( this.selfUpdating ) {
				this.update();
			}

			else if ( !this.deferred ) {
				this.statesman.deferred.push( this );
				this.deferred = true;
			}
		},

		update: function () {
			var value;

			value = this.getter();

			if ( !isEqual( value, this.value ) ) {
				this.setting = true;
				set( this.statesman, this.keypath, value );
				this.setting = false;
				
				this.value = value;
			}

			return this;
		},

		getter: function () {
			var i, args, value;

			try {
				if ( this.signature.compiled ) {
					value = this.signature.compiled();
				}

				else {
					args = [];

					if ( this.cache ) {
						i = this.refs.length;
						
						while ( i-- ) {
							args[i] = this.refs[i].value;
						}

						value = this.signature.get.apply( this.context, args );
					}
					
					else {
						i = this.signature.dependsOn.length;
						
						while ( i-- ) {
							args[i] = this.statesman.get( this.signature.dependsOn[i] );
						}

						value = this.signature.get.apply( this.context, args );
					}
				}
			}

			catch ( err ) {
				if ( this.statesman.debug ) {
					throw err;
				}

				value = undefined;
			}

			this.override = false;
			return value;
		},

		setter: function ( value ) {
			if ( this.signature.set ) {
				try {
					this.signature.set.call( this.context, value );
				} catch ( err ) {
					if ( this.statesman.debug ) {
						throw err;
					}
				}
			}

			else if ( this.signature.readonly ) {
				if ( this.statesman.debug ) {
					throw new Error( 'You cannot overwrite a computed value ("' + this.keypath + '"), unless its readonly flag is set true' );
				}
			}

			else {
				this.override = true;
				this.setting = true;
				this.statesman.set( this.keypath, value );
				this.setting = false;
			}
		},

		teardown: function () {
			while ( this.refs.length ) {
				this.refs.pop().teardown();
				this.statesman.computed[ this.keypath ] = null;
			}
		}
	};

	Reference = function ( computed, keypath ) {
		this.computed = computed;
		this.statesman = computed.statesman;
		this.keypath = keypath;

		this.value = this.statesman.get( keypath );

		registerDependant( this, true );
	};

	Reference.prototype = {
		update: function () {
			var value;

			value = this.statesman.get( this.keypath );

			if ( !isEqual( value, this.value ) ) {
				this.value = value;
				this.computed.bubble();
			}
		},

		teardown: function () {
			unregisterDependant( this, true );
		}
	};


	emptyArray = []; // no need to create this more than once!

	validate = function ( keypath, signature, debug ) {

		if ( !signature.compiled ) {
			if ( !signature.get && !signature.set ) {
				throw new Error( 'Computed values must have either a get() or a set() method, or both' );
			}

			if ( !signature.set && ( signature.readonly !== false ) ) {
				signature.readonly = true;
			}

			if ( !signature.dependsOn ) {
				signature.dependsOn = emptyArray;
			} else if ( typeof signature.dependsOn === 'string' ) {
				signature.dependsOn = [ signature.dependsOn ];
			}

			if ( !signature.dependsOn.length ) {
				if ( signature.cache && debug ) {
					throw new Error( 'Computed values with no dependencies must be uncached' );
				}

				signature.cache = false;
			}

			if ( signature.cache !== false ) {
				signature.cache = true;
			}
		}
		
		if ( signature.dependsOn.indexOf( keypath ) !== -1 ) {
			throw new Error( 'A computed value ("' + keypath + '") cannot depend on itself' );
		}

		return signature;

	};

}( statesmanProto ));
statesmanProto.get = function ( keypath ) {
	return get( this, keypath && normalise( keypath ) );
};

var get = function ( statesman, keypath, keys, forceCache ) {
	var computed, lastKey, parentKeypath, parentValue, value;

	if ( !keypath ) {
		return statesman.data;
	}

	// if this is a non-cached computed value, compute it, unless we
	// specifically want the cached value
	if ( computed = statesman.computed[ keypath ] ) {
		if ( !forceCache && !computed.cache && !computed.override ) {
			statesman.cache[ keypath ] = computed.getter();
		}
	}

	// cache hit?
	if ( statesman.cache.hasOwnProperty( keypath ) ) {
		return statesman.cache[ keypath ];
	}

	keys = keys || keypath.split( '.' );
	lastKey = keys.pop();

	parentKeypath = keys.join( '.' );
	parentValue = get( statesman, parentKeypath, keys );

	if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
		value = parentValue[ lastKey ];
		statesman.cache[ keypath ] = value;

		if ( !statesman.cacheMap[ parentKeypath ] ) {
			statesman.cacheMap[ parentKeypath ] = [];
		}
		statesman.cacheMap[ parentKeypath ].push( keypath );
	}

	return value;
};
(function ( statesmanProto ) {

	var Observer;

	statesmanProto.observe = function ( keypath, callback, options ) {
		
		var observer, observers, k, i, init;

		// by default, initialise observers
		init = ( !options || options.init !== false );

		// overload - allow observe to be called with no keypath (i.e. observe root)
		if ( typeof keypath === 'function' ) {
			options = callback;
			callback = keypath;

			keypath = '';
		}

		if ( typeof keypath === 'string' ) {
			observer = new Observer( this, keypath, callback, options );

			if ( init ) {
				observer.update();
			} else {
				observer.value = this.get( keypath );
			}

			return {
				cancel: function () {
					observer.teardown();
				}
			};
		}

		if ( typeof keypath !== 'object' ) {
			throw new Error( 'Bad arguments to Statesman.prototype.observe()' );
		}

		options = callback;

		observers = [];
		for ( k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				observers[ observers.length ] = new Observer( this, k, keypath[k], options );
			}
		}

		i = observers.length;
		if ( init ) {
			while ( i-- ) {
				observers[i].update();
			}
		} else {
			while ( i-- ) {
				observers[i].value = this.get( observer.keypath );
			}
		}

		return {
			cancel: function () {
				i = observers.length;
				while ( i-- ) {
					observers[i].teardown();
				}
			}
		};
	};


	Observer = function ( statesman, keypath, callback, options ) {
		this.statesman = statesman;
		this.keypath = normalise( keypath );
		this.callback = callback;

		// default to root as context, but allow it to be overridden
		this.context = ( options && options.context ? options.context : statesman );

		registerDependant( this );


	};

	Observer.prototype = {
		update: function () {
			var value;

			value = get( this.statesman, this.keypath );

			if ( !isEqual( value, this.value ) ) {
				// wrap the callback in a try-catch block, and only throw error in
				// debug mode
				try {
					this.callback.call( this.context, value, this.value );
				} catch ( err ) {
					if ( this.statesman.debug ) {
						throw err;
					}
				}
				this.value = value;
			}
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};
	
}( statesmanProto ));
statesmanProto.removeComputedValue = function ( keypath ) {
	if ( this.computed[ keypath ] ) {
		this.computed[ keypath ].teardown();
	}

	return this;
};
statesmanProto.reset = function ( data ) {
	this.data = {};
	
	// TODO to get proper change hash, should we just do a non-silent set?
	// what about e.g. Ractive adaptor?
	this.set( data, { silent: true });
	this.fire( 'reset' );

	notifyObservers( this, '' );

	return this;
};
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
statesmanProto.subset = function ( path ) {
	if ( !path ) {
		throw 'No subset path specified';
	}

	if ( !this.subsets[ path ] ) {
		this.subsets[ path ] = new Subset( path, this );
	}

	return this.subsets[ path ];
};
statesmanProto.subtract = function ( keypath, d ) {
	var value = this.get( keypath );

	if ( d === undefined ) {
		d = 1;
	}

	if ( isNumeric( value ) && isNumeric( d ) ) {
		this.set( keypath, +value - ( d === undefined ? 1 : +d ) );
	}
};
statesmanProto.toggle = function ( keypath ) {
	this.set( keypath, !this.get( keypath ) );
};
clearCache = function ( statesman, keypath ) {
	var children = statesman.cacheMap[ keypath ];

	// TODO
	delete statesman.cache[ keypath ];

	if ( !children ) {
		return;
	}

	while ( children.length ) {
		clearCache( statesman, children.pop() );
	}
};
// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
isNumeric = function ( n ) {
	return !isNaN( parseFloat( n ) ) && isFinite( n );
};
notifyObservers = function ( statesman, keypath, directOnly ) {

	var deps, i, map;

	deps = statesman.deps[ keypath ];

	if ( deps ) {
		i = deps.length;
		while ( i-- ) {
			deps[i].update();
		}
	}

	if ( directOnly ) {
		return;
	}

	map = statesman.depsMap[ keypath ];
	if ( map ) {
		i = map.length;
		while ( i-- ) {
			notifyObservers( statesman, map[i] );
		}
	}	
};

notifyMultipleObservers = function ( statesman, keypaths, directOnly ) {
	var i;

	i = keypaths.length;
	while ( i-- ) {
		notifyObservers( statesman, keypaths[i],directOnly );
	}
};
propagateChanges = function ( statesman ) {
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


propagateChange = function ( statesman, keypath, directOnly ) {

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
};
registerDependant = function ( dependant, isReference ) {

	var statesman, keypath, deps, keys, parentKeypath, map, baseDeps, baseMap;

	statesman = dependant.statesman;
	keypath = dependant.keypath;

	if ( isReference ) {
		baseDeps = statesman.refs;
		baseMap = statesman.refsMap;
	} else {
		baseDeps = statesman.deps;
		baseMap = statesman.depsMap;
	}

	deps = baseDeps[ keypath ] || ( baseDeps[ keypath ] = [] );
	deps[ deps.length ] = dependant;

	// update dependants map
	keys = keypath.split( '.' );
	
	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );
	
		map = baseMap[ parentKeypath ] || ( baseMap[ parentKeypath ] = [] );

		if ( map[ keypath ] === undefined ) {
			map[ keypath ] = 0;
			map[ map.length ] = keypath;
		}

		map[ keypath ] += 1;

		keypath = parentKeypath;
	}
};
unregisterDependant = function ( dependant, isReference ) {

	var statesman, keypath, deps, keys, parentKeypath, map, baseDeps, baseMap;

	statesman = dependant.statesman;
	keypath = dependant.keypath;

	if ( isReference ) {
		baseDeps = statesman.refs;
		baseMap = statesman.refsMap;
	} else {
		baseDeps = statesman.deps;
		baseMap = statesman.depsMap;
	}

	deps = baseDeps[ keypath ];
	deps.splice( deps.indexOf( dependant ), 1 );

	// update dependants map
	keys = keypath.split( '.' );
	
	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );
	
		map = baseMap[ parentKeypath ];

		map[ keypath ] -= 1;

		if ( !map[ keypath ] ) {
			map.splice( map.indexOf( keypath ), 1 );
			map[ keypath ] = undefined;
		}

		keypath = parentKeypath;
	}
};
utils = {
	total: function ( arr ) {
		return arr.reduce( function ( prev, curr ) {
			return prev + curr;
		});
	}
};
Subset = function( path, state ) {
	var self = this, keypathPattern, pathDotLength;

	this.path = path;
	this.pathDot = path + '.';
	this.root = state;

	// events stuff
	this.subs = {};
	keypathPattern = new RegExp( '^' + this.pathDot.replace( '.', '\\.' ) );
	pathDotLength = this.pathDot.length;

	this.root.on( 'change', function ( changeHash ) {
		var localKeypath, keypath, unprefixed, changed;

		unprefixed = {};

		for ( keypath in changeHash ) {
			if ( changeHash.hasOwnProperty( keypath ) && keypathPattern.test( keypath ) ) {
				localKeypath = keypath.substring( pathDotLength );
				unprefixed[ localKeypath ] = changeHash[ keypath ];

				changed = true;
			}
		}

		if ( changed ) {
			self.fire( 'change', unprefixed );
		}
	});
};
subsetProto.add = function ( keypath, d ) {
	this.root.add( this.pathDot + keypath, d );
};
(function ( subsetProto ) {

	var compute;

	subsetProto.compute = function ( keypath, signature ) {

		var result, k;

		if ( typeof keypath === 'object' ) {
			result = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					result[k] = compute( this, k, keypath );
				}
			}

			return result;
		}

		return compute( this, keypath, signature );

	};

	compute = function ( subset, keypath, signature ) {

		var path = subset.pathDot, i;

		if ( typeof signature === 'string' ) {
			signature = compile( signature, subset.root, path );
			return subset.root.compute( path + keypath, signature );
		}

		if ( typeof signature === 'function' ) {
			signature = signature();
		}

		// prefix dependencies
		if ( signature.dependsOn ) {
			if ( typeof signature.dependsOn === 'string' ) {
				signature.dependsOn = [ signature.dependsOn ];
			}

			i = signature.dependsOn.length;
			while ( i-- ) {
				signature.dependsOn = ( path + signature.dependsOn );
			}
		}

		if ( !signature.context ) {
			signature.context = subset;
		}

		return subset.root.compute( path + keypath, signature );
	};

}( subsetProto ));
subsetProto.get = function ( keypath ) {
	if ( !keypath ) {
		return this.root.get( this.path );
	}

	return this.root.get( this.pathDot + keypath );
};
subsetProto.observe = function ( keypath, callback, options ) {
	var k, map;

	// overload - observe multiple keypaths
	if ( typeof keypath === 'object' ) {
		options = callback;

		map = {};
		for ( k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				map[ this.pathDot + k ] = keypath[ k ];
			}
		}

		if ( options ) {
			options.context = options.context || this;
		} else {
			options = { context: this };
		}

		return this.root.observe( map, options );
	}

	// overload - omit keypath to observe root
	if ( typeof keypath === 'function' ) {
		options = callback;
		callback = keypath;
		keypath = this.path;
	}

	else if ( keypath === '' ) {
		keypath = this.path;
	}

	else {
		keypath = ( this.pathDot + keypath );
	}

	if ( options ) {
		options.context = options.context || this;
	} else {
		options = { context: this };
	}

	return this.root.observe( keypath, callback, options );
};
subsetProto.removeComputedValue = function ( keypath ) {
	this.root.removeComputedValue( this.pathDot + keypath );
	return this;
};
subsetProto.reset = function ( data ) {
	this.root.set( this.path, data );
	return this;
};
subsetProto.set = function ( keypath, value, options ) {
	var k, map;

	if ( typeof keypath === 'object' ) {
		options = value;
		map = {};

		for ( k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				map[ this.pathDot + k ] = keypath[ k ];
			}
		}
		
		this.root.set( map, options );
		return this;
	}

	this.root.set( this.pathDot + keypath, value, options );
	return this;
};
subsetProto.subset = function ( keypath ) {
	return this.root.subset( this.pathDot + keypath );
};
subsetProto.subtract = function ( keypath, d ) {
	this.root.subtract( this.pathDot + keypath, d );
};
subsetProto.toggle = function ( keypath ) {
	this.root.toggle( this.pathDot + keypath );
};
events = {};

events.on = function ( eventName, callback ) {
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

events.once = function ( eventName, callback ) {
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

events.off = function ( eventName, callback ) {
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

events.fire = function ( eventName ) {
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
(function () {

	var varPattern = /\$\{\s*([a-zA-Z0-9_$\[\]\.]+)\s*\}/g;

	compile = function ( str, statesman, prefix ) {
		var expanded, dependencies, fn, compiled;

		prefix = prefix || '';
		dependencies = [];

		expanded = str.replace( varPattern, function ( match, keypath ) {
			// make a note of which dependencies are referenced, but de-dupe first
			if ( dependencies.indexOf( keypath ) === -1 ) {
				dependencies[ dependencies.length ] = prefix + keypath;
			}

			return 'm.get("' + prefix + keypath + '")';
		});

		fn = new Function( 'utils', 'var m=this;return ' + expanded );

		if ( fn.bind ) {
			compiled = fn.bind( statesman, Statesman.utils );
		} else {
			compiled = function () {
				return fn.call( statesman, Statesman.utils );
			};
		}

		return {
			compiled: compiled,
			dependsOn: dependencies,
			cache: !!dependencies.length
		};
	};

}());
// Miscellaneous helper functions
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

augment = function ( target, source ) {
	var key;

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = source[ key ];
		}
	}
};

augment( statesmanProto, events );
augment( subsetProto, events );

Statesman.prototype = statesmanProto;
Subset.prototype = subsetProto;

// attach static properties
Statesman.utils = utils;


// export as CommonJS
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = Statesman;
}

// ...or as AMD
else if ( typeof define === "function" && define.amd ) {
	define( function () {
		return Statesman;
	});
}

// ...or as browser global
else { 
	global.Statesman = Statesman;
}

}( this ));
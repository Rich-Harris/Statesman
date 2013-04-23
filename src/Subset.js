(function ( Statesman ) {

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
		this._path = path;
		this._pathDot = path + '.';
		this._root = state;
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

}( Statesman ));
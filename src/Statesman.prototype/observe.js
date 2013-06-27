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
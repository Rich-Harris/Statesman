(function ( statesmanProto ) {

	var Computed, Reference, validate, emptyArray, asyncPattern;

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
		this.async = signature.async;
		this.context = signature.context || statesman;

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
			var self = this, i, args, value, statesman, oldAsync, getterFired;

			statesman = this.statesman;

			try {
				if ( this.signature.compiled ) {
					value = this.signature.compiled();
				}

				else {
					args = [];

					if ( this.async ) {
						oldAsync = this.context.async;

						this.context.async = function () {
							return function ( result ) {
								if ( !getterFired ) {
									// this returned synchronously
									wasSynchronous = true;
									synchronousResult = result;
								}

								else {
									self.setting = true;
									statesman.set( self.keypath, result );
									self.setting = false;
								}
							};
						};
					}

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
							args[i] = statesman.get( this.signature.dependsOn[i] );
						}

						value = this.signature.get.apply( this.context, args );
					}

					getterFired = true;

					if ( this.async ) {
						this.context.async = oldAsync;

						if ( wasSynchronous ) {
							value = synchronousResult;
						}
						
						// respect returned values, which may be placeholders, but if nothing
						// is returned then return the previous value
						else if ( value === undefined ) {
							value = this.value;
						}
					}
				}
			}

			catch ( err ) {
				if ( statesman.debug ) {
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
	asyncPattern = /async/;

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

			if ( signature.get && asyncPattern.test( signature.get ) ) {
				signature.async = true; 
			}
		}
		
		if ( signature.dependsOn.indexOf( keypath ) !== -1 ) {
			throw new Error( 'A computed value ("' + keypath + '") cannot depend on itself' );
		}

		return signature;

	};

}( statesmanProto ));
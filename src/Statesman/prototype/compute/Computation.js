define([
	'Statesman/prototype/shared/isEqual',
	'Statesman/prototype/compute/compile',
	'Statesman/prototype/compute/validate',
	'Statesman/prototype/compute/Reference'
], function (
	isEqual,
	compile,
	validate,
	Reference
) {

	'use strict';

	var Computation = function ( statesman, keypath, signature ) {

		var i;

		// teardown any existing computed values on this keypath
		if ( statesman.computations[ keypath ] ) {
			statesman.computations[ keypath ].teardown();
		}

		this.statesman = statesman;
		this.keypath = keypath;

		statesman.computations[ keypath ] = this;

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

		// if this is a cacheable computation, we update proactively
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

	Computation.prototype = {
		bubble: function () {
			if ( this.selfUpdating ) {
				this.update();
			}

			else if ( !this.deferred ) {
				this.statesman.deferredComputations.push( this );
				this.deferred = true;
			}
		},

		deferredUpdate: function () {
			this.update();
			this.deferred = false;
		},

		update: function () {
			var value;

			value = this.getter();

			if ( !isEqual( value, this.value ) ) {
				this.setting = true;
				this.statesman.set( this.keypath, value );
				this.setting = false;

				this.value = value;
			}

			return this;
		},

		getter: function () {
			var self = this,
				i,
				args,
				value,
				statesman,
				wasSynchronous,
				oldAsync,
				synchronousResult,
				getterFired;

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

								self.value = result;
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
					throw new Error( 'You cannot overwrite a computed value ("' + this.keypath + '"), unless its readonly flag is set to `false`' );
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
				this.statesman.computations[ this.keypath ] = null;
			}
		}
	};

	return Computation;

});
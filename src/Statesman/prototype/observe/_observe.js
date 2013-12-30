define([
	'Statesman/prototype/shared/Observer'
], function (
	Observer
) {

	'use strict';

	return function ( keypath, callback, options ) {

		var observer, observers, k, i, init;

		// overload - allow observe to be called with no keypath (i.e. observe root)
		if ( typeof keypath === 'function' ) {
			options = callback;
			callback = keypath;

			keypath = '';
		}

		// by default, initialise observers
		init = ( !options || options.init !== false );

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

});
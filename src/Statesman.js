define([
	'Statesman/_Statesman',
	'circular'
], function (
	Statesman,
	circular
) {

	'use strict';

	// Shim for old browsers
	if ( !Array.prototype.indexOf ) {
		Array.prototype.indexOf = function ( needle, i ) {
			var len;

			if ( i === undefined ) {
				i = 0;
			}

			if ( i < 0 ) {
				i+= this.length;
			}

			if ( i < 0 ) {
				i = 0;
			}

			for ( len = this.length; i<len; i++ ) {
				if ( i in this && this[i] === needle ) {
					return i;
				}
			}

			return -1;
		};
	}

	// Certain modules have circular dependencies. If we were bundling a
	// module loader, e.g. almond.js, this wouldn't be a problem, but we're
	// not - we're using amdclean as part of the build process. Because of
	// this, we need to wait until all modules have loaded before those
	// circular dependencies can be required.
	while ( circular.length ) {
		circular.pop()();
	}

	return Statesman;

});
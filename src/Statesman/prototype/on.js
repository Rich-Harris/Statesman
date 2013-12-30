define( function () {

	'use strict';

	return function ( eventName, callback ) {
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

});
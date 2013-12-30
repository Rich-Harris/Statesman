define( function () {

	'use strict';

	return function ( eventName, callback ) {
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

});
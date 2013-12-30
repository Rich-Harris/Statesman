define( function () {

	'use strict';

	return function ( eventName, callback ) {
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

});
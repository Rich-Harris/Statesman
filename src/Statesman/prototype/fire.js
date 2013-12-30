define( function () {

	'use strict';

	return function ( eventName ) {
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

});
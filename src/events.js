events = {};

events.on = function ( eventName, callback ) {
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

events.once = function ( eventName, callback ) {
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

events.off = function ( eventName, callback ) {
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

events.fire = function ( eventName ) {
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
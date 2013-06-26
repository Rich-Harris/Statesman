/*var addToQueue = function ( statesman, callback, value, previous, context ) {
	var i;

	// Remove queued item with this callback, if there is one
	for ( i=0; i<statesman._observerQueue.length; i+=1 ) {
		if ( statesman._observerQueue[i].c === callback ) {
			statesman._observerQueue.splice( i, 1 );
			break;
		}
	}

	// Append a new item
	statesman._observerQueue[ statesman._observerQueue.length ] = {
		c: callback,
		v: value,
		p: previous,
		cx: context
	};
};*/
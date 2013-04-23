// shim Array.prototype.indexOf

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
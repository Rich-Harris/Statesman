define([
	'Statesman/prototype/subset/Subset/_Subset'
], function (
	Subset
) {

	'use strict';

	return function ( path ) {
		if ( !path ) {
			throw 'No subset path specified';
		}

		if ( !this.subsets[ path ] ) {
			this.subsets[ path ] = new Subset( path, this );
		}

		return this.subsets[ path ];
	};

});
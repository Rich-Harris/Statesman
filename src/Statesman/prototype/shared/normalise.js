define([

], function (

) {

	'use strict';

	var normalisedKeypathCache = {};

	return function ( keypath ) {
		return normalisedKeypathCache[ keypath ] || ( normalisedKeypathCache[ keypath ] = keypath.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ) );
	};

});
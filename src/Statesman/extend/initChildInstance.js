define([
	'circular',
	'utils/clone',
	'utils/augment'
], function (
	circular,
	clone,
	augment
) {

	'use strict';

	var Statesman;

	circular.push( function () {
		Statesman = circular.Statesman;
	});

	return function ( child, Child, data ) {
		if ( Child.data ) {
			data = augment( clone( Child.data ), data );
		}

		Statesman.call( child, data );

		if ( Child.computed ) {
			child.compute( Child.computed );
		}

		if ( child.init ) {
			child.init.call( child, data );
		}
	};

});
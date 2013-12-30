define([
	'circular',
	'utils/create',
	'Statesman/extend/initChildInstance',
	'Statesman/extend/inheritFromParent',
	'Statesman/extend/inheritFromChildProps'
], function (
	circular,
	create,
	initChildInstance,
	inheritFromParent,
	inheritFromChildProps
) {

	'use strict';

	var Statesman;

	circular.push( function () {
		Statesman = circular.Statesman;
	});

	return function extend ( childProps ) {
		var Parent = this, Child;

		if ( !childProps ) {
			childProps = {};
		}

		// create Child constructor
		Child = function ( data ) {
			initChildInstance( this, Child, data || {});
		};

		Child.prototype = create( Parent.prototype );

		// inherit options from parent, if we're extending a subclass
		if ( Parent !== Statesman ) {
			inheritFromParent( Child, Parent );
		}

		// apply childProps
		inheritFromChildProps( Child, childProps );

		Child.extend = extend;

		return Child;
	};

});
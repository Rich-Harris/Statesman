define([
	'Statesman/prototype/fire',
	'Statesman/prototype/off',
	'Statesman/prototype/on',
	'Statesman/prototype/once',
	'Statesman/prototype/subset/Subset/prototype/add',
	'Statesman/prototype/subset/Subset/prototype/compute',
	'Statesman/prototype/subset/Subset/prototype/get',
	'Statesman/prototype/subset/Subset/prototype/observe',
	'Statesman/prototype/subset/Subset/prototype/removeComputedValue',
	'Statesman/prototype/subset/Subset/prototype/reset',
	'Statesman/prototype/subset/Subset/prototype/set',
	'Statesman/prototype/subset/Subset/prototype/subset',
	'Statesman/prototype/subset/Subset/prototype/subtract',
	'Statesman/prototype/subset/Subset/prototype/toggle'
], function (
	fire,
	off,
	on,
	once,
	add,
	compute,
	get,
	observe,
	removeComputedValue,
	reset,
	set,
	subset,
	subtract,
	toggle
) {

	'use strict';

	var Subset = function( path, state ) {
		var self = this, keypathPattern, pathDotLength;

		this.path = path;
		this.pathDot = path + '.';
		this.root = state;

		// events stuff
		this.subs = {};
		keypathPattern = new RegExp( '^' + this.pathDot.replace( '.', '\\.' ) );
		pathDotLength = this.pathDot.length;

		this.root.on( 'change', function ( changeHash ) {
			var localKeypath, keypath, unprefixed, changed;

			unprefixed = {};

			for ( keypath in changeHash ) {
				if ( changeHash.hasOwnProperty( keypath ) && keypathPattern.test( keypath ) ) {
					localKeypath = keypath.substring( pathDotLength );
					unprefixed[ localKeypath ] = changeHash[ keypath ];

					changed = true;
				}
			}

			if ( changed ) {
				self.fire( 'change', unprefixed );
			}
		});
	};

	Subset.prototype = {
		add: add,
		compute: compute,
		fire: fire,
		get: get,
		observe: observe,
		off: off,
		on: on,
		once: once,
		removeComputedValue: removeComputedValue,
		reset: reset,
		set: set,
		subset: subset,
		subtract: subtract,
		toggle: toggle,
		toJSON: get
	};

	return Subset;

});


define([
	'utils/augment',
	'Statesman/extend/extendable'
], function (
	augment,
	extendable
) {

	'use strict';

	var blacklist = extendable;

	return function ( Child, childProps ) {
		var key, member;

		extendable.forEach( function ( property ) {
			var value = childProps[ property ];

			if ( value ) {
				if ( Child[ property ] ) {
					augment( Child[ property ], value );
				}

				else {
					Child[ property ] = value;
				}
			}
		});

		/*inheritable.forEach( function ( property ) {
			if ( childProps[ property ] !== undefined ) {
				Child[ property ] = childProps[ property ];
			}
		});*/

		// Blacklisted properties don't extend the child, as they are part of the initialisation options
		for ( key in childProps ) {
			if ( childProps.hasOwnProperty( key ) && !Child.prototype.hasOwnProperty( key ) && blacklist.indexOf( key ) === -1 ) {
				member = childProps[ key ];

				// if this is a method that overwrites a prototype method, we may need
				// to wrap it
				if ( typeof member === 'function' && typeof Child.prototype[ key ] === 'function' ) {
					Child.prototype[ key ] = wrapMethod( member, Child.prototype[ key ] );
				} else {
					Child.prototype[ key ] = member;
				}
			}
		}
	};

	function wrapMethod ( method, superMethod ) {
		if ( /_super/.test( method ) ) {
			return function () {
				var _super = this._super, result;
				this._super = superMethod;

				result = method.apply( this, arguments );

				this._super = _super;
				return result;
			};
		}

		else {
			return method;
		}
	}

});
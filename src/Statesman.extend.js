(function () {

	var fillGaps,
		clone,
		augment,
		create,

		inheritFromParent,
		wrapMethod,
		inheritFromChildProps,
		conditionallyParseTemplate,
		extractInlinePartials,
		conditionallyParsePartials,
		initChildInstance,

		extendable,
		inheritable,
		blacklist;

	extendable = [ 'data', 'computed' ];
	blacklist = extendable;


	extend = function ( childProps ) {
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

	inheritFromParent = function ( Child, Parent ) {
		extendable.forEach( function ( property ) {
			if ( Parent[ property ] ) {
				Child[ property ] = clone( Parent[ property ] );
			}
		});
	};

	wrapMethod = function ( method, superMethod ) {
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
	};

	inheritFromChildProps = function ( Child, childProps ) {
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
			if ( hasOwn.call( childProps, key ) && !hasOwn.call( Child.prototype, key ) && blacklist.indexOf( key ) === -1 ) {
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

	

	initChildInstance = function ( child, Child, data ) {
		var protoData, data, id;

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

	fillGaps = function ( target, source ) {
		var key;

		for ( key in source ) {
			if ( hasOwn.call( source, key ) && !hasOwn.call( target, key ) ) {
				target[ key ] = source[ key ];
			}
		}
	};

	clone = function ( source ) {
		var target = {}, key;

		for ( key in source ) {
			if ( hasOwn.call( source, key ) ) {
				target[ key ] = source[ key ];
			}
		}

		return target;
	};

	augment = function ( target, source ) {
		var key;

		for ( key in source ) {
			if ( hasOwn.call( source, key ) ) {
				target[ key ] = source[ key ];
			}
		}

		return target;
	};

	try {
		Object.create( null );
		create = Object.create;
	} catch ( err ) {
		// sigh
		create = (function () {
			var F = function () {};

			return function ( proto, props ) {
				var obj;

				F.prototype = proto;
				obj = new F();

				if ( props ) {
					Object.defineProperties( obj, props );
				}

				return obj;
			};
		}());
	}

}());
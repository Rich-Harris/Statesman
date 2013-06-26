(function ( subsetProto ) {

	var compute;

	subsetProto.compute = function ( keypath, signature ) {

		var result, k;

		if ( typeof keypath === 'object' ) {
			result = {};

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					result[k] = compute( this, k, keypath );
				}
			}

			return result;
		}

		return compute( this, keypath, signature );

	};

	compute = function ( subset, keypath, signature ) {

		var path = subset._pathDot, i;

		if ( typeof signature === 'string' ) {
			signature = compile( signature, subset._root, path );
			return subset._root.compute( path + keypath, signature );
		}

		if ( typeof signature === 'function' ) {
			signature = signature();
		}

		// prefix dependencies
		if ( signature.dependsOn ) {
			if ( typeof signature.dependsOn === 'string' ) {
				signature.dependsOn = [ signature.dependsOn ];
			}

			i = signature.dependsOn.length;
			while ( i-- ) {
				signature.dependsOn = ( path + signature.dependsOn );
			}
		}

		if ( !signature.context ) {
			signature.context = subset;
		}

		return subset._root.compute( path + keypath, signature );
	};

}( subsetProto ));





/*subsetProto.compute = function ( keypath, options ) {
	var self = this, k, map, processOptions, context, path;

	path = this._pathDot;

	options.context = options.context || this;

	processOptions = function ( options ) {
		var triggers, i, compiled;

		if ( typeof options === 'string' ) {
			return {
				fn: options,
				context: self,
				prefix: path
			};
		}

		triggers = options.triggers || options.trigger;

		if ( typeof triggers === 'string' ) {
			triggers = [ triggers ];
		}

		if ( triggers ) {
			delete options.triggers;
			delete options.trigger;
		}

		i = triggers.length;
		while ( i-- ) {
			triggers[i] = path + triggers[i];
		}

		options.triggers = triggers;

		if ( !options.context ) {
			options.context = self;
		}
		return options;
	};

	// Multiple computed values
	if ( typeof keypath === 'object' ) {
		map = {};
		for ( k in keypath ) {
			map[ this._pathDot + k ] = processOptions( keypath[ k ] );
		}

		return this._root.compute( map );
	}

	// Single computed value
	return this._root.compute( this._pathDot + keypath, processOptions( options ) );
};*/
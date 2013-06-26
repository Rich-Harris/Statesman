(function () {

	var varPattern = /\$\{\s*([a-zA-Z0-9_$\[\]\.]+)\s*\}/g;

	compile = function ( str, statesman, prefix ) {
		var expanded, dependencies, fn, compiled;

		prefix = prefix || '';
		dependencies = [];

		expanded = str.replace( varPattern, function ( match, keypath ) {
			// make a note of which dependencies are referenced, but de-dupe first
			if ( dependencies.indexOf( keypath ) === -1 ) {
				dependencies[ dependencies.length ] = prefix + keypath;
			}

			return 'm.get("' + prefix + keypath + '")';
		});

		fn = new Function( 'utils', 'var m=this;return ' + expanded );

		if ( fn.bind ) {
			compiled = fn.bind( statesman, Statesman.utils );
		} else {
			compiled = function () {
				return fn.call( statesman, Statesman.utils );
			};
		}

		return {
			compiled: compiled,
			dependsOn: dependencies,
			cache: !!dependencies.length
		};
	};

}());
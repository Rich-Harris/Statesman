(function () {

	var varPattern = /\$\{\s*([a-zA-Z0-9_$\[\]\.]+)\s*\}/g;

	compile = function ( str, context, prefix ) {
		var compiled, triggers, expanded, fn, getter;

		prefix = prefix || '';
		triggers = [];

		expanded = str.replace( varPattern, function ( match, keypath ) {
			// make a note of which triggers are referenced, but de-dupe first
			if ( triggers.indexOf( keypath ) === -1 ) {
				triggers[ triggers.length ] = prefix + keypath;
			}

			return 'm.get("' + keypath + '")';
		});

		fn = new Function( 'utils', 'var m=this;try{return ' + expanded + '}catch(e){return undefined}' );

		if ( fn.bind ) {
			getter = fn.bind( context, Statesman.utils );
		} else {
			getter = function () {
				return fn.call( context, Statesman.utils );
			};
		}

		return {
			getter: getter,
			triggers: triggers
		};
	};

}());
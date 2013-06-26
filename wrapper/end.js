
augment( statesmanProto, events );
augment( subsetProto, events );

Statesman.prototype = statesmanProto;
Subset.prototype = subsetProto;

// attach static properties
Statesman.utils = utils;


// export as CommonJS
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = Statesman;
}

// ...or as AMD
else if ( typeof define === "function" && define.amd ) {
	define( function () { return Statesman } )
}

// ...or as browser global
else { 
	global.Statesman = Statesman;
}

}( this ));

// export as Common JS module...
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = Statesman;
}

// ... or as AMD module
else if ( typeof define === "function" && define.amd ) {
	define( function () {
		return Statesman;
	});
}

// ... or as browser global
else {
	global.Statesman = Statesman;
}

}( typeof window !== 'undefined' ? window : this ));
define([
	'circular',
	'utils/create',
	'utils/defineProperties',
	'Statesman/prototype/add',
	'Statesman/prototype/compute/_compute',
	'Statesman/prototype/fire',
	'Statesman/prototype/get',
	'Statesman/prototype/observe/_observe',
	'Statesman/prototype/off',
	'Statesman/prototype/on',
	'Statesman/prototype/once',
	'Statesman/prototype/removeComputedValue',
	'Statesman/prototype/reset',
	'Statesman/prototype/set/_set',
	'Statesman/prototype/subset/_subset',
	'Statesman/prototype/subtract',
	'Statesman/prototype/toggle',
	'Statesman/prototype/unobserve',
	'Statesman/prototype/unobserveAll',
	'Statesman/extend/_extend'
], function (
	circular,
	create,
	defineProperties,
	add,
	compute,
	fire,
	get,
	observe,
	off,
	on,
	once,
	removeComputedValue,
	reset,
	set,
	subset,
	subtract,
	toggle,
	unobserve,
	unobserveAll,
	extend
) {

	'use strict';

	var Statesman = function ( data ) {
		defineProperties( this, {
			data: { value: data || {}, writable: true },

			// Events
			subs: { value: create( null ), writable: true },

			// Internal value cache
			cache: { value: create( null ) },
			cacheMap: { value: create( null ) },

			// Observers
			observers: { value: create( null ) },
			observersMap: { value: create( null ) },

			// Computed value references
			references: { value: create( null ) },
			referencesMap: { value: create( null ) },

			// Computed values
			computations: { value: create( null ) },

			// Subsets
			subsets: { value: create( null ) },

			// Deferred updates (i.e. computed values with more than one reference)
			deferredComputations: { value: [] },

			// Place to store model changes prior to notifying consumers
			changes: { value: null, writable: true },
			upstreamChanges: { value: null, writable: true },
			changeHash: { value: null, writable: true }
		});
	};

	Statesman.prototype = {
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
		toJSON: get,
		unobserve: unobserve,
		unobserveAll: unobserveAll
	};

	// Static methods and properties
	Statesman.extend = extend;

	circular.Statesman = Statesman;
	return Statesman;

});
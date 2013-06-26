Statesman = function ( data ) {
	defineProperties( this, {
		data: { value: data || {}, writable: true },

		// Events
		subs: { value: {}, writable: true },
		
		// Internal value cache
		cache: { value: {} },
		cacheMap: { value: {} },

		// Observers
		deps: { value: {} },
		depsMap: { value: {} },

		// Computed value references
		refs: { value: {} },
		refsMap: { value: {} },

		// Computed values
		computed: { value: {} },

		// Subsets
		subsets: { value: {} },
		
		// Deferred updates (i.e. computed values with more than one reference)
		deferred: { value: [] },

		// Place to store model changes prior to notifying consumers
		changes: { value: null, writable: true },
		upstreamChanges: { value: null, writable: true },
		changeHash: { value: null, writable: true }
	});
};
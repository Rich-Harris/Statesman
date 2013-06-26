Statesman = function ( data ) {
	defineProperties( this, {
		data: { value: data || {}, writable: true },

		_subs: { value: {}, writable: true },
		_cache: { value: {} },
		_cacheMap: { value: {} },

		_deps: { value: {} },
		_depsMap: { value: {} },

		_refs: { value: {} },
		_refsMap: { value: {} },

		_computed: { value: {} },

		_observers: { value: {} },
		_subsets: { value: {} },
		_deferred: { value: [] },

		_observerQueue: { value: [] },
		_silentSetterPayload: { value: null, writable: true  },
		_setterPayload: { value: null, writable: true  },

		_consolidatingObservers: { value: 0, writable: true },
		_consolidatingSetters: { value: 0, writable: true },
		_computing: { value: 0, writable: true }
	});
};
(function ( global ) {



var circular = function () {
        
        return [];
    }();
var utils_defineProperty = function () {
        
        if (Object.defineProperty) {
            return Object.defineProperty;
        }
        return function (obj, prop, desc) {
            obj[prop] = desc.value;
        };
    }();
var utils_defineProperties = function (defineProperty) {
        
        if (Object.defineProperties) {
            return Object.defineProperties;
        }
        return function (obj, props) {
            var prop;
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    defineProperty(obj, prop, props[prop]);
                }
            }
        };
    }(utils_defineProperty);
var Statesman_prototype_shared_isNumeric = function () {
        
        return function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
    }();
var Statesman_prototype_add = function (isNumeric) {
        
        return function (keypath, d) {
            var value = this.get(keypath);
            if (d === undefined) {
                d = 1;
            }
            if (isNumeric(value) && isNumeric(d)) {
                this.set(keypath, +value + (d === undefined ? 1 : +d));
            }
        };
    }(Statesman_prototype_shared_isNumeric);
var Statesman_prototype_shared_isEqual = function () {
        
        return function (a, b) {
            if (a === null && b === null) {
                return true;
            }
            if (typeof a === 'object' || typeof b === 'object') {
                return false;
            }
            return a === b;
        };
    }();
var Statesman_utils_total = function () {
        
        return function (arr) {
            return arr.reduce(function (prev, curr) {
                return prev + curr;
            });
        };
    }();
var Statesman_utils__utils = function (total) {
        
        return { total: total };
    }(Statesman_utils_total);
var Statesman_prototype_compute_compile = function (utils) {
        
        var varPattern = /\$\{\s*([a-zA-Z0-9_$\[\]\.]+)\s*\}/g;
        return function (str, statesman, prefix) {
            var expanded, dependencies, fn, compiled;
            prefix = prefix || '';
            dependencies = [];
            expanded = str.replace(varPattern, function (match, keypath) {
                if (dependencies.indexOf(keypath) === -1) {
                    dependencies[dependencies.length] = prefix + keypath;
                }
                return 'm.get("' + prefix + keypath + '")';
            });
            fn = new Function('utils', 'var m=this;return ' + expanded);
            if (fn.bind) {
                compiled = fn.bind(statesman, utils);
            } else {
                compiled = function () {
                    return fn.call(statesman, utils);
                };
            }
            return {
                compiled: compiled,
                dependsOn: dependencies,
                cache: !!dependencies.length
            };
        };
    }(Statesman_utils__utils);
var Statesman_prototype_compute_validate = function () {
        
        var emptyArray = [], asyncPattern = /async/;
        return function (keypath, signature, debug) {
            if (!signature.compiled) {
                if (!signature.get && !signature.set) {
                    throw new Error('Computed values must have either a get() or a set() method, or both');
                }
                if (!signature.set && signature.readonly !== false) {
                    signature.readonly = true;
                }
                if (!signature.dependsOn) {
                    signature.dependsOn = emptyArray;
                } else if (typeof signature.dependsOn === 'string') {
                    signature.dependsOn = [signature.dependsOn];
                }
                if (!signature.dependsOn.length) {
                    if (signature.cache && debug) {
                        throw new Error('Computed values with no dependencies must be uncached');
                    }
                    signature.cache = false;
                }
                if (signature.cache !== false) {
                    signature.cache = true;
                }
                if (signature.get && asyncPattern.test(signature.get)) {
                    signature.async = true;
                }
            }
            if (signature.dependsOn.indexOf(keypath) !== -1) {
                throw new Error('A computed value ("' + keypath + '") cannot depend on itself');
            }
            return signature;
        };
    }();
var Statesman_prototype_shared_registerDependant = function () {
        
        return function (dependant, isReference) {
            var statesman, keypath, deps, keys, parentKeypath, map, baseDeps, baseMap;
            statesman = dependant.statesman;
            keypath = dependant.keypath;
            if (isReference) {
                baseDeps = statesman.refs;
                baseMap = statesman.refsMap;
            } else {
                baseDeps = statesman.deps;
                baseMap = statesman.depsMap;
            }
            deps = baseDeps[keypath] || (baseDeps[keypath] = []);
            deps[deps.length] = dependant;
            keys = keypath.split('.');
            while (keys.length) {
                keys.pop();
                parentKeypath = keys.join('.');
                map = baseMap[parentKeypath] || (baseMap[parentKeypath] = []);
                if (map[keypath] === undefined) {
                    map[keypath] = 0;
                    map[map.length] = keypath;
                }
                map[keypath] += 1;
                keypath = parentKeypath;
            }
        };
    }();
var Statesman_prototype_shared_unregisterDependant = function () {
        
        return function (dependant, isReference) {
            var statesman, keypath, deps, keys, parentKeypath, map, baseDeps, baseMap;
            statesman = dependant.statesman;
            keypath = dependant.keypath;
            if (isReference) {
                baseDeps = statesman.refs;
                baseMap = statesman.refsMap;
            } else {
                baseDeps = statesman.deps;
                baseMap = statesman.depsMap;
            }
            deps = baseDeps[keypath];
            deps.splice(deps.indexOf(dependant), 1);
            keys = keypath.split('.');
            while (keys.length) {
                keys.pop();
                parentKeypath = keys.join('.');
                map = baseMap[parentKeypath];
                map[keypath] -= 1;
                if (!map[keypath]) {
                    map.splice(map.indexOf(keypath), 1);
                    map[keypath] = undefined;
                }
                keypath = parentKeypath;
            }
        };
    }();
var Statesman_prototype_compute_Reference = function (isEqual, registerDependant, unregisterDependant) {
        
        var Reference = function (computed, keypath) {
            this.computed = computed;
            this.statesman = computed.statesman;
            this.keypath = keypath;
            this.value = this.statesman.get(keypath);
            registerDependant(this, true);
        };
        Reference.prototype = {
            update: function () {
                var value;
                value = this.statesman.get(this.keypath);
                if (!isEqual(value, this.value)) {
                    this.value = value;
                    this.computed.bubble();
                }
            },
            teardown: function () {
                unregisterDependant(this, true);
            }
        };
        return Reference;
    }(Statesman_prototype_shared_isEqual, Statesman_prototype_shared_registerDependant, Statesman_prototype_shared_unregisterDependant);
var Statesman_prototype_compute_Computed = function (isEqual, compile, validate, Reference) {
        
        var Computed = function (statesman, keypath, signature) {
            var i;
            if (statesman.computed[keypath]) {
                statesman.computed[keypath].teardown();
            }
            this.statesman = statesman;
            this.keypath = keypath;
            statesman.computed[keypath] = this;
            if (typeof signature === 'string') {
                signature = compile(signature, statesman);
            } else {
                if (typeof signature === 'function') {
                    signature = signature();
                }
                validate(keypath, signature, statesman.debug);
            }
            this.signature = signature;
            this.cache = signature.cache;
            this.async = signature.async;
            this.context = signature.context || statesman;
            this.refs = [];
            i = signature.dependsOn.length;
            if (this.cache) {
                if (i === 1) {
                    this.selfUpdating = true;
                }
                while (i--) {
                    this.refs[i] = new Reference(this, signature.dependsOn[i]);
                }
            }
            this.setting = true;
            statesman.set(this.keypath, this.value = this.getter());
            this.setting = false;
        };
        Computed.prototype = {
            bubble: function () {
                if (this.selfUpdating) {
                    this.update();
                } else if (!this.deferred) {
                    this.statesman.deferred.push(this);
                    this.deferred = true;
                }
            },
            update: function () {
                var value;
                value = this.getter();
                if (!isEqual(value, this.value)) {
                    this.setting = true;
                    this.statesman.set(this.keypath, value);
                    this.setting = false;
                    this.value = value;
                }
                return this;
            },
            getter: function () {
                var self = this, i, args, value, statesman, wasSynchronous, oldAsync, synchronousResult, getterFired;
                statesman = this.statesman;
                try {
                    if (this.signature.compiled) {
                        value = this.signature.compiled();
                    } else {
                        args = [];
                        if (this.async) {
                            oldAsync = this.context.async;
                            this.context.async = function () {
                                return function (result) {
                                    if (!getterFired) {
                                        wasSynchronous = true;
                                        synchronousResult = result;
                                    } else {
                                        self.setting = true;
                                        statesman.set(self.keypath, result);
                                        self.setting = false;
                                    }
                                    self.value = result;
                                };
                            };
                        }
                        if (this.cache) {
                            i = this.refs.length;
                            while (i--) {
                                args[i] = this.refs[i].value;
                            }
                            value = this.signature.get.apply(this.context, args);
                        } else {
                            i = this.signature.dependsOn.length;
                            while (i--) {
                                args[i] = statesman.get(this.signature.dependsOn[i]);
                            }
                            value = this.signature.get.apply(this.context, args);
                        }
                        getterFired = true;
                        if (this.async) {
                            this.context.async = oldAsync;
                            if (wasSynchronous) {
                                value = synchronousResult;
                            } else if (value === undefined) {
                                value = this.value;
                            }
                        }
                    }
                } catch (err) {
                    if (statesman.debug) {
                        throw err;
                    }
                    value = undefined;
                }
                this.override = false;
                return value;
            },
            setter: function (value) {
                if (this.signature.set) {
                    try {
                        this.signature.set.call(this.context, value);
                    } catch (err) {
                        if (this.statesman.debug) {
                            throw err;
                        }
                    }
                } else if (this.signature.readonly) {
                    if (this.statesman.debug) {
                        throw new Error('You cannot overwrite a computed value ("' + this.keypath + '"), unless its readonly flag is set to `false`');
                    }
                } else {
                    this.override = true;
                    this.setting = true;
                    this.statesman.set(this.keypath, value);
                    this.setting = false;
                }
            },
            teardown: function () {
                while (this.refs.length) {
                    this.refs.pop().teardown();
                    this.statesman.computed[this.keypath] = null;
                }
            }
        };
        return Computed;
    }(Statesman_prototype_shared_isEqual, Statesman_prototype_compute_compile, Statesman_prototype_compute_validate, Statesman_prototype_compute_Reference);
var Statesman_prototype_compute__compute = function (Computed) {
        
        return function (keypath, signature) {
            var result, k, computed;
            if (typeof keypath === 'object') {
                result = {};
                for (k in keypath) {
                    if (keypath.hasOwnProperty(k)) {
                        computed = new Computed(this, k, keypath[k]);
                        result[k] = computed.value;
                    }
                }
                return result;
            }
            computed = new Computed(this, keypath, signature);
            return computed.value;
        };
    }(Statesman_prototype_compute_Computed);
var Statesman_prototype_fire = function () {
        
        return function (eventName) {
            var subscribers, args, len, i;
            subscribers = this.subs[eventName];
            if (!subscribers) {
                return this;
            }
            len = subscribers.length;
            args = Array.prototype.slice.call(arguments, 1);
            for (i = 0; i < len; i += 1) {
                subscribers[i].apply(this, args);
            }
        };
    }();
var Statesman_prototype_shared_normalise = function () {
        
        var normalisedKeypathCache = {};
        return function (keypath) {
            return normalisedKeypathCache[keypath] || (normalisedKeypathCache[keypath] = keypath.replace(/\[\s*([0-9]+)\s*\]/g, '.$1'));
        };
    }();
var Statesman_prototype_shared_get = function () {
        
        return function get(statesman, keypath, keys, forceCache) {
            var computed, lastKey, parentKeypath, parentValue, value;
            if (!keypath) {
                return statesman.data;
            }
            if (computed = statesman.computed[keypath]) {
                if (!forceCache && !computed.cache && !computed.override) {
                    statesman.cache[keypath] = computed.getter();
                }
            }
            if (statesman.cache.hasOwnProperty(keypath)) {
                return statesman.cache[keypath];
            }
            keys = keys || keypath.split('.');
            lastKey = keys.pop();
            parentKeypath = keys.join('.');
            parentValue = get(statesman, parentKeypath, keys);
            if (parentValue && parentValue[lastKey] !== undefined) {
                value = parentValue[lastKey];
                statesman.cache[keypath] = value;
                if (!statesman.cacheMap[parentKeypath]) {
                    statesman.cacheMap[parentKeypath] = [];
                }
                statesman.cacheMap[parentKeypath].push(keypath);
            }
            return value;
        };
    }();
var Statesman_prototype_get = function (normalise, get) {
        
        return function (keypath) {
            return get(this, keypath && normalise(keypath));
        };
    }(Statesman_prototype_shared_normalise, Statesman_prototype_shared_get);
var Statesman_prototype_shared_Observer = function (normalise, isEqual, registerDependant, unregisterDependant) {
        
        var Observer = function (statesman, keypath, callback, options) {
            this.statesman = statesman;
            this.keypath = normalise(keypath);
            this.callback = callback;
            this.context = options && options.context ? options.context : statesman;
            registerDependant(this);
        };
        Observer.prototype = {
            update: function () {
                var value;
                value = this.statesman.get(this.keypath);
                if (!isEqual(value, this.value)) {
                    try {
                        this.callback.call(this.context, value, this.value);
                    } catch (err) {
                        if (this.statesman.debug) {
                            throw err;
                        }
                    }
                    this.value = value;
                }
            },
            teardown: function () {
                unregisterDependant(this);
            }
        };
        return Observer;
    }(Statesman_prototype_shared_normalise, Statesman_prototype_shared_isEqual, Statesman_prototype_shared_registerDependant, Statesman_prototype_shared_unregisterDependant);
var Statesman_prototype_observe__observe = function (Observer) {
        
        return function (keypath, callback, options) {
            var observer, observers, k, i, init;
            if (typeof keypath === 'function') {
                options = callback;
                callback = keypath;
                keypath = '';
            }
            init = !options || options.init !== false;
            if (typeof keypath === 'string') {
                observer = new Observer(this, keypath, callback, options);
                if (init) {
                    observer.update();
                } else {
                    observer.value = this.get(keypath);
                }
                return {
                    cancel: function () {
                        observer.teardown();
                    }
                };
            }
            if (typeof keypath !== 'object') {
                throw new Error('Bad arguments to Statesman.prototype.observe()');
            }
            options = callback;
            observers = [];
            for (k in keypath) {
                if (keypath.hasOwnProperty(k)) {
                    observers[observers.length] = new Observer(this, k, keypath[k], options);
                }
            }
            i = observers.length;
            if (init) {
                while (i--) {
                    observers[i].update();
                }
            } else {
                while (i--) {
                    observers[i].value = this.get(observer.keypath);
                }
            }
            return {
                cancel: function () {
                    i = observers.length;
                    while (i--) {
                        observers[i].teardown();
                    }
                }
            };
        };
    }(Statesman_prototype_shared_Observer);
var Statesman_prototype_off = function () {
        
        return function (eventName, callback) {
            var subscribers, index;
            if (!eventName) {
                this.subs = {};
                return this;
            }
            if (!callback) {
                delete this.subs[eventName];
                return this;
            }
            subscribers = this.subs[eventName];
            if (subscribers) {
                index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (!subscribers.length) {
                    delete this.subs[eventName];
                }
            }
            return this;
        };
    }();
var Statesman_prototype_on = function () {
        
        return function (eventName, callback) {
            var self = this, listeners, n, list;
            if (typeof eventName === 'object') {
                list = [];
                for (n in eventName) {
                    if (eventName.hasOwnProperty(n)) {
                        list[list.length] = this.on(n, eventName[n]);
                    }
                }
                return {
                    cancel: function () {
                        while (list.length) {
                            list.pop().cancel();
                        }
                    }
                };
            }
            if (!this.subs[eventName]) {
                this.subs[eventName] = [];
            }
            listeners = this.subs[eventName];
            listeners[listeners.length] = callback;
            return {
                cancel: function () {
                    self.off(eventName, callback);
                }
            };
        };
    }();
var Statesman_prototype_once = function () {
        
        return function (eventName, callback) {
            var self = this, listeners, n, list, suicidalCallback;
            if (typeof eventName === 'object') {
                list = [];
                for (n in eventName) {
                    if (eventName.hasOwnProperty(n)) {
                        list[list.length] = this.once(n, eventName[n]);
                    }
                }
                return {
                    cancel: function () {
                        while (list.length) {
                            list.pop().cancel();
                        }
                    }
                };
            }
            if (!this.subs[eventName]) {
                this.subs[eventName] = [];
            }
            listeners = this.subs[eventName];
            suicidalCallback = function () {
                callback.apply(self, arguments);
                self.off(eventName, suicidalCallback);
            };
            listeners[listeners.length] = suicidalCallback;
            return {
                cancel: function () {
                    self.off(eventName, suicidalCallback);
                }
            };
        };
    }();
var Statesman_prototype_removeComputedValue = function () {
        
        return function (keypath) {
            if (this.computed[keypath]) {
                this.computed[keypath].teardown();
            }
            return this;
        };
    }();
var Statesman_prototype_shared_notifyObservers = function () {
        
        var notifyObservers = function (statesman, keypath, directOnly) {
            var deps, i, map;
            deps = statesman.deps[keypath];
            if (deps) {
                i = deps.length;
                while (i--) {
                    deps[i].update();
                }
            }
            if (directOnly) {
                return;
            }
            map = statesman.depsMap[keypath];
            if (map) {
                i = map.length;
                while (i--) {
                    notifyObservers(statesman, map[i]);
                }
            }
        };
        notifyObservers.multiple = function (statesman, keypaths, directOnly) {
            var i;
            i = keypaths.length;
            while (i--) {
                notifyObservers(statesman, keypaths[i], directOnly);
            }
        };
        return notifyObservers;
    }();
var Statesman_prototype_reset = function (notifyObservers) {
        
        return function (data) {
            this.data = {};
            this.set(data, { silent: true });
            this.fire('reset');
            notifyObservers(this, '');
            return this;
        };
    }(Statesman_prototype_shared_notifyObservers);
var Statesman_prototype_shared_clearCache = function () {
        
        return function clearCache(statesman, keypath) {
            var children = statesman.cacheMap[keypath];
            delete statesman.cache[keypath];
            if (!children) {
                return;
            }
            while (children.length) {
                clearCache(statesman, children.pop());
            }
        };
    }();
var Statesman_prototype_set_updateModel = function () {
        
        var integerPattern = /^\s*[0-9]+\s*$/;
        return function (obj, keypath, value) {
            var key, keys = keypath.split('.');
            while (keys.length > 1) {
                key = keys.shift();
                if (!obj[key]) {
                    obj[key] = integerPattern.test(keys[0]) ? [] : {};
                }
                obj = obj[key];
            }
            obj[keys[0]] = value;
        };
    }();
var Statesman_prototype_set_set = function (get, clearCache, updateModel) {
        
        return function (statesman, keypath, value) {
            var previous, keys, computed;
            if ((computed = statesman.computed[keypath]) && !computed.setting) {
                computed.setter(value);
                return;
            }
            previous = get(statesman, keypath, null, true);
            if (previous !== value) {
                updateModel(statesman.data, keypath, value);
            } else {
                if (typeof value !== 'object') {
                    return;
                }
            }
            clearCache(statesman, keypath);
            statesman.changes[statesman.changes.length] = keypath;
            statesman.changeHash[keypath] = value;
            keys = keypath.split('.');
            while (keys.length) {
                keys.pop();
                keypath = keys.join('.');
                if (statesman.upstreamChanges[keypath]) {
                    break;
                }
                statesman.upstreamChanges[keypath] = true;
                statesman.upstreamChanges.push(keypath);
            }
        };
    }(Statesman_prototype_shared_get, Statesman_prototype_shared_clearCache, Statesman_prototype_set_updateModel);
var Statesman_prototype_set_propagateChanges = function () {
        
        return function (statesman) {
            var i, changes, upstreamChanges, keypath, computed;
            changes = statesman.changes;
            upstreamChanges = statesman.upstreamChanges;
            statesman.changes = [];
            statesman.upstreamChanges = [];
            i = upstreamChanges.length;
            while (i--) {
                keypath = upstreamChanges[i];
                propagateChange(statesman, keypath, true);
            }
            i = changes.length;
            while (i--) {
                keypath = changes[i];
                propagateChange(statesman, keypath);
            }
            while (statesman.deferred.length) {
                computed = statesman.deferred.pop();
                computed.update();
                computed.deferred = false;
            }
        };
        function propagateChange(statesman, keypath, directOnly) {
            var refs, map, i;
            refs = statesman.refs[keypath];
            if (refs) {
                i = refs.length;
                while (i--) {
                    refs[i].update();
                }
            }
            if (directOnly) {
                return;
            }
            map = statesman.refsMap[keypath];
            if (map) {
                i = map.length;
                while (i--) {
                    propagateChange(statesman, map[i]);
                }
            }
        }
    }();
var Statesman_prototype_set_mergeChanges = function () {
        
        return function (current, extra) {
            var i = extra.length, keypath;
            while (i--) {
                keypath = extra[i];
                if (!current['_' + keypath]) {
                    current['_' + keypath] = true;
                    current[current.length] = keypath;
                }
            }
        };
    }();
var Statesman_prototype_set__set = function (notifyObservers, normalise, set, propagateChanges, mergeChanges) {
        
        return function (keypath, value, options) {
            var allChanges, allUpstreamChanges, k, normalised, existingChangeHash;
            this.changes = [];
            this.upstreamChanges = [];
            existingChangeHash = this.changeHash;
            if (!existingChangeHash) {
                this.changeHash = existingChangeHash || {};
            }
            if (typeof keypath === 'object') {
                options = value;
                for (k in keypath) {
                    if (keypath.hasOwnProperty(k)) {
                        normalised = normalise(k);
                        value = keypath[k];
                        set(this, normalised, value);
                    }
                }
            } else {
                normalised = normalise(keypath);
                set(this, normalised, value);
            }
            allChanges = [];
            allUpstreamChanges = [];
            while (this.changes.length) {
                mergeChanges(allChanges, this.changes);
                mergeChanges(allUpstreamChanges, this.upstreamChanges);
                propagateChanges(this);
            }
            if (options && options.silent) {
                return this;
            }
            notifyObservers.multiple(this, allUpstreamChanges, true);
            if (allChanges.length) {
                notifyObservers.multiple(this, allChanges);
            }
            if (allChanges.length && !existingChangeHash) {
                this.fire('change', this.changeHash);
            }
            this.changeHash = existingChangeHash;
            return this;
        };
    }(Statesman_prototype_shared_notifyObservers, Statesman_prototype_shared_normalise, Statesman_prototype_set_set, Statesman_prototype_set_propagateChanges, Statesman_prototype_set_mergeChanges);
var Statesman_prototype_subset_Subset_prototype_add = function () {
        
        return function (keypath, d) {
            this.root.add(this.pathDot + keypath, d);
        };
    }();
var Statesman_prototype_subset_Subset_prototype_compute = function (compile) {
        
        return function (keypath, signature) {
            var result, k;
            if (typeof keypath === 'object') {
                result = {};
                for (k in keypath) {
                    if (keypath.hasOwnProperty(k)) {
                        result[k] = compute(this, k, keypath[k]);
                    }
                }
                return result;
            }
            return compute(this, keypath, signature);
        };
        function compute(subset, keypath, signature) {
            var path = subset.pathDot, i;
            if (typeof signature === 'string') {
                signature = compile(signature, subset.root, path);
                return subset.root.compute(path + keypath, signature);
            }
            if (typeof signature === 'function') {
                signature = signature();
            }
            if (signature.dependsOn) {
                if (typeof signature.dependsOn === 'string') {
                    signature.dependsOn = [signature.dependsOn];
                }
                i = signature.dependsOn.length;
                while (i--) {
                    signature.dependsOn = path + signature.dependsOn;
                }
            }
            if (!signature.context) {
                signature.context = subset;
            }
            return subset.root.compute(path + keypath, signature);
        }
    }(Statesman_prototype_compute_compile);
var Statesman_prototype_subset_Subset_prototype_get = function () {
        
        return function (keypath) {
            if (!keypath) {
                return this.root.get(this.path);
            }
            return this.root.get(this.pathDot + keypath);
        };
    }();
var Statesman_prototype_subset_Subset_prototype_observe = function () {
        
        return function (keypath, callback, options) {
            var k, map;
            if (typeof keypath === 'object') {
                options = callback;
                map = {};
                for (k in keypath) {
                    if (keypath.hasOwnProperty(k)) {
                        map[this.pathDot + k] = keypath[k];
                    }
                }
                if (options) {
                    options.context = options.context || this;
                } else {
                    options = { context: this };
                }
                return this.root.observe(map, options);
            }
            if (typeof keypath === 'function') {
                options = callback;
                callback = keypath;
                keypath = this.path;
            } else if (keypath === '') {
                keypath = this.path;
            } else {
                keypath = this.pathDot + keypath;
            }
            if (options) {
                options.context = options.context || this;
            } else {
                options = { context: this };
            }
            return this.root.observe(keypath, callback, options);
        };
    }();
var Statesman_prototype_subset_Subset_prototype_removeComputedValue = function () {
        
        return function (keypath) {
            this.root.removeComputedValue(this.pathDot + keypath);
            return this;
        };
    }();
var Statesman_prototype_subset_Subset_prototype_reset = function () {
        
        return function (data) {
            this.root.set(this.path, data);
            return this;
        };
    }();
var Statesman_prototype_subset_Subset_prototype_set = function () {
        
        return function (keypath, value, options) {
            var k, map;
            if (typeof keypath === 'object') {
                options = value;
                map = {};
                for (k in keypath) {
                    if (keypath.hasOwnProperty(k)) {
                        map[this.pathDot + k] = keypath[k];
                    }
                }
                this.root.set(map, options);
                return this;
            }
            this.root.set(this.pathDot + keypath, value, options);
            return this;
        };
    }();
var Statesman_prototype_subset_Subset_prototype_subset = function () {
        
        return function (keypath) {
            return this.root.subset(this.pathDot + keypath);
        };
    }();
var Statesman_prototype_subset_Subset_prototype_subtract = function () {
        
        return function (keypath, d) {
            this.root.subtract(this.pathDot + keypath, d);
        };
    }();
var Statesman_prototype_subset_Subset_prototype_toggle = function () {
        
        return function (keypath) {
            this.root.toggle(this.pathDot + keypath);
        };
    }();
var Statesman_prototype_subset_Subset__Subset = function (fire, off, on, once, add, compute, get, observe, removeComputedValue, reset, set, subset, subtract, toggle) {
        
        var Subset = function (path, state) {
            var self = this, keypathPattern, pathDotLength;
            this.path = path;
            this.pathDot = path + '.';
            this.root = state;
            this.subs = {};
            keypathPattern = new RegExp('^' + this.pathDot.replace('.', '\\.'));
            pathDotLength = this.pathDot.length;
            this.root.on('change', function (changeHash) {
                var localKeypath, keypath, unprefixed, changed;
                unprefixed = {};
                for (keypath in changeHash) {
                    if (changeHash.hasOwnProperty(keypath) && keypathPattern.test(keypath)) {
                        localKeypath = keypath.substring(pathDotLength);
                        unprefixed[localKeypath] = changeHash[keypath];
                        changed = true;
                    }
                }
                if (changed) {
                    self.fire('change', unprefixed);
                }
            });
        };
        Subset.prototype = {
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
            toJSON: get
        };
        return Subset;
    }(Statesman_prototype_fire, Statesman_prototype_off, Statesman_prototype_on, Statesman_prototype_once, Statesman_prototype_subset_Subset_prototype_add, Statesman_prototype_subset_Subset_prototype_compute, Statesman_prototype_subset_Subset_prototype_get, Statesman_prototype_subset_Subset_prototype_observe, Statesman_prototype_subset_Subset_prototype_removeComputedValue, Statesman_prototype_subset_Subset_prototype_reset, Statesman_prototype_subset_Subset_prototype_set, Statesman_prototype_subset_Subset_prototype_subset, Statesman_prototype_subset_Subset_prototype_subtract, Statesman_prototype_subset_Subset_prototype_toggle);
var Statesman_prototype_subset__subset = function (Subset) {
        
        return function (path) {
            if (!path) {
                throw 'No subset path specified';
            }
            if (!this.subsets[path]) {
                this.subsets[path] = new Subset(path, this);
            }
            return this.subsets[path];
        };
    }(Statesman_prototype_subset_Subset__Subset);
var Statesman_prototype_subtract = function (isNumeric) {
        
        return function (keypath, d) {
            var value = this.get(keypath);
            if (d === undefined) {
                d = 1;
            }
            if (isNumeric(value) && isNumeric(d)) {
                this.set(keypath, +value - (d === undefined ? 1 : +d));
            }
        };
    }(Statesman_prototype_shared_isNumeric);
var Statesman_prototype_toggle = function () {
        
        return function (keypath) {
            this.set(keypath, !this.get(keypath));
        };
    }();
var Statesman_prototype_unobserve = function (normalise, Observer) {
        
        return function (keypath) {
            var deps, i;
            keypath = keypath === undefined ? '' : normalise(keypath);
            deps = this.deps[keypath];
            if (!deps) {
                return;
            }
            i = deps.length;
            while (i--) {
                if (deps[i] instanceof Observer) {
                    deps[i].teardown();
                }
            }
        };
    }(Statesman_prototype_shared_normalise, Statesman_prototype_shared_Observer);
var Statesman_prototype_unobserveAll = function () {
        
        return function () {
            var keypath;
            for (keypath in this.deps) {
                this.unobserve(keypath);
            }
        };
    }();
var utils_create = function () {
        
        var create;
        try {
            Object.create(null);
            create = Object.create;
        } catch (err) {
            create = function () {
                var F = function () {
                };
                return function (proto, props) {
                    var obj;
                    if (proto === null) {
                        return {};
                    }
                    F.prototype = proto;
                    obj = new F();
                    if (props) {
                        Object.defineProperties(obj, props);
                    }
                    return obj;
                };
            }();
        }
        return create;
    }();
var utils_clone = function () {
        
        return function (source) {
            var target = {}, key;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
            return target;
        };
    }();
var utils_augment = function () {
        
        return function (target, source) {
            var key;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
            return target;
        };
    }();
var Statesman_extend_initChildInstance = function (circular, clone, augment) {
        
        var Statesman;
        circular.push(function () {
            Statesman = circular.Statesman;
        });
        return function (child, Child, data) {
            if (Child.data) {
                data = augment(clone(Child.data), data);
            }
            Statesman.call(child, data);
            if (Child.computed) {
                child.compute(Child.computed);
            }
            if (child.init) {
                child.init.call(child, data);
            }
        };
    }(circular, utils_clone, utils_augment);
var Statesman_extend_extendable = function () {
        
        return [
            'data',
            'computed'
        ];
    }();
var Statesman_extend_inheritFromParent = function (clone, extendable) {
        
        return function (Child, Parent) {
            extendable.forEach(function (property) {
                if (Parent[property]) {
                    Child[property] = clone(Parent[property]);
                }
            });
        };
    }(utils_clone, Statesman_extend_extendable);
var Statesman_extend_inheritFromChildProps = function (augment, extendable) {
        
        var blacklist = extendable;
        return function (Child, childProps) {
            var key, member;
            extendable.forEach(function (property) {
                var value = childProps[property];
                if (value) {
                    if (Child[property]) {
                        augment(Child[property], value);
                    } else {
                        Child[property] = value;
                    }
                }
            });
            for (key in childProps) {
                if (childProps.hasOwnProperty(key) && !Child.prototype.hasOwnProperty(key) && blacklist.indexOf(key) === -1) {
                    member = childProps[key];
                    if (typeof member === 'function' && typeof Child.prototype[key] === 'function') {
                        Child.prototype[key] = wrapMethod(member, Child.prototype[key]);
                    } else {
                        Child.prototype[key] = member;
                    }
                }
            }
        };
        function wrapMethod(method, superMethod) {
            if (/_super/.test(method)) {
                return function () {
                    var _super = this._super, result;
                    this._super = superMethod;
                    result = method.apply(this, arguments);
                    this._super = _super;
                    return result;
                };
            } else {
                return method;
            }
        }
    }(utils_augment, Statesman_extend_extendable);
var Statesman_extend__extend = function (circular, create, initChildInstance, inheritFromParent, inheritFromChildProps) {
        
        var Statesman;
        circular.push(function () {
            Statesman = circular.Statesman;
        });
        return function extend(childProps) {
            var Parent = this, Child;
            if (!childProps) {
                childProps = {};
            }
            Child = function (data) {
                initChildInstance(this, Child, data || {});
            };
            Child.prototype = create(Parent.prototype);
            if (Parent !== Statesman) {
                inheritFromParent(Child, Parent);
            }
            inheritFromChildProps(Child, childProps);
            Child.extend = extend;
            return Child;
        };
    }(circular, utils_create, Statesman_extend_initChildInstance, Statesman_extend_inheritFromParent, Statesman_extend_inheritFromChildProps);
var Statesman__Statesman = function (circular, defineProperties, add, compute, fire, get, observe, off, on, once, removeComputedValue, reset, set, subset, subtract, toggle, unobserve, unobserveAll, extend) {
        
        var Statesman = function (data) {
            defineProperties(this, {
                data: {
                    value: data || {},
                    writable: true
                },
                subs: {
                    value: {},
                    writable: true
                },
                cache: { value: {} },
                cacheMap: { value: {} },
                deps: { value: {} },
                depsMap: { value: {} },
                refs: { value: {} },
                refsMap: { value: {} },
                computed: { value: {} },
                subsets: { value: {} },
                deferred: { value: [] },
                changes: {
                    value: null,
                    writable: true
                },
                upstreamChanges: {
                    value: null,
                    writable: true
                },
                changeHash: {
                    value: null,
                    writable: true
                }
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
        Statesman.extend = extend;
        circular.Statesman = Statesman;
        return Statesman;
    }(circular, utils_defineProperties, Statesman_prototype_add, Statesman_prototype_compute__compute, Statesman_prototype_fire, Statesman_prototype_get, Statesman_prototype_observe__observe, Statesman_prototype_off, Statesman_prototype_on, Statesman_prototype_once, Statesman_prototype_removeComputedValue, Statesman_prototype_reset, Statesman_prototype_set__set, Statesman_prototype_subset__subset, Statesman_prototype_subtract, Statesman_prototype_toggle, Statesman_prototype_unobserve, Statesman_prototype_unobserveAll, Statesman_extend__extend);
var Statesman = function (Statesman, circular) {
        
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (needle, i) {
                var len;
                if (i === undefined) {
                    i = 0;
                }
                if (i < 0) {
                    i += this.length;
                }
                if (i < 0) {
                    i = 0;
                }
                for (len = this.length; i < len; i++) {
                    if (i in this && this[i] === needle) {
                        return i;
                    }
                }
                return -1;
            };
        }
        while (circular.length) {
            circular.pop()();
        }
        return Statesman;
    }(Statesman__Statesman, circular);
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
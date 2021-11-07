
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    var _baseTimes = baseTimes;

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    var identity_1 = identity;

    /**
     * Casts `value` to `identity` if it's not a function.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Function} Returns cast function.
     */
    function castFunction(value) {
      return typeof value == 'function' ? value : identity_1;
    }

    var _castFunction = castFunction;

    /** Used to match a single whitespace character. */
    var reWhitespace = /\s/;

    /**
     * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
     * character of `string`.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {number} Returns the index of the last non-whitespace character.
     */
    function trimmedEndIndex(string) {
      var index = string.length;

      while (index-- && reWhitespace.test(string.charAt(index))) {}
      return index;
    }

    var _trimmedEndIndex = trimmedEndIndex;

    /** Used to match leading whitespace. */
    var reTrimStart = /^\s+/;

    /**
     * The base implementation of `_.trim`.
     *
     * @private
     * @param {string} string The string to trim.
     * @returns {string} Returns the trimmed string.
     */
    function baseTrim(string) {
      return string
        ? string.slice(0, _trimmedEndIndex(string) + 1).replace(reTrimStart, '')
        : string;
    }

    var _baseTrim = baseTrim;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1 = isObject;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto$f = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$c = objectProto$f.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$f.toString;

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty$c.call(value, symToStringTag$1),
          tag = value[symToStringTag$1];

      try {
        value[symToStringTag$1] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString$1.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag$1] = tag;
        } else {
          delete value[symToStringTag$1];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$e = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto$e.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var symbolTag$3 = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike_1(value) && _baseGetTag(value) == symbolTag$3);
    }

    var isSymbol_1 = isSymbol;

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol_1(value)) {
        return NAN;
      }
      if (isObject_1(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject_1(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = _baseTrim(value);
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    var toNumber_1 = toNumber;

    /** Used as references for various `Number` constants. */
    var INFINITY$2 = 1 / 0,
        MAX_INTEGER = 1.7976931348623157e+308;

    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber_1(value);
      if (value === INFINITY$2 || value === -INFINITY$2) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    var toFinite_1 = toFinite;

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger$1(value) {
      var result = toFinite_1(value),
          remainder = result % 1;

      return result === result ? (remainder ? result - remainder : result) : 0;
    }

    var toInteger_1 = toInteger$1;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$2 = 9007199254740991;

    /** Used as references for the maximum length and index of an array. */
    var MAX_ARRAY_LENGTH = 4294967295;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMin = Math.min;

    /**
     * Invokes the iteratee `n` times, returning an array of the results of
     * each invocation. The iteratee is invoked with one argument; (index).
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * _.times(3, String);
     * // => ['0', '1', '2']
     *
     *  _.times(4, _.constant(0));
     * // => [0, 0, 0, 0]
     */
    function times(n, iteratee) {
      n = toInteger_1(n);
      if (n < 1 || n > MAX_SAFE_INTEGER$2) {
        return [];
      }
      var index = MAX_ARRAY_LENGTH,
          length = nativeMin(n, MAX_ARRAY_LENGTH);

      iteratee = _castFunction(iteratee);
      n -= MAX_ARRAY_LENGTH;

      var result = _baseTimes(length, iteratee);
      while (++index < n) {
        iteratee(index);
      }
      return result;
    }

    var times_1 = times;

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    var _arrayEach = arrayEach;

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    var _createBaseFor = createBaseFor;

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = _createBaseFor();

    var _baseFor = baseFor;

    /** `Object#toString` result references. */
    var argsTag$3 = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike_1(value) && _baseGetTag(value) == argsTag$3;
    }

    var _baseIsArguments = baseIsArguments;

    /** Used for built-in method references. */
    var objectProto$d = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$b = objectProto$d.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$d.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
      return isObjectLike_1(value) && hasOwnProperty$b.call(value, 'callee') &&
        !propertyIsEnumerable$1.call(value, 'callee');
    };

    var isArguments_1 = isArguments;

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    var isArray_1 = isArray;

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    var stubFalse_1 = stubFalse;

    var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
    });

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$1 : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    var _isIndex = isIndex;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    var isLength_1 = isLength;

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]',
        arrayTag$2 = '[object Array]',
        boolTag$3 = '[object Boolean]',
        dateTag$3 = '[object Date]',
        errorTag$2 = '[object Error]',
        funcTag$2 = '[object Function]',
        mapTag$6 = '[object Map]',
        numberTag$3 = '[object Number]',
        objectTag$3 = '[object Object]',
        regexpTag$3 = '[object RegExp]',
        setTag$6 = '[object Set]',
        stringTag$3 = '[object String]',
        weakMapTag$2 = '[object WeakMap]';

    var arrayBufferTag$3 = '[object ArrayBuffer]',
        dataViewTag$4 = '[object DataView]',
        float32Tag$2 = '[object Float32Array]',
        float64Tag$2 = '[object Float64Array]',
        int8Tag$2 = '[object Int8Array]',
        int16Tag$2 = '[object Int16Array]',
        int32Tag$2 = '[object Int32Array]',
        uint8Tag$2 = '[object Uint8Array]',
        uint8ClampedTag$2 = '[object Uint8ClampedArray]',
        uint16Tag$2 = '[object Uint16Array]',
        uint32Tag$2 = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
    typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
    typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
    typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
    typedArrayTags[uint32Tag$2] = true;
    typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] =
    typedArrayTags[arrayBufferTag$3] = typedArrayTags[boolTag$3] =
    typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$3] =
    typedArrayTags[errorTag$2] = typedArrayTags[funcTag$2] =
    typedArrayTags[mapTag$6] = typedArrayTags[numberTag$3] =
    typedArrayTags[objectTag$3] = typedArrayTags[regexpTag$3] =
    typedArrayTags[setTag$6] = typedArrayTags[stringTag$3] =
    typedArrayTags[weakMapTag$2] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike_1(value) &&
        isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
    }

    var _baseIsTypedArray = baseIsTypedArray;

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    var _baseUnary = baseUnary;

    var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    module.exports = nodeUtil;
    });

    /* Node.js helper references. */
    var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

    var isTypedArray_1 = isTypedArray;

    /** Used for built-in method references. */
    var objectProto$c = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$a = objectProto$c.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray_1(value),
          isArg = !isArr && isArguments_1(value),
          isBuff = !isArr && !isArg && isBuffer_1(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? _baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$a.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               _isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    var _arrayLikeKeys = arrayLikeKeys;

    /** Used for built-in method references. */
    var objectProto$b = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$b;

      return value === proto;
    }

    var _isPrototype = isPrototype;

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    var _overArg = overArg;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = _overArg(Object.keys, Object);

    var _nativeKeys = nativeKeys;

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$a.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!_isPrototype(object)) {
        return _nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$9.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeys = baseKeys;

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag$1 = '[object Function]',
        genTag$1 = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject_1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = _baseGetTag(value);
      return tag == funcTag$1 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
    }

    var isFunction_1 = isFunction;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength_1(value.length) && !isFunction_1(value);
    }

    var isArrayLike_1 = isArrayLike;

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
    }

    var keys_1 = keys;

    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return object && _baseFor(object, iteratee, keys_1);
    }

    var _baseForOwn = baseForOwn;

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike_1(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    var _createBaseEach = createBaseEach;

    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEach = _createBaseEach(_baseForOwn);

    var _baseEach = baseEach;

    /**
     * Iterates over elements of `collection` and invokes `iteratee` for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length"
     * property are iterated like arrays. To avoid this behavior use `_.forIn`
     * or `_.forOwn` for object iteration.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias each
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEachRight
     * @example
     *
     * _.forEach([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `1` then `2`.
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forEach(collection, iteratee) {
      var func = isArray_1(collection) ? _arrayEach : _baseEach;
      return func(collection, _castFunction(iteratee));
    }

    var forEach_1 = forEach;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = _root['__core-js_shared__'];

    var _coreJsData = coreJsData;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    var _isMasked = isMasked;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    var _toSource = toSource;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto = Function.prototype,
        objectProto$9 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$9.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty$8).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject_1(value) || _isMasked(value)) {
        return false;
      }
      var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
      return pattern.test(_toSource(value));
    }

    var _baseIsNative = baseIsNative;

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    var _getValue = getValue;

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = _getValue(object, key);
      return _baseIsNative(value) ? value : undefined;
    }

    var _getNative = getNative;

    var defineProperty = (function() {
      try {
        var func = _getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    var _defineProperty = defineProperty;

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && _defineProperty) {
        _defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    var _baseAssignValue = baseAssignValue;

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    var eq_1 = eq;

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$7.call(object, key) && eq_1(objValue, value)) ||
          (value === undefined && !(key in object))) {
        _baseAssignValue(object, key, value);
      }
    }

    var _assignValue = assignValue;

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray_1(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol_1(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    var _isKey = isKey;

    /* Built-in method references that are verified to be native. */
    var nativeCreate = _getNative(Object, 'create');

    var _nativeCreate = nativeCreate;

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
      this.size = 0;
    }

    var _hashClear = hashClear;

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    var _hashDelete = hashDelete;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (_nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED$2 ? undefined : result;
      }
      return hasOwnProperty$6.call(data, key) ? data[key] : undefined;
    }

    var _hashGet = hashGet;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$5.call(data, key);
    }

    var _hashHas = hashHas;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    var _hashSet = hashSet;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = _hashClear;
    Hash.prototype['delete'] = _hashDelete;
    Hash.prototype.get = _hashGet;
    Hash.prototype.has = _hashHas;
    Hash.prototype.set = _hashSet;

    var _Hash = Hash;

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    var _listCacheClear = listCacheClear;

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq_1(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    var _assocIndexOf = assocIndexOf;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    var _listCacheDelete = listCacheDelete;

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    var _listCacheGet = listCacheGet;

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return _assocIndexOf(this.__data__, key) > -1;
    }

    var _listCacheHas = listCacheHas;

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    var _listCacheSet = listCacheSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = _listCacheClear;
    ListCache.prototype['delete'] = _listCacheDelete;
    ListCache.prototype.get = _listCacheGet;
    ListCache.prototype.has = _listCacheHas;
    ListCache.prototype.set = _listCacheSet;

    var _ListCache = ListCache;

    /* Built-in method references that are verified to be native. */
    var Map$1 = _getNative(_root, 'Map');

    var _Map = Map$1;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new _Hash,
        'map': new (_Map || _ListCache),
        'string': new _Hash
      };
    }

    var _mapCacheClear = mapCacheClear;

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    var _isKeyable = isKeyable;

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return _isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    var _getMapData = getMapData;

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = _getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    var _mapCacheDelete = mapCacheDelete;

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return _getMapData(this, key).get(key);
    }

    var _mapCacheGet = mapCacheGet;

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return _getMapData(this, key).has(key);
    }

    var _mapCacheHas = mapCacheHas;

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = _getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    var _mapCacheSet = mapCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = _mapCacheClear;
    MapCache.prototype['delete'] = _mapCacheDelete;
    MapCache.prototype.get = _mapCacheGet;
    MapCache.prototype.has = _mapCacheHas;
    MapCache.prototype.set = _mapCacheSet;

    var _MapCache = MapCache;

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || _MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = _MapCache;

    var memoize_1 = memoize;

    /** Used as the maximum memoize cache size. */
    var MAX_MEMOIZE_SIZE = 500;

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize_1(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    var _memoizeCapped = memoizeCapped;

    /** Used to match property names within property paths. */
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = _memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46 /* . */) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    var _stringToPath = stringToPath;

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    var _arrayMap = arrayMap;

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$2 = _Symbol ? _Symbol.prototype : undefined,
        symbolToString = symbolProto$2 ? symbolProto$2.toString : undefined;

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray_1(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return _arrayMap(value, baseToString) + '';
      }
      if (isSymbol_1(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    var _baseToString = baseToString;

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : _baseToString(value);
    }

    var toString_1 = toString;

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value, object) {
      if (isArray_1(value)) {
        return value;
      }
      return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
    }

    var _castPath = castPath;

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol_1(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    var _toKey = toKey;

    /**
     * The base implementation of `_.set`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @param {Function} [customizer] The function to customize path creation.
     * @returns {Object} Returns `object`.
     */
    function baseSet(object, path, value, customizer) {
      if (!isObject_1(object)) {
        return object;
      }
      path = _castPath(path, object);

      var index = -1,
          length = path.length,
          lastIndex = length - 1,
          nested = object;

      while (nested != null && ++index < length) {
        var key = _toKey(path[index]),
            newValue = value;

        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return object;
        }

        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = isObject_1(objValue)
              ? objValue
              : (_isIndex(path[index + 1]) ? [] : {});
          }
        }
        _assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }

    var _baseSet = baseSet;

    /**
     * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
     * it's created. Arrays are created for missing index properties while objects
     * are created for all other missing properties. Use `_.setWith` to customize
     * `path` creation.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.set(object, 'a[0].b.c', 4);
     * console.log(object.a[0].b.c);
     * // => 4
     *
     * _.set(object, ['x', '0', 'y', 'z'], 5);
     * console.log(object.x[0].y.z);
     * // => 5
     */
    function set(object, path, value) {
      return object == null ? object : _baseSet(object, path, value);
    }

    var set_1 = set;

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new _ListCache;
      this.size = 0;
    }

    var _stackClear = stackClear;

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    var _stackDelete = stackDelete;

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    var _stackGet = stackGet;

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    var _stackHas = stackHas;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof _ListCache) {
        var pairs = data.__data__;
        if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new _MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    var _stackSet = stackSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new _ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = _stackClear;
    Stack.prototype['delete'] = _stackDelete;
    Stack.prototype.get = _stackGet;
    Stack.prototype.has = _stackHas;
    Stack.prototype.set = _stackSet;

    var _Stack = Stack;

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          _baseAssignValue(object, key, newValue);
        } else {
          _assignValue(object, key, newValue);
        }
      }
      return object;
    }

    var _copyObject = copyObject;

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && _copyObject(source, keys_1(source), object);
    }

    var _baseAssign = baseAssign;

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    var _nativeKeysIn = nativeKeysIn;

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject_1(object)) {
        return _nativeKeysIn(object);
      }
      var isProto = _isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty$4.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeysIn = baseKeysIn;

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
    }

    var keysIn_1 = keysIn;

    /**
     * The base implementation of `_.assignIn` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssignIn(object, source) {
      return object && _copyObject(source, keysIn_1(source), object);
    }

    var _baseAssignIn = baseAssignIn;

    var _cloneBuffer = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    module.exports = cloneBuffer;
    });

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    var _copyArray = copyArray;

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    var _arrayFilter = arrayFilter;

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    var stubArray_1 = stubArray;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$4.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return _arrayFilter(nativeGetSymbols$1(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };

    var _getSymbols = getSymbols;

    /**
     * Copies own symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return _copyObject(source, _getSymbols(source), object);
    }

    var _copySymbols = copySymbols;

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    var _arrayPush = arrayPush;

    /** Built-in value references. */
    var getPrototype = _overArg(Object.getPrototypeOf, Object);

    var _getPrototype = getPrototype;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own and inherited enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols ? stubArray_1 : function(object) {
      var result = [];
      while (object) {
        _arrayPush(result, _getSymbols(object));
        object = _getPrototype(object);
      }
      return result;
    };

    var _getSymbolsIn = getSymbolsIn;

    /**
     * Copies own and inherited symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbolsIn(source, object) {
      return _copyObject(source, _getSymbolsIn(source), object);
    }

    var _copySymbolsIn = copySymbolsIn;

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
    }

    var _baseGetAllKeys = baseGetAllKeys;

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return _baseGetAllKeys(object, keys_1, _getSymbols);
    }

    var _getAllKeys = getAllKeys;

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
    }

    var _getAllKeysIn = getAllKeysIn;

    /* Built-in method references that are verified to be native. */
    var DataView = _getNative(_root, 'DataView');

    var _DataView = DataView;

    /* Built-in method references that are verified to be native. */
    var Promise$1 = _getNative(_root, 'Promise');

    var _Promise = Promise$1;

    /* Built-in method references that are verified to be native. */
    var Set$1 = _getNative(_root, 'Set');

    var _Set = Set$1;

    /* Built-in method references that are verified to be native. */
    var WeakMap = _getNative(_root, 'WeakMap');

    var _WeakMap = WeakMap;

    /** `Object#toString` result references. */
    var mapTag$5 = '[object Map]',
        objectTag$2 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag$5 = '[object Set]',
        weakMapTag$1 = '[object WeakMap]';

    var dataViewTag$3 = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = _toSource(_DataView),
        mapCtorString = _toSource(_Map),
        promiseCtorString = _toSource(_Promise),
        setCtorString = _toSource(_Set),
        weakMapCtorString = _toSource(_WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = _baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$3) ||
        (_Map && getTag(new _Map) != mapTag$5) ||
        (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
        (_Set && getTag(new _Set) != setTag$5) ||
        (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
      getTag = function(value) {
        var result = _baseGetTag(value),
            Ctor = result == objectTag$2 ? value.constructor : undefined,
            ctorString = Ctor ? _toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$3;
            case mapCtorString: return mapTag$5;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$5;
            case weakMapCtorString: return weakMapTag$1;
          }
        }
        return result;
      };
    }

    var _getTag = getTag;

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty$3.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    var _initCloneArray = initCloneArray;

    /** Built-in value references. */
    var Uint8Array = _root.Uint8Array;

    var _Uint8Array = Uint8Array;

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
      return result;
    }

    var _cloneArrayBuffer = cloneArrayBuffer;

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    var _cloneDataView = cloneDataView;

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    var _cloneRegExp = cloneRegExp;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf$1 = symbolProto$1 ? symbolProto$1.valueOf : undefined;

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
    }

    var _cloneSymbol = cloneSymbol;

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    var _cloneTypedArray = cloneTypedArray;

    /** `Object#toString` result references. */
    var boolTag$2 = '[object Boolean]',
        dateTag$2 = '[object Date]',
        mapTag$4 = '[object Map]',
        numberTag$2 = '[object Number]',
        regexpTag$2 = '[object RegExp]',
        setTag$4 = '[object Set]',
        stringTag$2 = '[object String]',
        symbolTag$2 = '[object Symbol]';

    var arrayBufferTag$2 = '[object ArrayBuffer]',
        dataViewTag$2 = '[object DataView]',
        float32Tag$1 = '[object Float32Array]',
        float64Tag$1 = '[object Float64Array]',
        int8Tag$1 = '[object Int8Array]',
        int16Tag$1 = '[object Int16Array]',
        int32Tag$1 = '[object Int32Array]',
        uint8Tag$1 = '[object Uint8Array]',
        uint8ClampedTag$1 = '[object Uint8ClampedArray]',
        uint16Tag$1 = '[object Uint16Array]',
        uint32Tag$1 = '[object Uint32Array]';

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag$2:
          return _cloneArrayBuffer(object);

        case boolTag$2:
        case dateTag$2:
          return new Ctor(+object);

        case dataViewTag$2:
          return _cloneDataView(object, isDeep);

        case float32Tag$1: case float64Tag$1:
        case int8Tag$1: case int16Tag$1: case int32Tag$1:
        case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
          return _cloneTypedArray(object, isDeep);

        case mapTag$4:
          return new Ctor;

        case numberTag$2:
        case stringTag$2:
          return new Ctor(object);

        case regexpTag$2:
          return _cloneRegExp(object);

        case setTag$4:
          return new Ctor;

        case symbolTag$2:
          return _cloneSymbol(object);
      }
    }

    var _initCloneByTag = initCloneByTag;

    /** Built-in value references. */
    var objectCreate = Object.create;

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject_1(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    var _baseCreate = baseCreate;

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !_isPrototype(object))
        ? _baseCreate(_getPrototype(object))
        : {};
    }

    var _initCloneObject = initCloneObject;

    /** `Object#toString` result references. */
    var mapTag$3 = '[object Map]';

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike_1(value) && _getTag(value) == mapTag$3;
    }

    var _baseIsMap = baseIsMap;

    /* Node.js helper references. */
    var nodeIsMap = _nodeUtil && _nodeUtil.isMap;

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;

    var isMap_1 = isMap;

    /** `Object#toString` result references. */
    var setTag$3 = '[object Set]';

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike_1(value) && _getTag(value) == setTag$3;
    }

    var _baseIsSet = baseIsSet;

    /* Node.js helper references. */
    var nodeIsSet = _nodeUtil && _nodeUtil.isSet;

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;

    var isSet_1 = isSet;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG$1 = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG$1 = 4;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        errorTag$1 = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag$2 = '[object Map]',
        numberTag$1 = '[object Number]',
        objectTag$1 = '[object Object]',
        regexpTag$1 = '[object RegExp]',
        setTag$2 = '[object Set]',
        stringTag$1 = '[object String]',
        symbolTag$1 = '[object Symbol]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$1 = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag$1] = cloneableTags[arrayTag$1] =
    cloneableTags[arrayBufferTag$1] = cloneableTags[dataViewTag$1] =
    cloneableTags[boolTag$1] = cloneableTags[dateTag$1] =
    cloneableTags[float32Tag] = cloneableTags[float64Tag] =
    cloneableTags[int8Tag] = cloneableTags[int16Tag] =
    cloneableTags[int32Tag] = cloneableTags[mapTag$2] =
    cloneableTags[numberTag$1] = cloneableTags[objectTag$1] =
    cloneableTags[regexpTag$1] = cloneableTags[setTag$2] =
    cloneableTags[stringTag$1] = cloneableTags[symbolTag$1] =
    cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
    cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag$1] = cloneableTags[funcTag] =
    cloneableTags[weakMapTag] = false;

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Deep clone
     *  2 - Flatten inherited properties
     *  4 - Clone symbols
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG$1,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG$1;

      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject_1(value)) {
        return value;
      }
      var isArr = isArray_1(value);
      if (isArr) {
        result = _initCloneArray(value);
        if (!isDeep) {
          return _copyArray(value, result);
        }
      } else {
        var tag = _getTag(value),
            isFunc = tag == funcTag || tag == genTag;

        if (isBuffer_1(value)) {
          return _cloneBuffer(value, isDeep);
        }
        if (tag == objectTag$1 || tag == argsTag$1 || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : _initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? _copySymbolsIn(value, _baseAssignIn(result, value))
              : _copySymbols(value, _baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = _initCloneByTag(value, tag, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new _Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (isSet_1(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap_1(value)) {
        value.forEach(function(subValue, key) {
          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
      }

      var keysFunc = isFull
        ? (isFlat ? _getAllKeysIn : _getAllKeys)
        : (isFlat ? keysIn_1 : keys_1);

      var props = isArr ? undefined : keysFunc(value);
      _arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }

    var _baseClone = baseClone;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG = 1,
        CLONE_SYMBOLS_FLAG = 4;

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return _baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
    }

    var cloneDeep_1 = cloneDeep;

    /**
     * The base implementation of `_.filter` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function baseFilter(collection, predicate) {
      var result = [];
      _baseEach(collection, function(value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }

    var _baseFilter = baseFilter;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }

    var _setCacheAdd = setCacheAdd;

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    var _setCacheHas = setCacheHas;

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new _MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
    SetCache.prototype.has = _setCacheHas;

    var _SetCache = SetCache;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    var _arraySome = arraySome;

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    var _cacheHas = cacheHas;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$5 = 1,
        COMPARE_UNORDERED_FLAG$3 = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Check that cyclic values are equal.
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new _SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!_arraySome(other, function(othValue, othIndex) {
                if (!_cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    var _equalArrays = equalArrays;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    var _mapToArray = mapToArray;

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    var _setToArray = setToArray;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$4 = 1,
        COMPARE_UNORDERED_FLAG$2 = 2;

    /** `Object#toString` result references. */
    var boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        mapTag$1 = '[object Map]',
        numberTag = '[object Number]',
        regexpTag = '[object RegExp]',
        setTag$1 = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]';

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
        case numberTag:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq_1(+object, +other);

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag$1:
          var convert = _mapToArray;

        case setTag$1:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
          convert || (convert = _setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG$2;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    var _equalByTag = equalByTag;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$3 = 1;

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
          objProps = _getAllKeys(object),
          objLength = objProps.length,
          othProps = _getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$2.call(other, key))) {
          return false;
        }
      }
      // Check that cyclic values are equal.
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    var _equalObjects = equalObjects;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$2 = 1;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        objectTag = '[object Object]';

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray_1(object),
          othIsArr = isArray_1(other),
          objTag = objIsArr ? arrayTag : _getTag(object),
          othTag = othIsArr ? arrayTag : _getTag(other);

      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;

      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer_1(object)) {
        if (!isBuffer_1(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new _Stack);
        return (objIsArr || isTypedArray_1(object))
          ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
        var objIsWrapped = objIsObj && hasOwnProperty$1.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty$1.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new _Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new _Stack);
      return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    var _baseIsEqualDeep = baseIsEqualDeep;

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
        return value !== value && other !== other;
      }
      return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    var _baseIsEqual = baseIsEqual;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$1 = 1,
        COMPARE_UNORDERED_FLAG$1 = 2;

    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new _Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    var _baseIsMatch = baseIsMatch;

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject_1(value);
    }

    var _isStrictComparable = isStrictComparable;

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys_1(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, _isStrictComparable(value)];
      }
      return result;
    }

    var _getMatchData = getMatchData;

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    var _matchesStrictComparable = matchesStrictComparable;

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = _getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || _baseIsMatch(object, source, matchData);
      };
    }

    var _baseMatches = baseMatches;

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = _castPath(path, object);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[_toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    var _baseGet = baseGet;

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : _baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    var get_1 = get;

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    var _baseHasIn = baseHasIn;

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = _castPath(path, object);

      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = _toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength_1(length) && _isIndex(key, length) &&
        (isArray_1(object) || isArguments_1(object));
    }

    var _hasPath = hasPath;

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && _hasPath(object, path, _baseHasIn);
    }

    var hasIn_1 = hasIn;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (_isKey(path) && _isStrictComparable(srcValue)) {
        return _matchesStrictComparable(_toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get_1(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn_1(object, path)
          : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
      };
    }

    var _baseMatchesProperty = baseMatchesProperty;

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    var _baseProperty = baseProperty;

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return _baseGet(object, path);
      };
    }

    var _basePropertyDeep = basePropertyDeep;

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
    }

    var property_1 = property;

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity_1;
      }
      if (typeof value == 'object') {
        return isArray_1(value)
          ? _baseMatchesProperty(value[0], value[1])
          : _baseMatches(value);
      }
      return property_1(value);
    }

    var _baseIteratee = baseIteratee;

    /**
     * Iterates over elements of `collection`, returning an array of all elements
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * **Note:** Unlike `_.remove`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     * @see _.reject
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.filter(users, function(o) { return !o.active; });
     * // => objects for ['fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.filter(users, { 'age': 36, 'active': true });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.filter(users, ['active', false]);
     * // => objects for ['fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.filter(users, 'active');
     * // => objects for ['barney']
     *
     * // Combining several predicates using `_.overEvery` or `_.overSome`.
     * _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
     * // => objects for ['fred', 'barney']
     */
    function filter(collection, predicate) {
      var func = isArray_1(collection) ? _arrayFilter : _baseFilter;
      return func(collection, _baseIteratee(predicate));
    }

    var filter_1 = filter;

    /**
     * The base implementation of `_.sum` and `_.sumBy` without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {number} Returns the sum.
     */
    function baseSum(array, iteratee) {
      var result,
          index = -1,
          length = array.length;

      while (++index < length) {
        var current = iteratee(array[index]);
        if (current !== undefined) {
          result = result === undefined ? current : (result + current);
        }
      }
      return result;
    }

    var _baseSum = baseSum;

    /**
     * Computes the sum of the values in `array`.
     *
     * @static
     * @memberOf _
     * @since 3.4.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {number} Returns the sum.
     * @example
     *
     * _.sum([4, 2, 8, 6]);
     * // => 20
     */
    function sum(array) {
      return (array && array.length)
        ? _baseSum(array, identity_1)
        : 0;
    }

    var sum_1 = sum;

    /**
     * Creates a `_.find` or `_.findLast` function.
     *
     * @private
     * @param {Function} findIndexFunc The function to find the collection index.
     * @returns {Function} Returns the new find function.
     */
    function createFind(findIndexFunc) {
      return function(collection, predicate, fromIndex) {
        var iterable = Object(collection);
        if (!isArrayLike_1(collection)) {
          var iteratee = _baseIteratee(predicate);
          collection = keys_1(collection);
          predicate = function(key) { return iteratee(iterable[key], key, iterable); };
        }
        var index = findIndexFunc(collection, predicate, fromIndex);
        return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
      };
    }

    var _createFind = createFind;

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    var _baseFindIndex = baseFindIndex;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.findIndex(users, function(o) { return o.user == 'barney'; });
     * // => 0
     *
     * // The `_.matches` iteratee shorthand.
     * _.findIndex(users, { 'user': 'fred', 'active': false });
     * // => 1
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findIndex(users, ['active', false]);
     * // => 0
     *
     * // The `_.property` iteratee shorthand.
     * _.findIndex(users, 'active');
     * // => 2
     */
    function findIndex$1(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = fromIndex == null ? 0 : toInteger_1(fromIndex);
      if (index < 0) {
        index = nativeMax(length + index, 0);
      }
      return _baseFindIndex(array, _baseIteratee(predicate), index);
    }

    var findIndex_1 = findIndex$1;

    /**
     * Iterates over elements of `collection`, returning the first element
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': true },
     *   { 'user': 'fred',    'age': 40, 'active': false },
     *   { 'user': 'pebbles', 'age': 1,  'active': true }
     * ];
     *
     * _.find(users, function(o) { return o.age < 40; });
     * // => object for 'barney'
     *
     * // The `_.matches` iteratee shorthand.
     * _.find(users, { 'age': 1, 'active': true });
     * // => object for 'pebbles'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.find(users, ['active', false]);
     * // => object for 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.find(users, 'active');
     * // => object for 'barney'
     */
    var find = _createFind(findIndex_1);

    var find_1 = find;

    const upgrades$1 = [
    	{
    		id: 0,
    		title: 'Extra Control Rod I',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [],
    		researchRequirements: [],
    		cost: {
    			energy: 100000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 1,
    		title: 'Extra Control Rod II',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [0],
    		researchRequirements: [],
    		cost: {
    			energy: 1000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 2,
    		title: 'Extra Control Rod III',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [1],
    		researchRequirements: [],
    		cost: {
    			energy: 10000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 3,
    		title: 'Extra Control Rod IV',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [2],
    		researchRequirements: [],
    		cost: {
    			energy: 100000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 4,
    		title: 'Extra Control Rod V',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [3],
    		researchRequirements: [],
    		cost: {
    			energy: 1000000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 5,
    		title: 'Increase Power Cap I',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 10000,
    		},
    	},
    	{
    		id: 6,
    		title: 'Increase Power Cap II',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [5],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 25000,
    		},
    	},
    	{
    		id: 7,
    		title: 'Increase Power Cap III',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [6],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 50000,
    		},
    	},
    	{
    		id: 8,
    		title: 'Increase Power Cap IV',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [7],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 100000,
    		},
    	},
    	{
    		id: 9,
    		title: 'Increase Power Cap V',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [8],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 500000,
    		},
    	},
    	{
    		id: 10,
    		title: 'Expanded Batteries I',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 5000,
    		},
    	},
    	{
    		id: 11,
    		title: 'Expanded Batteries II',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [10],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 10000,
    		},
    	},
    	{
    		id: 12,
    		title: 'Expanded Batteries III',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [11],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 15000,
    		},
    	},
    	{
    		id: 13,
    		title: 'Expanded Batteries IV',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [12],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 20000,
    		},
    	},
    	{
    		id: 14,
    		title: 'Expanded Batteries V',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [13],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 25000,
    		},
    	},
    	{
    		id: 15,
    		title: 'Moderator Coolant I',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 30000,
    		},
    	},
    	{
    		id: 16,
    		title: 'Moderator Coolant II',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [15],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 32000,
    		},
    	},
    	{
    		id: 17,
    		title: 'Moderator Coolant III',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [16],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 34000,
    		},
    	},
    	{
    		id: 18,
    		title: 'Moderator Coolant IV',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [17],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 38000,
    		},
    	},
    	{
    		id: 19,
    		title: 'Moderator Coolant V',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [18],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 40000,
    		},
    	},
    	{
    		id: 20,
    		title: 'Tachyonic antitelephone',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 40000,
    		},
    	},
    	{
    		id: 21,
    		title: 'Particle collider',
    		description: 'Used for researching advanced ',
    		lore: 'tbd',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 40000,
    		},
    	},
    ];

    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
      }

      var number = Number(dirtyNumber);

      if (isNaN(number)) {
        return number;
      }

      return number < 0 ? Math.ceil(number) : Math.floor(number);
    }

    function requiredArgs(required, args) {
      if (args.length < required) {
        throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
      }
    }

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If the argument is none of the above, the function returns Invalid Date.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     *
     * @param {Date|Number} argument - the value to convert
     * @returns {Date} the parsed date in the local time zone
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Clone the date:
     * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert the timestamp to date:
     * const result = toDate(1392098430000)
     * //=> Tue Feb 11 2014 11:30:30
     */

    function toDate(argument) {
      requiredArgs(1, arguments);
      var argStr = Object.prototype.toString.call(argument); // Clone the date

      if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument);
      } else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"); // eslint-disable-next-line no-console

          console.warn(new Error().stack);
        }

        return new Date(NaN);
      }
    }

    /**
     * @name addMilliseconds
     * @category Millisecond Helpers
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds added
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * const result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */

    function addMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var timestamp = toDate(dirtyDate).getTime();
      var amount = toInteger(dirtyAmount);
      return new Date(timestamp + amount);
    }

    var MILLISECONDS_IN_HOUR = 3600000;
    /**
     * @name addHours
     * @category Hour Helpers
     * @summary Add the specified number of hours to the given date.
     *
     * @description
     * Add the specified number of hours to the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of hours to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the hours added
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Add 2 hours to 10 July 2014 23:00:00:
     * const result = addHours(new Date(2014, 6, 10, 23, 0), 2)
     * //=> Fri Jul 11 2014 01:00:00
     */

    function addHours(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var amount = toInteger(dirtyAmount);
      return addMilliseconds(dirtyDate, amount * MILLISECONDS_IN_HOUR);
    }

    const getDate = (ticks) => {
    	const startDate = new Date(2030, 1, 1);

    	return addHours(startDate, ticks * 12);
    };

    /**
     * @name getYear
     * @category Year Helpers
     * @summary Get the year of the given date.
     *
     * @description
     * Get the year of the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the given date
     * @returns {Number} the year
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Which year is 2 July 2014?
     * const result = getYear(new Date(2014, 6, 2))
     * //=> 2014
     */

    function getYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var year = date.getFullYear();
      return year;
    }

    // Resource counts
    const resources$1 = writable({
    	powerLevel: 0,
    	energy: 1000,
    	iodine: [],
    	xenon: [],
    	waste: 0,
    });

    const counterHistory$1 = writable([0]);
    const CONTROL_ROD_POWER$1 = 0.005;

    const DEFAULT_VALUES$1 = {
    	pauseStatus: false,
    	startupTimer: 0,
    	startupAmount: 1000,

    	// Six factor formula vars
    	e: 1.03, // Fast Fission Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/fast-fission-factor/
    	n: 2.02, // Reproduction factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/reproduction-factor/
    	f: 0.7 + 0.07, // Thermal Utilization Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/thermal-utilization-factor/
    	p: 0.75, // Resonance Escape Probability https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/resonance-escape-probability/
    	pt: 0.96, // thermal non leakage
    	pf: 0.95, // fast nonleakage
    	tickCount: 0,
    	maxNeutrons: 2000,
    	maxEnergy: 10000,
    	wasteHalfLife: 1000,
    	xenonHalfLife: 8,
    	iodineHalfLife: 5,
    	meltdownCooldown: 20,
    	resourceBudgetBase: 1000,
    	resourceBudgetGrowth: .01,
    	controlRods: [false, false, false, false, false, false, false, true, true, true],
    };

    let saveGame$1 = writable(DEFAULT_VALUES$1);

    const upgradeStatus$1 = writable(upgrades$1);
    const unlockedUpgrades$1 = derived([upgradeStatus$1], ([$upgrades]) => filter_1($upgrades, upgrade => {
    	for (const id of upgrade.requirements) {
    		if (!find_1($upgrades, { id }).purchased) {
    			return false;
    		}
    	}

    	return true;
    }).map(unlock => unlock.id));


    const gameStatus$1 = derived(
    	[upgradeStatus$1, saveGame$1, resources$1],
    	([$upgradeStatus, $saveGame, $resources]) => {
    		let clonedSave = cloneDeep_1($saveGame);
    		forEach_1($upgradeStatus, upgrade => {
    			if (upgrade.purchased) {
    				clonedSave = upgrade.apply(clonedSave);
    			}
    		});

    		forEach_1($saveGame.controlRods, rod => {
    			if (rod) {
    				clonedSave.f = clonedSave.f - CONTROL_ROD_POWER$1;
    			}
    		});

    		// clonedSave.f -= $resources.poison;

    		return clonedSave;
    	},
    );

    const poisonAmount$1 = derived([resources$1], ([$resources]) => sum_1($resources.xenon));
    const energyBudget = derived([gameStatus$1], ([$gameStatus]) =>
    	$gameStatus.resourceBudgetBase *
    	Math.exp($gameStatus.resourceBudgetGrowth *
    	(getYear(getDate($gameStatus.tickCount)) - 2030)));

    const activityLog = writable([]);

    const rbinom = (n, p = 0.5) => {
        var total = 0;

        for (var i=0; i<n; i++) {
            var result = 0;
            if (Math.random() < p) {
                result++;
            }

            total = total + result;
        }

        return total;
    };

    /* src/components/logic/LoopM.svelte generated by Svelte v3.43.1 */

    function create_fragment$q(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAX_HISTORY$1 = 30;
    const LN_2$1 = 0.693;

    function instance$q($$self, $$props, $$invalidate) {
    	let $activityLog;
    	let $energyBudget;
    	let $saveGame;
    	let $gameStatus;
    	let $poisonAmount;
    	validate_store(activityLog, 'activityLog');
    	component_subscribe($$self, activityLog, $$value => $$invalidate(2, $activityLog = $$value));
    	validate_store(energyBudget, 'energyBudget');
    	component_subscribe($$self, energyBudget, $$value => $$invalidate(3, $energyBudget = $$value));
    	validate_store(saveGame$1, 'saveGame');
    	component_subscribe($$self, saveGame$1, $$value => $$invalidate(4, $saveGame = $$value));
    	validate_store(gameStatus$1, 'gameStatus');
    	component_subscribe($$self, gameStatus$1, $$value => $$invalidate(5, $gameStatus = $$value));
    	validate_store(poisonAmount$1, 'poisonAmount');
    	component_subscribe($$self, poisonAmount$1, $$value => $$invalidate(6, $poisonAmount = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoopM', slots, []);
    	let currentYear = getYear(getDate(0));
    	let nextYear = currentYear;

    	const loop = () => {
    		setTimeout(loop, 500);

    		const simulateFastFission = (neutrons, factor) => {
    			return neutrons * $gameStatus.e;
    		};

    		const simulateFastLeakage = neutrons => {
    			return rbinom(neutrons, $gameStatus.pf);
    		};

    		const simulateResonanceEscape = (neutrons, factor) => {
    			return rbinom(neutrons, $gameStatus.p);
    		};

    		const simulateThermalLeakage = (neutrons, factor) => {
    			return rbinom(neutrons, $gameStatus.pt);
    		};

    		const simulateThermalUtilization = (neutrons, factor) => {
    			return rbinom(neutrons, $gameStatus.f * (1 - $poisonAmount / neutrons));
    		}; // return rbinom(neutrons, $gameStatus.f);

    		const simulateReproduction = (neutrons, factor) => {
    			return neutrons * $gameStatus.n;
    		};

    		resources$1.update(resourcesObj => {
    			let neutrons = resourcesObj.powerLevel;

    			if ($gameStatus.pauseStatus) {
    				return resourcesObj;
    			}

    			set_store_value(saveGame$1, $saveGame.startupTimer += 1, $saveGame);
    			set_store_value(saveGame$1, $saveGame.tickCount += 1, $saveGame);
    			resourcesObj.iodine.unshift(neutrons * .064);
    			const fissioned = simulateFastFission(neutrons);
    			neutrons = fissioned;
    			neutrons = simulateFastLeakage(neutrons);
    			neutrons = simulateResonanceEscape(neutrons);
    			neutrons = simulateThermalLeakage(neutrons);
    			const utilized = simulateThermalUtilization(neutrons);
    			resourcesObj.energy += utilized;
    			resourcesObj.energy = Math.min(resourcesObj.energy, $gameStatus.maxEnergy);
    			resourcesObj.waste += fissioned * .0001;
    			resourcesObj.xenon.unshift(0);

    			// Nuclear decay
    			LN_2$1 / gameStatus$1.wasteHalfLife;

    			resourcesObj.waste = resourcesObj.waste * Math.exp(LN_2$1 / $gameStatus.wasteHalfLife * -1);

    			// Simulate iodine -> decay chain
    			resourcesObj.iodine = resourcesObj.iodine.map((poisonTick, index) => {
    				const newTick = poisonTick * Math.exp(LN_2$1 / $gameStatus.xenonHalfLife * -1 * index);
    				resourcesObj.xenon[index] = poisonTick - newTick;
    				return newTick;
    			});

    			resourcesObj.xenon = resourcesObj.xenon.map((xenonTick, index) => {
    				const newTick = xenonTick * Math.exp(LN_2$1 / $gameStatus.xenonHalfLife * -1 * index);
    				return newTick;
    			});

    			// Optimize poison history
    			while (resourcesObj.xenon[resourcesObj.xenon.length - 1] <= 0.00001 && resourcesObj.xenon.length > 1) {
    				resourcesObj.iodine.pop();
    				resourcesObj.xenon.pop();
    			}

    			neutrons = utilized;
    			neutrons = parseInt(simulateReproduction(neutrons));

    			// MELTDOWN
    			if (neutrons > $gameStatus.maxNeutrons) {
    				set_store_value(saveGame$1, $saveGame.controlRods = Array(10).fill(true), $saveGame);
    				set_store_value(saveGame$1, $saveGame.startupTimer = 0 - $gameStatus.meltdownCooldown * (neutrons / 10000), $saveGame);
    				resourcesObj.energy = parseInt(resourcesObj.energy / 2);
    				resourcesObj.powerLevel = 0;
    				neutrons = 0;
    			} else {
    				resourcesObj.powerLevel = neutrons;
    			}

    			counterHistory$1.update(history => {
    				history.push(neutrons);

    				if (history.length === MAX_HISTORY$1) {
    					history = history.splice(1, MAX_HISTORY$1 + 1);
    				}

    				
    				return history;
    			});

    			nextYear = getYear(getDate($saveGame.tickCount));

    			if (nextYear !== currentYear) {
    				if (resourcesObj.energy > $energyBudget) {
    					resourcesObj.energy -= $energyBudget;
    					set_store_value(activityLog, $activityLog = [...$activityLog, `${currentYear} completed. `], $activityLog);
    				} else {
    					const wasteAmount = $energyBudget - resourcesObj.energy;

    					set_store_value(
    						activityLog,
    						$activityLog = [
    							...$activityLog,
    							`Energy budget for ${currentYear} missed! ${wasteAmount} waste added.`
    						],
    						$activityLog
    					);

    					resourcesObj.waste += wasteAmount;
    					resourcesObj.energy = 0;
    				}

    				currentYear = nextYear;
    			}

    			return resourcesObj;
    		});
    	};

    	loop();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoopM> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		times: times_1,
    		forEach: forEach_1,
    		set: set_1,
    		resources: resources$1,
    		gameStatus: gameStatus$1,
    		counterHistory: counterHistory$1,
    		saveGame: saveGame$1,
    		poisonAmount: poisonAmount$1,
    		energyBudget,
    		activityLog,
    		rbinom,
    		getDateFromTicks: getDate,
    		getYear,
    		MAX_HISTORY: MAX_HISTORY$1,
    		LN_2: LN_2$1,
    		currentYear,
    		nextYear,
    		loop,
    		$activityLog,
    		$energyBudget,
    		$saveGame,
    		$gameStatus,
    		$poisonAmount
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentYear' in $$props) currentYear = $$props.currentYear;
    		if ('nextYear' in $$props) nextYear = $$props.nextYear;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class LoopM extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoopM",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    const upgrades = [
    	{
    		id: 0,
    		title: 'Extra Control Rod I',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [],
    		researchRequirements: [],
    		cost: {
    			energy: 100000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 1,
    		title: 'Extra Control Rod II',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [0],
    		researchRequirements: [],
    		cost: {
    			energy: 1000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 2,
    		title: 'Extra Control Rod III',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [1],
    		researchRequirements: [],
    		cost: {
    			energy: 10000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 3,
    		title: 'Extra Control Rod IV',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [2],
    		researchRequirements: [],
    		cost: {
    			energy: 100000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 4,
    		title: 'Extra Control Rod V',
    		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
    		lore: 'Asumming control',
    		requirements: [3],
    		researchRequirements: [],
    		cost: {
    			energy: 1000000000,
    		},
    		apply: save => {
    			save.controlRods.push(true);
    			save.n -= .01;
    			return save;
    		},
    	},
    	{
    		id: 5,
    		title: 'Increase Power Cap I',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 10000,
    		},
    	},
    	{
    		id: 6,
    		title: 'Increase Power Cap II',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [5],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 25000,
    		},
    	},
    	{
    		id: 7,
    		title: 'Increase Power Cap III',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [6],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 50000,
    		},
    	},
    	{
    		id: 8,
    		title: 'Increase Power Cap IV',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [7],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 100000,
    		},
    	},
    	{
    		id: 9,
    		title: 'Increase Power Cap V',
    		description: '+1000 maximum power level',
    		lore: 'It goes up to 11!',
    		requirements: [8],
    		researchRequirements: [],
    		apply: save => {
    			save.maxNeutrons += 1000;
    			return save;
    		},
    		cost: {
    			energy: 500000,
    		},
    	},
    	{
    		id: 10,
    		title: 'Expanded Batteries I',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 5000,
    		},
    	},
    	{
    		id: 11,
    		title: 'Expanded Batteries II',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [10],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 10000,
    		},
    	},
    	{
    		id: 12,
    		title: 'Expanded Batteries III',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [11],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 15000,
    		},
    	},
    	{
    		id: 13,
    		title: 'Expanded Batteries IV',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [12],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 20000,
    		},
    	},
    	{
    		id: 14,
    		title: 'Expanded Batteries V',
    		description: '+10K maximum energy storage',
    		lore: 'Keep going and going',
    		requirements: [13],
    		researchRequirements: [],
    		apply: save => {
    			save.maxEnergy += 10000;
    			return save;
    		},
    		cost: {
    			energy: 25000,
    		},
    	},
    	{
    		id: 15,
    		title: 'Moderator Coolant I',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 30000,
    		},
    	},
    	{
    		id: 16,
    		title: 'Moderator Coolant II',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [15],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 32000,
    		},
    	},
    	{
    		id: 17,
    		title: 'Moderator Coolant III',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [16],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 34000,
    		},
    	},
    	{
    		id: 18,
    		title: 'Moderator Coolant IV',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [17],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 38000,
    		},
    	},
    	{
    		id: 19,
    		title: 'Moderator Coolant V',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [18],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 40000,
    		},
    	},
    	{
    		id: 20,
    		title: 'Tachyonic antitelephone',
    		description: 'Decreases thermal energy leakage during operation',
    		lore: 'tbd',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 40000,
    		},
    	},
    	{
    		id: 21,
    		title: 'Particle collider',
    		description: 'Used for researching advanced ',
    		lore: 'tbd',
    		requirements: [],
    		researchRequirements: [],
    		apply: save => {
    			save.pt += .002;
    			return save;
    		},
    		cost: {
    			energy: 40000,
    		},
    	},
    ];

    // Resource counts
    const resources = writable({
    	powerLevel: 0,
    	energy: 1000,
    	iodine: [],
    	xenon: [],
    	waste: 0,
    });

    const counterHistory = writable([0]);
    const CONTROL_ROD_POWER = 0.005;

    const DEFAULT_VALUES = {
    	pauseStatus: false,
    	startupTimer: 0,
    	startupAmount: 1000,

    	// Six factor formula vars
    	e: 1.03, // Fast Fission Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/fast-fission-factor/
    	n: 2.02, // Reproduction factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/reproduction-factor/
    	f: 0.7 + 0.07, // Thermal Utilization Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/thermal-utilization-factor/
    	p: 0.75, // Resonance Escape Probability https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/resonance-escape-probability/
    	pt: 0.96, // thermal non leakage
    	pf: 0.95, // fast nonleakage
    	tickCount: 0,
    	maxNeutrons: 2000,
    	maxEnergy: 10000,
    	wasteHalfLife: 1000,
    	xenonHalfLife: 8,
    	iodineHalfLife: 5,
    	meltdownCooldown: 20,
    	controlRods: [false, false, false, false, false, false, false, true, true, true],
    };

    let saveGame = writable(DEFAULT_VALUES);

    const upgradeStatus = writable(upgrades);
    const unlockedUpgrades = derived([upgradeStatus], ([$upgrades]) => filter_1($upgrades, upgrade => {
    	for (const id of upgrade.requirements) {
    		if (!find_1($upgrades, { id }).purchased) {
    			return false;
    		}
    	}

    	return true;
    }).map(unlock => unlock.id));

    const gameStatus = derived(
    	[upgradeStatus, saveGame, resources],
    	([$upgradeStatus, $saveGame, $resources]) => {
    		let clonedSave = cloneDeep_1($saveGame);
    		forEach_1($upgradeStatus, upgrade => {
    			if (upgrade.purchased) {
    				clonedSave = upgrade.apply(clonedSave);
    			}
    		});

    		forEach_1($saveGame.controlRods, rod => {
    			if (rod) {
    				clonedSave.f = clonedSave.f - CONTROL_ROD_POWER;
    			}
    		});

    		return clonedSave;
    	},
    );

    const poisonAmount = derived([resources], ([$resources]) => sum_1($resources.xenon));

    /* src/components/logic/LoopAM.svelte generated by Svelte v3.43.1 */

    function create_fragment$p(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAX_HISTORY = 30;
    const LN_2 = 0.693;

    function instance$p($$self, $$props, $$invalidate) {
    	let $gameStatus;
    	let $saveGame;
    	let $poisonAmount;
    	validate_store(gameStatus, 'gameStatus');
    	component_subscribe($$self, gameStatus, $$value => $$invalidate(0, $gameStatus = $$value));
    	validate_store(saveGame, 'saveGame');
    	component_subscribe($$self, saveGame, $$value => $$invalidate(1, $saveGame = $$value));
    	validate_store(poisonAmount, 'poisonAmount');
    	component_subscribe($$self, poisonAmount, $$value => $$invalidate(2, $poisonAmount = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoopAM', slots, []);

    	const loop = () => {
    		setTimeout(loop, 500);

    		const simulateFastFission = (neutrons, factor) => {
    			return neutrons * $gameStatus.e;
    		};

    		const simulateFastLeakage = neutrons => {
    			return rbinom(neutrons, $gameStatus.pf);
    		};

    		const simulateResonanceEscape = (neutrons, factor) => {
    			return rbinom(neutrons, $gameStatus.p);
    		};

    		const simulateThermalLeakage = (neutrons, factor) => {
    			return rbinom(neutrons, $gameStatus.pt);
    		};

    		const simulateThermalUtilization = (neutrons, factor) => {
    			return rbinom(neutrons, $gameStatus.f * (1 - $poisonAmount / neutrons));
    		};

    		const simulateReproduction = (neutrons, factor) => {
    			return neutrons * $gameStatus.n;
    		};

    		resources.update(resourcesObj => {
    			let neutrons = resourcesObj.powerLevel;

    			if ($gameStatus.pauseStatus) {
    				return resourcesObj;
    			}

    			set_store_value(saveGame, $saveGame.startupTimer += 1, $saveGame);
    			saveGame.update(o => set_1(o, 'tickCount', o.tickCount + 1));
    			resourcesObj.iodine.unshift(neutrons * .064);
    			const fissioned = simulateFastFission(neutrons);
    			neutrons = fissioned;
    			neutrons = simulateFastLeakage(neutrons);
    			neutrons = simulateResonanceEscape(neutrons);
    			neutrons = simulateThermalLeakage(neutrons);
    			const utilized = simulateThermalUtilization(neutrons);
    			resourcesObj.energy += utilized;
    			resourcesObj.energy = Math.min(resourcesObj.energy, $gameStatus.maxEnergy);
    			resourcesObj.waste += fissioned * .0001;
    			resourcesObj.xenon.unshift(0);

    			// Nuclear decay
    			LN_2 / gameStatus.wasteHalfLife;

    			resourcesObj.waste = resourcesObj.waste * Math.exp(LN_2 / $gameStatus.wasteHalfLife * -1);

    			// Simulate iodine -> decay chain
    			resourcesObj.iodine = resourcesObj.iodine.map((poisonTick, index) => {
    				const newTick = poisonTick * Math.exp(LN_2 / $gameStatus.xenonHalfLife * -1 * index);
    				resourcesObj.xenon[index] = poisonTick - newTick;
    				return newTick;
    			});

    			resourcesObj.xenon = resourcesObj.xenon.map((xenonTick, index) => {
    				const newTick = xenonTick * Math.exp(LN_2 / $gameStatus.xenonHalfLife * -1 * index);
    				return newTick;
    			});

    			// Optimize poison history
    			while (resourcesObj.xenon[resourcesObj.xenon.length - 1] <= 0.00001 && resourcesObj.xenon.length > 1) {
    				resourcesObj.iodine.pop();
    				resourcesObj.xenon.pop();
    			}

    			neutrons = utilized;
    			neutrons = parseInt(simulateReproduction(neutrons));

    			// MELTDOWN
    			if (neutrons > $gameStatus.maxNeutrons) {
    				set_store_value(saveGame, $saveGame.controlRods = Array(10).fill(true), $saveGame);
    				set_store_value(saveGame, $saveGame.startupTimer = 0 - $gameStatus.meltdownCooldown * (neutrons / 10000), $saveGame);
    				resourcesObj.energy = parseInt(resourcesObj.energy / 2);
    				resourcesObj.powerLevel = 0;
    				neutrons = 0;
    			} else {
    				resourcesObj.powerLevel = neutrons;
    			}

    			counterHistory.update(history => {
    				history.push(neutrons);

    				if (history.length === MAX_HISTORY) {
    					history = history.splice(1, MAX_HISTORY + 1);
    				}

    				
    				return history;
    			});

    			return resourcesObj;
    		});
    	};

    	loop();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoopAM> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		times: times_1,
    		forEach: forEach_1,
    		set: set_1,
    		resources,
    		gameStatus,
    		counterHistory,
    		saveGame,
    		poisonAmount,
    		rbinom,
    		MAX_HISTORY,
    		LN_2,
    		loop,
    		$gameStatus,
    		$saveGame,
    		$poisonAmount
    	});

    	return [];
    }

    class LoopAM extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoopAM",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    var classnames = createCommonjsModule(function (module) {
    /*!
      Copyright (c) 2018 Jed Watson.
      Licensed under the MIT License (MIT), see
      http://jedwatson.github.io/classnames
    */
    /* global define */

    (function () {

    	var hasOwn = {}.hasOwnProperty;

    	function classNames() {
    		var classes = [];

    		for (var i = 0; i < arguments.length; i++) {
    			var arg = arguments[i];
    			if (!arg) continue;

    			var argType = typeof arg;

    			if (argType === 'string' || argType === 'number') {
    				classes.push(arg);
    			} else if (Array.isArray(arg)) {
    				if (arg.length) {
    					var inner = classNames.apply(null, arg);
    					if (inner) {
    						classes.push(inner);
    					}
    				}
    			} else if (argType === 'object') {
    				if (arg.toString === Object.prototype.toString) {
    					for (var key in arg) {
    						if (hasOwn.call(arg, key) && arg[key]) {
    							classes.push(key);
    						}
    					}
    				} else {
    					classes.push(arg.toString());
    				}
    			}
    		}

    		return classes.join(' ');
    	}

    	if (module.exports) {
    		classNames.default = classNames;
    		module.exports = classNames;
    	} else {
    		window.classNames = classNames;
    	}
    }());
    });

    // Resource counts
    const options = writable({
    	darkMode: false,
    	textSpeed: 3,
    	performanceMode: false,
    });

    const amDimension = writable(false);

    // Player info / random
    derived(
    	[amDimension, options, resources$1, counterHistory$1, upgradeStatus$1, unlockedUpgrades$1, gameStatus$1, poisonAmount$1,
    	resources, counterHistory, upgradeStatus, unlockedUpgrades, gameStatus, poisonAmount],
    	([$amDimension, $options, $mResources, $mCounterHistory, $mUpgradeStatus, $mUnlockedUpgrades, $mGameStatus, $mPoisonAmount,
    	$amResources, $amCounterHistory, $amUpgradeStatus, $amUnlockedUpgrades, $amGameStatus, $amPoisonAmount]) => {

    	return {
    		amDimension: $amDimension,
    		options: $options,
    		resources: {
    			matter: $mResources,
    			antimatter: $amResources,
    		},
    		mCounterHistory: {
    			matter: $mCounterHistory,
    			antimatter: $amCounterHistory,
    		},
    		mUpgradeStatus: {
    			matter: $mUpgradeStatus,
    			antimatter: $amUpgradeStatus,
    		},
    		mUnlockedUpgrades: {
    			matter: $mUnlockedUpgrades,
    			antimatter: $amUnlockedUpgrades,
    		},
    		mGameStatus: {
    			matter: $mGameStatus,
    			antimatter: $mGameStatus,
    		},
    		mPoisonAmount: {
    			matter: $mPoisonAmount,
    			antimatter: $amPoisonAmount,
    		},
    	};
    });

    const currentStore = derived(
    	[amDimension, options, resources$1, counterHistory$1, upgradeStatus$1, unlockedUpgrades$1, gameStatus$1, poisonAmount$1,
    	resources, counterHistory, upgradeStatus, unlockedUpgrades, gameStatus, poisonAmount],
    	([$amDimension, $options, $mResources, $mCounterHistory, $mUpgradeStatus, $mUnlockedUpgrades, $mGameStatus, $mPoisonAmount,
    	$amResources, $amCounterHistory, $amUpgradeStatus, $amUnlockedUpgrades, $amGameStatus, $amPoisonAmount]) => {

    	return {
    		amDimension: $amDimension,
    		options: $options,
    		resources: $amDimension ? $amResources : $mResources,
    		upgradeStatus: $amDimension ? $amUpgradeStatus : $mUpgradeStatus,
    		unlockedUpgrades: $amDimension ? $amUnlockedUpgrades : $mUnlockedUpgrades,
    		gameStatus: $amDimension ? $amGameStatus : $mGameStatus,
    		poisonAmount: $amDimension ? $amPoisonAmount : $mPoisonAmount,
    		counterHistory: $amDimension ? $amCounterHistory : $mCounterHistory,
    	};
    });

    /* src/components/NeutronDisplayYAxisLabels.svelte generated by Svelte v3.43.1 */
    const file$o = "src/components/NeutronDisplayYAxisLabels.svelte";

    function create_fragment$o(ctx) {
    	let div11;
    	let div5;
    	let div0;
    	let t0_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.75 + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.5 + "";
    	let t4;
    	let t5;
    	let div3;
    	let t6_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.25 + "";
    	let t6;
    	let t7;
    	let div4;
    	let t9;
    	let div6;
    	let t10_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons + "";
    	let t10;
    	let t11;
    	let div7;
    	let t12_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.75 + "";
    	let t12;
    	let t13;
    	let div8;
    	let t14_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.5 + "";
    	let t14;
    	let t15;
    	let div9;
    	let t16_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.25 + "";
    	let t16;
    	let t17;
    	let div10;

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "0";
    			t9 = space();
    			div6 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div7 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			div8 = element("div");
    			t14 = text(t14_value);
    			t15 = space();
    			div9 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			div10 = element("div");
    			div10.textContent = "0";
    			attr_dev(div0, "class", "y-axis-number");
    			add_location(div0, file$o, 52, 3, 858);
    			attr_dev(div1, "class", "y-axis-number");
    			add_location(div1, file$o, 53, 3, 933);
    			attr_dev(div2, "class", "y-axis-number");
    			add_location(div2, file$o, 54, 3, 1015);
    			attr_dev(div3, "class", "y-axis-number");
    			add_location(div3, file$o, 55, 3, 1096);
    			attr_dev(div4, "class", "y-axis-number");
    			add_location(div4, file$o, 56, 3, 1178);
    			attr_dev(div5, "class", "y-axis echo svelte-1yz110g");
    			add_location(div5, file$o, 51, 1, 829);
    			attr_dev(div6, "class", "y-axis-number");
    			add_location(div6, file$o, 58, 2, 1223);
    			attr_dev(div7, "class", "y-axis-number");
    			add_location(div7, file$o, 59, 2, 1297);
    			attr_dev(div8, "class", "y-axis-number");
    			add_location(div8, file$o, 60, 2, 1378);
    			attr_dev(div9, "class", "y-axis-number");
    			add_location(div9, file$o, 61, 2, 1458);
    			attr_dev(div10, "class", "y-axis-number");
    			add_location(div10, file$o, 62, 2, 1539);
    			attr_dev(div11, "class", "y-axis svelte-1yz110g");
    			add_location(div11, file$o, 50, 0, 807);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div5, div0);
    			append_dev(div0, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			append_dev(div1, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, t4);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, t6);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div11, t9);
    			append_dev(div11, div6);
    			append_dev(div6, t10);
    			append_dev(div11, t11);
    			append_dev(div11, div7);
    			append_dev(div7, t12);
    			append_dev(div11, t13);
    			append_dev(div11, div8);
    			append_dev(div8, t14);
    			append_dev(div11, t15);
    			append_dev(div11, div9);
    			append_dev(div9, t16);
    			append_dev(div11, t17);
    			append_dev(div11, div10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$currentStore*/ 1 && t0_value !== (t0_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$currentStore*/ 1 && t2_value !== (t2_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.75 + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$currentStore*/ 1 && t4_value !== (t4_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.5 + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$currentStore*/ 1 && t6_value !== (t6_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.25 + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*$currentStore*/ 1 && t10_value !== (t10_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*$currentStore*/ 1 && t12_value !== (t12_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.75 + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*$currentStore*/ 1 && t14_value !== (t14_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.5 + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*$currentStore*/ 1 && t16_value !== (t16_value = /*$currentStore*/ ctx[0].gameStatus.maxNeutrons * 0.25 + "")) set_data_dev(t16, t16_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $currentStore;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(0, $currentStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NeutronDisplayYAxisLabels', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NeutronDisplayYAxisLabels> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ currentStore, $currentStore });
    	return [$currentStore];
    }

    class NeutronDisplayYAxisLabels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NeutronDisplayYAxisLabels",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /**
     * The base implementation of `_.map` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike_1(collection) ? Array(collection.length) : [];

      _baseEach(collection, function(value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    var _baseMap = baseMap;

    /**
     * Creates an array of values by running each element in `collection` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
     * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
     * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
     * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * _.map([4, 8], square);
     * // => [16, 64]
     *
     * _.map({ 'a': 4, 'b': 8 }, square);
     * // => [16, 64] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */
    function map(collection, iteratee) {
      var func = isArray_1(collection) ? _arrayMap : _baseMap;
      return func(collection, _baseIteratee(iteratee));
    }

    var map_1 = map;

    /* src/components/ControlRod.svelte generated by Svelte v3.43.1 */
    const file$n = "src/components/ControlRod.svelte";

    function create_fragment$n(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = `${' '}`;
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*displayName*/ ctx[0]);
    			attr_dev(div0, "class", "controlRod-icon svelte-6djn7g");
    			add_location(div0, file$n, 105, 1, 2055);
    			attr_dev(div1, "class", "controlRod-display svelte-6djn7g");
    			add_location(div1, file$n, 106, 1, 2097);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-6djn7g"));
    			add_location(div2, file$n, 104, 0, 2011);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);

    			if (!mounted) {
    				dispose = listen_dev(
    					div2,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*displayName*/ 1) set_data_dev(t2, /*displayName*/ ctx[0]);

    			if (dirty & /*className*/ 4 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-6djn7g"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $currentStore;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(5, $currentStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ControlRod', slots, []);
    	let { active } = $$props;
    	let { displayName } = $$props;
    	let { onClick = () => undefined } = $$props;
    	let isAm;
    	let className;
    	const writable_props = ['active', 'displayName', 'onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ControlRod> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('active' in $$props) $$invalidate(3, active = $$props.active);
    		if ('displayName' in $$props) $$invalidate(0, displayName = $$props.displayName);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		forEach: forEach_1,
    		map: map_1,
    		classNames: classnames,
    		currentStore,
    		active,
    		displayName,
    		onClick,
    		isAm,
    		className,
    		$currentStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(3, active = $$props.active);
    		if ('displayName' in $$props) $$invalidate(0, displayName = $$props.displayName);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    		if ('isAm' in $$props) $$invalidate(4, isAm = $$props.isAm);
    		if ('className' in $$props) $$invalidate(2, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentStore, active, isAm*/ 56) {
    			{
    				$$invalidate(4, isAm = $currentStore.amDimension);
    				$$invalidate(2, className = classnames('controlRod', { active, isAm }));
    			}
    		}
    	};

    	return [displayName, onClick, className, active, isAm, $currentStore];
    }

    class ControlRod extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { active: 3, displayName: 0, onClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlRod",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[3] === undefined && !('active' in props)) {
    			console.warn("<ControlRod> was created without expected prop 'active'");
    		}

    		if (/*displayName*/ ctx[0] === undefined && !('displayName' in props)) {
    			console.warn("<ControlRod> was created without expected prop 'displayName'");
    		}
    	}

    	get active() {
    		throw new Error("<ControlRod>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ControlRod>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayName() {
    		throw new Error("<ControlRod>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayName(value) {
    		throw new Error("<ControlRod>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<ControlRod>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<ControlRod>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ControlRodList.svelte generated by Svelte v3.43.1 */
    const file$m = "src/components/ControlRodList.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (68:1) {:else}
    function create_else_block$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*$mSaveGame*/ ctx[2].controlRods;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$mSaveGame, toggleamRod*/ 20) {
    				each_value_1 = /*$mSaveGame*/ ctx[2].controlRods;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(68:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:1) {#if $amDimension}
    function create_if_block$a(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$amSaveGame*/ ctx[1].controlRods;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$amSaveGame, togglemRod*/ 10) {
    				each_value = /*$amSaveGame*/ ctx[1].controlRods;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(60:1) {#if $amDimension}",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#each $mSaveGame.controlRods as rod, index}
    function create_each_block_1$1(ctx) {
    	let controlrod;
    	let current;

    	function func_1() {
    		return /*func_1*/ ctx[6](/*index*/ ctx[9]);
    	}

    	controlrod = new ControlRod({
    			props: {
    				active: /*rod*/ ctx[7],
    				onClick: func_1,
    				displayName: `ctrl rod ${('00' + (/*index*/ ctx[9] + 1)).slice(-3)}`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(controlrod.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(controlrod, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const controlrod_changes = {};
    			if (dirty & /*$mSaveGame*/ 4) controlrod_changes.active = /*rod*/ ctx[7];
    			controlrod.$set(controlrod_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlrod.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlrod.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(controlrod, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(69:2) {#each $mSaveGame.controlRods as rod, index}",
    		ctx
    	});

    	return block;
    }

    // (61:2) {#each $amSaveGame.controlRods as rod, index}
    function create_each_block$6(ctx) {
    	let controlrod;
    	let current;

    	function func() {
    		return /*func*/ ctx[5](/*index*/ ctx[9]);
    	}

    	controlrod = new ControlRod({
    			props: {
    				active: /*rod*/ ctx[7],
    				onClick: func,
    				displayName: `ctrl rod ${('00' + (/*index*/ ctx[9] + 1)).slice(-3)}`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(controlrod.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(controlrod, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const controlrod_changes = {};
    			if (dirty & /*$amSaveGame*/ 2) controlrod_changes.active = /*rod*/ ctx[7];
    			controlrod.$set(controlrod_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlrod.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlrod.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(controlrod, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(61:2) {#each $amSaveGame.controlRods as rod, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$a, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$amDimension*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			attr_dev(section, "class", "controlRodList svelte-1ayyod5");
    			add_location(section, file$m, 58, 0, 1203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(section, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $amDimension;
    	let $amSaveGame;
    	let $mSaveGame;
    	validate_store(amDimension, 'amDimension');
    	component_subscribe($$self, amDimension, $$value => $$invalidate(0, $amDimension = $$value));
    	validate_store(saveGame, 'amSaveGame');
    	component_subscribe($$self, saveGame, $$value => $$invalidate(1, $amSaveGame = $$value));
    	validate_store(saveGame$1, 'mSaveGame');
    	component_subscribe($$self, saveGame$1, $$value => $$invalidate(2, $mSaveGame = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ControlRodList', slots, []);

    	const togglemRod = index => {
    		// Update rod status
    		saveGame$1.update(save => {
    			save.controlRods[index] = !save.controlRods[index];
    			return save;
    		});
    	};

    	const toggleamRod = index => {
    		// Update rod status
    		saveGame.update(save => {
    			save.controlRods[index] = !save.controlRods[index];
    			return save;
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ControlRodList> was created with unknown prop '${key}'`);
    	});

    	const func = index => togglemRod(index);
    	const func_1 = index => toggleamRod(index);

    	$$self.$capture_state = () => ({
    		mSaveGame: saveGame$1,
    		amSaveGame: saveGame,
    		amDimension,
    		ControlRod,
    		forEach: forEach_1,
    		togglemRod,
    		toggleamRod,
    		$amDimension,
    		$amSaveGame,
    		$mSaveGame
    	});

    	return [$amDimension, $amSaveGame, $mSaveGame, togglemRod, toggleamRod, func, func_1];
    }

    class ControlRodList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlRodList",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/components/NeutronDisplay.svelte generated by Svelte v3.43.1 */
    const file$l = "src/components/NeutronDisplay.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (83:1) {#if disabled !== true}
    function create_if_block_3$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "neutron-display-overlay svelte-8h0iq");
    			add_location(div, file$l, 83, 2, 1630);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(83:1) {#if disabled !== true}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {:else}
    function create_else_block$3(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*counterHistory*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*X_INTERVAL, MAX_HEIGHT, counterHistory, gameStatus, isError*/ 7) {
    				each_value_1 = /*counterHistory*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(105:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (92:2) {#if $amDimension}
    function create_if_block$9(ctx) {
    	let each_1_anchor;
    	let each_value = /*counterHistory*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*X_INTERVAL, MAX_HEIGHT, counterHistory, gameStatus, isError*/ 7) {
    				each_value = /*counterHistory*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(92:2) {#if $amDimension}",
    		ctx
    	});

    	return block;
    }

    // (107:4) {#if index !== counterHistory.length - 1}
    function create_if_block_2$1(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;
    	let line_stroke_value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", /*index*/ ctx[8] * X_INTERVAL);
    			attr_dev(line, "y1", line_y__value = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8]] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT);
    			attr_dev(line, "x2", (/*index*/ ctx[8] + 1) * X_INTERVAL);
    			attr_dev(line, "y2", line_y__value_1 = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8] + 1] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT);
    			attr_dev(line, "width", "1px");
    			attr_dev(line, "stroke", line_stroke_value = /*isError*/ ctx[2] ? "red" : "white");
    			add_location(line, file$l, 107, 5, 2361);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*counterHistory, gameStatus*/ 3 && line_y__value !== (line_y__value = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8]] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*counterHistory, gameStatus*/ 3 && line_y__value_1 !== (line_y__value_1 = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8] + 1] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*isError*/ 4 && line_stroke_value !== (line_stroke_value = /*isError*/ ctx[2] ? "red" : "white")) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(107:4) {#if index !== counterHistory.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (106:3) {#each counterHistory as historyEntry, index}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*index*/ ctx[8] !== /*counterHistory*/ ctx[0].length - 1 && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*index*/ ctx[8] !== /*counterHistory*/ ctx[0].length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(106:3) {#each counterHistory as historyEntry, index}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {#if index !== counterHistory.length - 1}
    function create_if_block_1$1(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;
    	let line_stroke_value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", /*index*/ ctx[8] * X_INTERVAL);
    			attr_dev(line, "y1", line_y__value = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8]] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT);
    			attr_dev(line, "x2", (/*index*/ ctx[8] + 1) * X_INTERVAL);
    			attr_dev(line, "y2", line_y__value_1 = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8] + 1] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT);
    			attr_dev(line, "width", "1px");
    			attr_dev(line, "stroke", line_stroke_value = /*isError*/ ctx[2] ? "red" : "white");
    			add_location(line, file$l, 94, 5, 1911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*counterHistory, gameStatus*/ 3 && line_y__value !== (line_y__value = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8]] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*counterHistory, gameStatus*/ 3 && line_y__value_1 !== (line_y__value_1 = MAX_HEIGHT - /*counterHistory*/ ctx[0][/*index*/ ctx[8] + 1] / /*gameStatus*/ ctx[1].maxNeutrons * MAX_HEIGHT)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*isError*/ 4 && line_stroke_value !== (line_stroke_value = /*isError*/ ctx[2] ? "red" : "white")) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(94:4) {#if index !== counterHistory.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (93:3) {#each counterHistory as historyEntry, index}
    function create_each_block$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*index*/ ctx[8] !== /*counterHistory*/ ctx[0].length - 1 && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*index*/ ctx[8] !== /*counterHistory*/ ctx[0].length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(93:3) {#each counterHistory as historyEntry, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div1;
    	let t0;
    	let neutrondisplayyaxislabels;
    	let t1;
    	let div0;
    	let svg;
    	let div1_class_value;
    	let t2;
    	let section;
    	let controlrodlist;
    	let current;
    	let if_block0 = /*disabled*/ ctx[3] !== true && create_if_block_3$1(ctx);
    	neutrondisplayyaxislabels = new NeutronDisplayYAxisLabels({ $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (/*$amDimension*/ ctx[4]) return create_if_block$9;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	controlrodlist = new ControlRodList({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(neutrondisplayyaxislabels.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			if_block1.c();
    			t2 = space();
    			section = element("section");
    			create_component(controlrodlist.$$.fragment);
    			attr_dev(svg, "class", "viz svelte-8h0iq");
    			attr_dev(svg, "viewBox", "0 0 800 300");
    			add_location(svg, file$l, 87, 1, 1742);
    			attr_dev(div0, "class", "graphContainer svelte-8h0iq");
    			add_location(div0, file$l, 86, 2, 1712);

    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(classnames('neutron-display', {
    				isError: /*isError*/ ctx[2],
    				disabled: /*disabled*/ ctx[3]
    			})) + " svelte-8h0iq"));

    			add_location(div1, file$l, 81, 0, 1536);
    			attr_dev(section, "class", "panel panel-2");
    			add_location(section, file$l, 121, 0, 2731);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			mount_component(neutrondisplayyaxislabels, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			if_block1.m(svg, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, section, anchor);
    			mount_component(controlrodlist, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*disabled*/ ctx[3] !== true) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(svg, null);
    				}
    			}

    			if (!current || dirty & /*isError, disabled*/ 12 && div1_class_value !== (div1_class_value = "" + (null_to_empty(classnames('neutron-display', {
    				isError: /*isError*/ ctx[2],
    				disabled: /*disabled*/ ctx[3]
    			})) + " svelte-8h0iq"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(neutrondisplayyaxislabels.$$.fragment, local);
    			transition_in(controlrodlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(neutrondisplayyaxislabels.$$.fragment, local);
    			transition_out(controlrodlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			destroy_component(neutrondisplayyaxislabels);
    			if_block1.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section);
    			destroy_component(controlrodlist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAX_HEIGHT = 300;
    const X_INTERVAL = 30;

    function instance$l($$self, $$props, $$invalidate) {
    	let $currentStore;
    	let $amDimension;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(5, $currentStore = $$value));
    	validate_store(amDimension, 'amDimension');
    	component_subscribe($$self, amDimension, $$value => $$invalidate(4, $amDimension = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NeutronDisplay', slots, []);
    	let counterHistory, gameStatus, isError, disabled;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NeutronDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		classNames: classnames,
    		currentStore,
    		amDimension,
    		NeutronDisplayYAxisLabels,
    		ControlRodList,
    		MAX_HEIGHT,
    		X_INTERVAL,
    		counterHistory,
    		gameStatus,
    		isError,
    		disabled,
    		$currentStore,
    		$amDimension
    	});

    	$$self.$inject_state = $$props => {
    		if ('counterHistory' in $$props) $$invalidate(0, counterHistory = $$props.counterHistory);
    		if ('gameStatus' in $$props) $$invalidate(1, gameStatus = $$props.gameStatus);
    		if ('isError' in $$props) $$invalidate(2, isError = $$props.isError);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentStore, counterHistory, gameStatus*/ 35) {
    			{
    				$$invalidate(0, counterHistory = $currentStore.counterHistory);
    				$$invalidate(1, gameStatus = $currentStore.gameStatus);
    				$$invalidate(2, isError = counterHistory.length && counterHistory[counterHistory.length - 1] === 0);
    				$$invalidate(3, disabled = gameStatus.startupTimer < 0);
    			}
    		}
    	};

    	return [counterHistory, gameStatus, isError, disabled, $amDimension, $currentStore];
    }

    class NeutronDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NeutronDisplay",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/components/UpgradeItem.svelte generated by Svelte v3.43.1 */
    const file$k = "src/components/UpgradeItem.svelte";

    // (114:1) {#if purchased}
    function create_if_block$8(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Purchased";
    			attr_dev(div, "class", "upgradeItem-purchased svelte-7cyjth");
    			add_location(div, file$k, 114, 2, 2164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(114:1) {#if purchased}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div2;
    	let t4;
    	let t5;
    	let t6;
    	let div3;
    	let t7;
    	let t8_value = JSON.stringify(/*cost*/ ctx[3]) + "";
    	let t8;
    	let div4_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*purchased*/ ctx[4] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*description*/ ctx[1]);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(/*lore*/ ctx[2]);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			div3 = element("div");
    			t7 = text("Cost: ");
    			t8 = text(t8_value);
    			attr_dev(div0, "class", "upgradeItem-title svelte-7cyjth");
    			add_location(div0, file$k, 110, 1, 2005);
    			attr_dev(div1, "class", "upgradeItem-desc svelte-7cyjth");
    			add_location(div1, file$k, 111, 1, 2051);
    			attr_dev(div2, "class", "upgradeItem-lore svelte-7cyjth");
    			add_location(div2, file$k, 112, 1, 2102);
    			attr_dev(div3, "class", "upgradeItem-cost svelte-7cyjth");
    			add_location(div3, file$k, 116, 1, 2223);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*className*/ ctx[5]) + " svelte-7cyjth"));
    			add_location(div4, file$k, 109, 0, 1956);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, t4);
    			append_dev(div4, t5);
    			if (if_block) if_block.m(div4, null);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, t7);
    			append_dev(div3, t8);

    			if (!mounted) {
    				dispose = listen_dev(
    					div4,
    					"click",
    					function () {
    						if (is_function(/*clickHandler*/ ctx[6])) /*clickHandler*/ ctx[6].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*description*/ 2) set_data_dev(t2, /*description*/ ctx[1]);
    			if (dirty & /*lore*/ 4) set_data_dev(t4, /*lore*/ ctx[2]);

    			if (/*purchased*/ ctx[4]) {
    				if (if_block) ; else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div4, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*cost*/ 8 && t8_value !== (t8_value = JSON.stringify(/*cost*/ ctx[3]) + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*className*/ 32 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*className*/ ctx[5]) + " svelte-7cyjth"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $currentStore;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(9, $currentStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UpgradeItem', slots, []);
    	let { title } = $$props;
    	let { description } = $$props;
    	let { lore } = $$props;
    	let { cost } = $$props;
    	let { purchased = false } = $$props;
    	let { onClick = () => undefined } = $$props;
    	let isAfforable = true;
    	let className;
    	let clickHandler;
    	const writable_props = ['title', 'description', 'lore', 'cost', 'purchased', 'onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpgradeItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    		if ('lore' in $$props) $$invalidate(2, lore = $$props.lore);
    		if ('cost' in $$props) $$invalidate(3, cost = $$props.cost);
    		if ('purchased' in $$props) $$invalidate(4, purchased = $$props.purchased);
    		if ('onClick' in $$props) $$invalidate(7, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		currentStore,
    		forEach: forEach_1,
    		map: map_1,
    		classNames: classnames,
    		title,
    		description,
    		lore,
    		cost,
    		purchased,
    		onClick,
    		isAfforable,
    		className,
    		clickHandler,
    		$currentStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    		if ('lore' in $$props) $$invalidate(2, lore = $$props.lore);
    		if ('cost' in $$props) $$invalidate(3, cost = $$props.cost);
    		if ('purchased' in $$props) $$invalidate(4, purchased = $$props.purchased);
    		if ('onClick' in $$props) $$invalidate(7, onClick = $$props.onClick);
    		if ('isAfforable' in $$props) $$invalidate(8, isAfforable = $$props.isAfforable);
    		if ('className' in $$props) $$invalidate(5, className = $$props.className);
    		if ('clickHandler' in $$props) $$invalidate(6, clickHandler = $$props.clickHandler);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cost, $currentStore, isAfforable, purchased, onClick*/ 920) {
    			{
    				$$invalidate(8, isAfforable = map_1(cost, (c, key) => $currentStore.resources[key] && $currentStore.resources[key] >= c).reduce((sum, next) => sum && next, true));
    				$$invalidate(5, className = classnames('upgradeItem', { isAfforable, purchased }));

    				$$invalidate(6, clickHandler = () => {
    					isAfforable && !purchased ? onClick() : null;
    				});
    			}
    		}
    	};

    	return [
    		title,
    		description,
    		lore,
    		cost,
    		purchased,
    		className,
    		clickHandler,
    		onClick,
    		isAfforable,
    		$currentStore
    	];
    }

    class UpgradeItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			title: 0,
    			description: 1,
    			lore: 2,
    			cost: 3,
    			purchased: 4,
    			onClick: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UpgradeItem",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<UpgradeItem> was created without expected prop 'title'");
    		}

    		if (/*description*/ ctx[1] === undefined && !('description' in props)) {
    			console.warn("<UpgradeItem> was created without expected prop 'description'");
    		}

    		if (/*lore*/ ctx[2] === undefined && !('lore' in props)) {
    			console.warn("<UpgradeItem> was created without expected prop 'lore'");
    		}

    		if (/*cost*/ ctx[3] === undefined && !('cost' in props)) {
    			console.warn("<UpgradeItem> was created without expected prop 'cost'");
    		}
    	}

    	get title() {
    		throw new Error("<UpgradeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<UpgradeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<UpgradeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<UpgradeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lore() {
    		throw new Error("<UpgradeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lore(value) {
    		throw new Error("<UpgradeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cost() {
    		throw new Error("<UpgradeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cost(value) {
    		throw new Error("<UpgradeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get purchased() {
    		throw new Error("<UpgradeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set purchased(value) {
    		throw new Error("<UpgradeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<UpgradeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<UpgradeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/UpgradeListM.svelte generated by Svelte v3.43.1 */
    const file$j = "src/components/UpgradeListM.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (69:2) {#if $unlockedUpgrades.includes(upgrade.id)}
    function create_if_block$7(ctx) {
    	let upgradeitem;
    	let current;

    	function func() {
    		return /*func*/ ctx[3](/*upgrade*/ ctx[4], /*index*/ ctx[6]);
    	}

    	const upgradeitem_spread_levels = [/*upgrade*/ ctx[4], { onClick: func }];
    	let upgradeitem_props = {};

    	for (let i = 0; i < upgradeitem_spread_levels.length; i += 1) {
    		upgradeitem_props = assign(upgradeitem_props, upgradeitem_spread_levels[i]);
    	}

    	upgradeitem = new UpgradeItem({ props: upgradeitem_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(upgradeitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(upgradeitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const upgradeitem_changes = (dirty & /*$upgradeStatus, buyUpgrade*/ 5)
    			? get_spread_update(upgradeitem_spread_levels, [
    					dirty & /*$upgradeStatus*/ 1 && get_spread_object(/*upgrade*/ ctx[4]),
    					{ onClick: func }
    				])
    			: {};

    			upgradeitem.$set(upgradeitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upgradeitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upgradeitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(upgradeitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(69:2) {#if $unlockedUpgrades.includes(upgrade.id)}",
    		ctx
    	});

    	return block;
    }

    // (68:1) {#each $upgradeStatus as upgrade, index}
    function create_each_block$4(ctx) {
    	let show_if = /*$unlockedUpgrades*/ ctx[1].includes(/*upgrade*/ ctx[4].id);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$unlockedUpgrades, $upgradeStatus*/ 3) show_if = /*$unlockedUpgrades*/ ctx[1].includes(/*upgrade*/ ctx[4].id);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$unlockedUpgrades, $upgradeStatus*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(68:1) {#each $upgradeStatus as upgrade, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let section;
    	let div;
    	let t1;
    	let current;
    	let each_value = /*$upgradeStatus*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			div.textContent = "UPGRADES";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "upgradeList-header svelte-10sxybj");
    			add_location(div, file$j, 66, 1, 1317);
    			attr_dev(section, "class", "upgradeList svelte-10sxybj");
    			add_location(section, file$j, 65, 0, 1286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(section, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$upgradeStatus, buyUpgrade, $unlockedUpgrades*/ 7) {
    				each_value = /*$upgradeStatus*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $upgradeStatus;
    	let $unlockedUpgrades;
    	validate_store(upgradeStatus$1, 'upgradeStatus');
    	component_subscribe($$self, upgradeStatus$1, $$value => $$invalidate(0, $upgradeStatus = $$value));
    	validate_store(unlockedUpgrades$1, 'unlockedUpgrades');
    	component_subscribe($$self, unlockedUpgrades$1, $$value => $$invalidate(1, $unlockedUpgrades = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UpgradeListM', slots, []);

    	const buyUpgrade = (upgradeObject, index) => {
    		upgradeObject.purchased = true;

    		// Update purchase status
    		upgradeStatus$1.update(statusObject => {
    			statusObject[index] = upgradeObject;
    			return statusObject;
    		});

    		// Subtract cost
    		resources$1.update(resourcesObj => {
    			forEach_1(resourcesObj, (resource, key) => {
    				if (upgradeObject.cost[key]) {
    					resourcesObj[key] -= upgradeObject.cost[key];
    				}
    			});

    			return resourcesObj;
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpgradeListM> was created with unknown prop '${key}'`);
    	});

    	const func = (upgrade, index) => buyUpgrade(upgrade, index);

    	$$self.$capture_state = () => ({
    		upgradeStatus: upgradeStatus$1,
    		resources: resources$1,
    		unlockedUpgrades: unlockedUpgrades$1,
    		UpgradeItem,
    		forEach: forEach_1,
    		buyUpgrade,
    		$upgradeStatus,
    		$unlockedUpgrades
    	});

    	return [$upgradeStatus, $unlockedUpgrades, buyUpgrade, func];
    }

    class UpgradeListM extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UpgradeListM",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/components/UpgradeListAM.svelte generated by Svelte v3.43.1 */
    const file$i = "src/components/UpgradeListAM.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (69:2) {#if $unlockedUpgrades.includes(upgrade.id)}
    function create_if_block$6(ctx) {
    	let upgradeitem;
    	let current;

    	function func() {
    		return /*func*/ ctx[3](/*upgrade*/ ctx[4], /*index*/ ctx[6]);
    	}

    	const upgradeitem_spread_levels = [/*upgrade*/ ctx[4], { onClick: func }];
    	let upgradeitem_props = {};

    	for (let i = 0; i < upgradeitem_spread_levels.length; i += 1) {
    		upgradeitem_props = assign(upgradeitem_props, upgradeitem_spread_levels[i]);
    	}

    	upgradeitem = new UpgradeItem({ props: upgradeitem_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(upgradeitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(upgradeitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const upgradeitem_changes = (dirty & /*$upgradeStatus, buyUpgrade*/ 5)
    			? get_spread_update(upgradeitem_spread_levels, [
    					dirty & /*$upgradeStatus*/ 1 && get_spread_object(/*upgrade*/ ctx[4]),
    					{ onClick: func }
    				])
    			: {};

    			upgradeitem.$set(upgradeitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upgradeitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upgradeitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(upgradeitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(69:2) {#if $unlockedUpgrades.includes(upgrade.id)}",
    		ctx
    	});

    	return block;
    }

    // (68:1) {#each $upgradeStatus as upgrade, index}
    function create_each_block$3(ctx) {
    	let show_if = /*$unlockedUpgrades*/ ctx[1].includes(/*upgrade*/ ctx[4].id);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$unlockedUpgrades, $upgradeStatus*/ 3) show_if = /*$unlockedUpgrades*/ ctx[1].includes(/*upgrade*/ ctx[4].id);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$unlockedUpgrades, $upgradeStatus*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(68:1) {#each $upgradeStatus as upgrade, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let section;
    	let div;
    	let t1;
    	let current;
    	let each_value = /*$upgradeStatus*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			div.textContent = "UPGRADES";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "upgradeList-header svelte-10sxybj");
    			add_location(div, file$i, 66, 1, 1321);
    			attr_dev(section, "class", "upgradeList svelte-10sxybj");
    			add_location(section, file$i, 65, 0, 1290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(section, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$upgradeStatus, buyUpgrade, $unlockedUpgrades*/ 7) {
    				each_value = /*$upgradeStatus*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $upgradeStatus;
    	let $unlockedUpgrades;
    	validate_store(upgradeStatus, 'upgradeStatus');
    	component_subscribe($$self, upgradeStatus, $$value => $$invalidate(0, $upgradeStatus = $$value));
    	validate_store(unlockedUpgrades, 'unlockedUpgrades');
    	component_subscribe($$self, unlockedUpgrades, $$value => $$invalidate(1, $unlockedUpgrades = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UpgradeListAM', slots, []);

    	const buyUpgrade = (upgradeObject, index) => {
    		upgradeObject.purchased = true;

    		// Update purchase status
    		upgradeStatus.update(statusObject => {
    			statusObject[index] = upgradeObject;
    			return statusObject;
    		});

    		// Subtract cost
    		resources.update(resourcesObj => {
    			forEach_1(resourcesObj, (resource, key) => {
    				if (upgradeObject.cost[key]) {
    					resourcesObj[key] -= upgradeObject.cost[key];
    				}
    			});

    			return resourcesObj;
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpgradeListAM> was created with unknown prop '${key}'`);
    	});

    	const func = (upgrade, index) => buyUpgrade(upgrade, index);

    	$$self.$capture_state = () => ({
    		upgradeStatus,
    		resources,
    		unlockedUpgrades,
    		UpgradeItem,
    		forEach: forEach_1,
    		buyUpgrade,
    		$upgradeStatus,
    		$unlockedUpgrades
    	});

    	return [$upgradeStatus, $unlockedUpgrades, buyUpgrade, func];
    }

    class UpgradeListAM extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UpgradeListAM",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/components/PauseButton.svelte generated by Svelte v3.43.1 */
    const file$h = "src/components/PauseButton.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(/*text*/ ctx[2]);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(/*text2*/ ctx[3]);
    			add_location(span0, file$h, 104, 1, 2325);
    			add_location(span1, file$h, 105, 1, 2346);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classnames('pauseButton', {
    				waiting: /*waiting*/ ctx[1],
    				disabled: /*disabled*/ ctx[0]
    			})) + " svelte-1fmcpkt"));

    			add_location(div, file$h, 103, 0, 2242);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*refuel*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 4) set_data_dev(t0, /*text*/ ctx[2]);
    			if (dirty & /*text2*/ 8) set_data_dev(t2, /*text2*/ ctx[3]);

    			if (dirty & /*waiting, disabled*/ 3 && div_class_value !== (div_class_value = "" + (null_to_empty(classnames('pauseButton', {
    				waiting: /*waiting*/ ctx[1],
    				disabled: /*disabled*/ ctx[0]
    			})) + " svelte-1fmcpkt"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $currentStore;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(7, $currentStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PauseButton', slots, []);
    	let text;
    	let text2;
    	let disabled;
    	let waiting;
    	let gameStatus;
    	let isAm;

    	const refuel = () => {
    		if (disabled) {
    			return;
    		}

    		if (isAm) {
    			resources.update(o => set_1(o, 'powerLevel', o.powerLevel + 100));
    			resources.update(o => set_1(o, 'energy', o.energy - gameStatus.startupAmount));
    		} else {
    			resources$1.update(o => set_1(o, 'powerLevel', o.powerLevel + 100));
    			resources$1.update(o => set_1(o, 'energy', o.energy - gameStatus.startupAmount));
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PauseButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		classNames: classnames,
    		set: set_1,
    		times: times_1,
    		mResources: resources$1,
    		amResources: resources,
    		currentStore,
    		text,
    		text2,
    		disabled,
    		waiting,
    		gameStatus,
    		isAm,
    		refuel,
    		$currentStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('text2' in $$props) $$invalidate(3, text2 = $$props.text2);
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('waiting' in $$props) $$invalidate(1, waiting = $$props.waiting);
    		if ('gameStatus' in $$props) $$invalidate(5, gameStatus = $$props.gameStatus);
    		if ('isAm' in $$props) $$invalidate(6, isAm = $$props.isAm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentStore, gameStatus, disabled, isAm, text2, waiting*/ 235) {
    			{
    				$$invalidate(6, isAm = $currentStore.amDimension);
    				$$invalidate(5, gameStatus = $currentStore.gameStatus);
    				$$invalidate(1, waiting = $currentStore.resources.powerLevel === 0);
    				$$invalidate(0, disabled = gameStatus.startupTimer < 0);

    				if (disabled) {
    					$$invalidate(2, text = isAm ? 'DARK MELTDOWN' : 'MELTDOWN');
    					$$invalidate(3, text2 = 'Waiting');

    					times_1(1 + gameStatus.startupTimer % 3, () => {
    						$$invalidate(3, text2 += '.');
    					});
    				} else if (waiting) {
    					$$invalidate(2, text = isAm ? 'Start Antireactor' : 'Start Reactor');
    					$$invalidate(3, text2 = `(${gameStatus.startupAmount})`);
    				} else {
    					$$invalidate(2, text = isAm ? 'Operational' : 'Operational');
    					$$invalidate(3, text2 = '.');

    					if (isAm) {
    						times_1(4 - gameStatus.startupTimer % 3, () => {
    							$$invalidate(3, text2 += '..');
    						});
    					} else {
    						times_1(gameStatus.startupTimer % 5, () => {
    							$$invalidate(3, text2 += '..');
    						});
    					}
    				}
    			}
    		}
    	};

    	return [disabled, waiting, text, text2, refuel, gameStatus, isAm, $currentStore];
    }

    class PauseButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PauseButton",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/ui/ExpandButton.svelte generated by Svelte v3.43.1 */

    const file$g = "src/components/ui/ExpandButton.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(">");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`expandButton${/*open*/ ctx[0] ? ' open' : ''}`) + " svelte-1ilf22f"));
    			add_location(div, file$g, 35, 0, 588);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*open*/ 1 && div_class_value !== (div_class_value = "" + (null_to_empty(`expandButton${/*open*/ ctx[0] ? ' open' : ''}`) + " svelte-1ilf22f"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ExpandButton', slots, []);
    	let { open = false } = $$props;

    	let { onClick = () => {
    		
    	} } = $$props;

    	const writable_props = ['open', 'onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ExpandButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onClick();

    	$$self.$$set = $$props => {
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({ open, onClick });

    	$$self.$inject_state = $$props => {
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, onClick, click_handler];
    }

    class ExpandButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { open: 0, onClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpandButton",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get open() {
    		throw new Error("<ExpandButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<ExpandButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<ExpandButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<ExpandButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/StatsPanel.svelte generated by Svelte v3.43.1 */
    const file$f = "src/components/StatsPanel.svelte";

    // (72:1) {#if expanded}
    function create_if_block$5(ctx) {
    	let div6;
    	let u;
    	let b1;
    	let t0;
    	let b0;
    	let t1;
    	let div0;
    	let t2;
    	let t3_value = (/*gameStatus*/ ctx[0].p * 100).toFixed(2) + "";
    	let t3;
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let t7_value = /*gameStatus*/ ctx[0].n + "";
    	let t7;
    	let t8;
    	let div2;
    	let t9;
    	let t10_value = /*gameStatus*/ ctx[0].e + "";
    	let t10;
    	let t11;
    	let div3;
    	let t12;
    	let t13_value = /*gameStatus*/ ctx[0].f + "";
    	let t13;
    	let t14;
    	let div4;
    	let t15;
    	let t16_value = (/*gameStatus*/ ctx[0].pf * 100).toFixed(2) + "";
    	let t16;
    	let t17;
    	let t18;
    	let div5;
    	let t19;
    	let t20_value = (/*gameStatus*/ ctx[0].pt * 100).toFixed(2) + "";
    	let t20;
    	let t21;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			u = element("u");
    			b1 = element("b");
    			t0 = text("Detailed Stats Breakdown");
    			b0 = element("b");
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Resonance Escape Probability: ");
    			t3 = text(t3_value);
    			t4 = text("%");
    			t5 = space();
    			div1 = element("div");
    			t6 = text("Reproduction factor: ");
    			t7 = text(t7_value);
    			t8 = space();
    			div2 = element("div");
    			t9 = text("Fast Fission Factor: ");
    			t10 = text(t10_value);
    			t11 = space();
    			div3 = element("div");
    			t12 = text("Thermal Utilization Factor: ");
    			t13 = text(t13_value);
    			t14 = space();
    			div4 = element("div");
    			t15 = text("Fast Non-leakage Probability: ");
    			t16 = text(t16_value);
    			t17 = text("%");
    			t18 = space();
    			div5 = element("div");
    			t19 = text("Thermal Non-leakage Probability: ");
    			t20 = text(t20_value);
    			t21 = text("%");
    			add_location(b0, file$f, 73, 33, 1565);
    			add_location(b1, file$f, 73, 6, 1538);
    			add_location(u, file$f, 73, 3, 1535);
    			add_location(div0, file$f, 74, 3, 1576);
    			add_location(div1, file$f, 75, 3, 1655);
    			add_location(div2, file$f, 76, 3, 1705);
    			add_location(div3, file$f, 77, 3, 1755);
    			add_location(div4, file$f, 78, 3, 1812);
    			add_location(div5, file$f, 79, 3, 1892);
    			attr_dev(div6, "class", "statsPanel-details svelte-4hihc0");
    			add_location(div6, file$f, 72, 2, 1499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, u);
    			append_dev(u, b1);
    			append_dev(b1, t0);
    			append_dev(b1, b0);
    			append_dev(div6, t1);
    			append_dev(div6, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(div6, t5);
    			append_dev(div6, div1);
    			append_dev(div1, t6);
    			append_dev(div1, t7);
    			append_dev(div6, t8);
    			append_dev(div6, div2);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div6, t11);
    			append_dev(div6, div3);
    			append_dev(div3, t12);
    			append_dev(div3, t13);
    			append_dev(div6, t14);
    			append_dev(div6, div4);
    			append_dev(div4, t15);
    			append_dev(div4, t16);
    			append_dev(div4, t17);
    			append_dev(div6, t18);
    			append_dev(div6, div5);
    			append_dev(div5, t19);
    			append_dev(div5, t20);
    			append_dev(div5, t21);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameStatus*/ 1 && t3_value !== (t3_value = (/*gameStatus*/ ctx[0].p * 100).toFixed(2) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*gameStatus*/ 1 && t7_value !== (t7_value = /*gameStatus*/ ctx[0].n + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*gameStatus*/ 1 && t10_value !== (t10_value = /*gameStatus*/ ctx[0].e + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*gameStatus*/ 1 && t13_value !== (t13_value = /*gameStatus*/ ctx[0].f + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*gameStatus*/ 1 && t16_value !== (t16_value = (/*gameStatus*/ ctx[0].pf * 100).toFixed(2) + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*gameStatus*/ 1 && t20_value !== (t20_value = (/*gameStatus*/ ctx[0].pt * 100).toFixed(2) + "")) set_data_dev(t20, t20_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(72:1) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div2;
    	let span;
    	let expandbutton;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let t3_value = (/*kInf*/ ctx[2] * 100).toFixed(2) + "";
    	let t3;
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let t7_value = (/*kEff*/ ctx[3] * 100).toFixed(2) + "";
    	let t7;
    	let t8;
    	let t9;
    	let current;

    	expandbutton = new ExpandButton({
    			props: {
    				open: /*expanded*/ ctx[1],
    				onClick: /*expandToggle*/ ctx[4],
    				class: "statsPanel-expandButton"
    			},
    			$$inline: true
    		});

    	let if_block = /*expanded*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			span = element("span");
    			create_component(expandbutton.$$.fragment);
    			t0 = text("\n\t\tStats");
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Power Level: ");
    			t3 = text(t3_value);
    			t4 = text("%");
    			t5 = space();
    			div1 = element("div");
    			t6 = text("Effeciency: ");
    			t7 = text(t7_value);
    			t8 = text("%");
    			t9 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "statsPanel-header svelte-4hihc0");
    			add_location(span, file$f, 65, 1, 1238);
    			add_location(div0, file$f, 69, 1, 1379);
    			add_location(div1, file$f, 70, 1, 1431);
    			attr_dev(div2, "class", "statsPanel svelte-4hihc0");
    			add_location(div2, file$f, 64, 0, 1212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span);
    			mount_component(expandbutton, span, null);
    			append_dev(span, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, t8);
    			append_dev(div2, t9);
    			if (if_block) if_block.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const expandbutton_changes = {};
    			if (dirty & /*expanded*/ 2) expandbutton_changes.open = /*expanded*/ ctx[1];
    			expandbutton.$set(expandbutton_changes);
    			if ((!current || dirty & /*kInf*/ 4) && t3_value !== (t3_value = (/*kInf*/ ctx[2] * 100).toFixed(2) + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty & /*kEff*/ 8) && t7_value !== (t7_value = (/*kEff*/ ctx[3] * 100).toFixed(2) + "")) set_data_dev(t7, t7_value);

    			if (/*expanded*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expandbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expandbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(expandbutton);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $currentStore;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(5, $currentStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StatsPanel', slots, []);
    	let expanded = false;
    	let kInf, kEff, gameStatus;

    	const expandToggle = () => {
    		$$invalidate(1, expanded = !expanded);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StatsPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		currentStore,
    		ExpandButton,
    		expanded,
    		kInf,
    		kEff,
    		gameStatus,
    		expandToggle,
    		$currentStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('expanded' in $$props) $$invalidate(1, expanded = $$props.expanded);
    		if ('kInf' in $$props) $$invalidate(2, kInf = $$props.kInf);
    		if ('kEff' in $$props) $$invalidate(3, kEff = $$props.kEff);
    		if ('gameStatus' in $$props) $$invalidate(0, gameStatus = $$props.gameStatus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentStore, gameStatus*/ 33) {
    			{
    				$$invalidate(0, gameStatus = $currentStore.gameStatus);
    				$$invalidate(2, kInf = gameStatus.pf * gameStatus.pt * gameStatus.e * gameStatus.n * gameStatus.f * gameStatus.p);
    				$$invalidate(3, kEff = gameStatus.pf * gameStatus.pt);
    			}
    		}
    	};

    	return [gameStatus, expanded, kInf, kEff, expandToggle, $currentStore];
    }

    class StatsPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StatsPanel",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/ResourceCounter.svelte generated by Svelte v3.43.1 */
    const file$e = "src/components/ResourceCounter.svelte";

    function create_fragment$e(ctx) {
    	let div4;
    	let div0;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = /*resources*/ ctx[0].powerLevel + "";
    	let t2;
    	let span1_class_value;
    	let t3;
    	let span2;
    	let t4;
    	let t5_value = /*gameStatus*/ ctx[1].maxNeutrons + "";
    	let t5;
    	let t6;
    	let div1;
    	let span3;
    	let t8;
    	let span4;
    	let t9_value = /*resources*/ ctx[0].energy + "";
    	let t9;
    	let span4_class_value;
    	let t10;
    	let span5;
    	let t11;
    	let t12_value = /*gameStatus*/ ctx[1].maxEnergy + "";
    	let t12;
    	let t13;
    	let div2;
    	let span6;
    	let t15;
    	let span7;
    	let t16_value = /*poisonValue*/ ctx[2].toFixed(2) + "";
    	let t16;
    	let t17;
    	let span7_class_value;
    	let t18;
    	let div3;
    	let span8;
    	let t20;
    	let span9;
    	let t21_value = parseInt(/*resources*/ ctx[0].waste) + "";
    	let t21;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Power Lvl:";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text("/");
    			t5 = text(t5_value);
    			t6 = space();
    			div1 = element("div");
    			span3 = element("span");
    			span3.textContent = "Energy:";
    			t8 = space();
    			span4 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			span5 = element("span");
    			t11 = text("/");
    			t12 = text(t12_value);
    			t13 = space();
    			div2 = element("div");
    			span6 = element("span");
    			span6.textContent = "Poison:";
    			t15 = space();
    			span7 = element("span");
    			t16 = text(t16_value);
    			t17 = text("%");
    			t18 = space();
    			div3 = element("div");
    			span8 = element("span");
    			span8.textContent = "Waste:";
    			t20 = space();
    			span9 = element("span");
    			t21 = text(t21_value);
    			attr_dev(span0, "class", "counter-label svelte-19wpsp");
    			add_location(span0, file$e, 83, 3, 1674);
    			attr_dev(span1, "class", span1_class_value = "" + (null_to_empty(/*powerClasses*/ ctx[4]) + " svelte-19wpsp"));
    			add_location(span1, file$e, 84, 3, 1724);
    			attr_dev(span2, "class", "counter-denominator svelte-19wpsp");
    			add_location(span2, file$e, 85, 3, 1784);
    			attr_dev(div0, "class", "counter-container svelte-19wpsp");
    			add_location(div0, file$e, 82, 2, 1639);
    			attr_dev(span3, "class", "counter-label svelte-19wpsp");
    			add_location(span3, file$e, 88, 3, 1897);
    			attr_dev(span4, "class", span4_class_value = "" + (null_to_empty(/*energyClasses*/ ctx[3]) + " svelte-19wpsp"));
    			add_location(span4, file$e, 89, 3, 1944);
    			attr_dev(span5, "class", "counter-denominator svelte-19wpsp");
    			add_location(span5, file$e, 90, 3, 2001);
    			attr_dev(div1, "class", "counter-container svelte-19wpsp");
    			add_location(div1, file$e, 87, 2, 1862);
    			attr_dev(span6, "class", "counter-label svelte-19wpsp");
    			add_location(span6, file$e, 93, 3, 2112);
    			attr_dev(span7, "class", span7_class_value = "" + (null_to_empty(/*poisonClasses*/ ctx[5]) + " svelte-19wpsp"));
    			add_location(span7, file$e, 94, 3, 2159);
    			attr_dev(div2, "class", "counter-container svelte-19wpsp");
    			add_location(div2, file$e, 92, 2, 2077);
    			attr_dev(span8, "class", "counter-label svelte-19wpsp");
    			add_location(span8, file$e, 97, 3, 2282);
    			attr_dev(span9, "class", "counter-value");
    			add_location(span9, file$e, 98, 3, 2328);
    			attr_dev(div3, "class", "counter-container waste-container svelte-19wpsp");
    			add_location(div3, file$e, 96, 2, 2231);
    			attr_dev(div4, "class", "neutron-counter svelte-19wpsp");
    			add_location(div4, file$e, 81, 0, 1607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, span2);
    			append_dev(span2, t4);
    			append_dev(span2, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div1);
    			append_dev(div1, span3);
    			append_dev(div1, t8);
    			append_dev(div1, span4);
    			append_dev(span4, t9);
    			append_dev(div1, t10);
    			append_dev(div1, span5);
    			append_dev(span5, t11);
    			append_dev(span5, t12);
    			append_dev(div4, t13);
    			append_dev(div4, div2);
    			append_dev(div2, span6);
    			append_dev(div2, t15);
    			append_dev(div2, span7);
    			append_dev(span7, t16);
    			append_dev(span7, t17);
    			append_dev(div4, t18);
    			append_dev(div4, div3);
    			append_dev(div3, span8);
    			append_dev(div3, t20);
    			append_dev(div3, span9);
    			append_dev(span9, t21);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resources*/ 1 && t2_value !== (t2_value = /*resources*/ ctx[0].powerLevel + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*powerClasses*/ 16 && span1_class_value !== (span1_class_value = "" + (null_to_empty(/*powerClasses*/ ctx[4]) + " svelte-19wpsp"))) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (dirty & /*gameStatus*/ 2 && t5_value !== (t5_value = /*gameStatus*/ ctx[1].maxNeutrons + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*resources*/ 1 && t9_value !== (t9_value = /*resources*/ ctx[0].energy + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*energyClasses*/ 8 && span4_class_value !== (span4_class_value = "" + (null_to_empty(/*energyClasses*/ ctx[3]) + " svelte-19wpsp"))) {
    				attr_dev(span4, "class", span4_class_value);
    			}

    			if (dirty & /*gameStatus*/ 2 && t12_value !== (t12_value = /*gameStatus*/ ctx[1].maxEnergy + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*poisonValue*/ 4 && t16_value !== (t16_value = /*poisonValue*/ ctx[2].toFixed(2) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*poisonClasses*/ 32 && span7_class_value !== (span7_class_value = "" + (null_to_empty(/*poisonClasses*/ ctx[5]) + " svelte-19wpsp"))) {
    				attr_dev(span7, "class", span7_class_value);
    			}

    			if (dirty & /*resources*/ 1 && t21_value !== (t21_value = parseInt(/*resources*/ ctx[0].waste) + "")) set_data_dev(t21, t21_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $currentStore;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(7, $currentStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ResourceCounter', slots, []);
    	let resources, gameStatus, poisonAmount;
    	let energyClasses, powerClasses, poisonClasses, poisonValue;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ResourceCounter> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		classNames: classnames,
    		currentStore,
    		resources,
    		gameStatus,
    		poisonAmount,
    		energyClasses,
    		powerClasses,
    		poisonClasses,
    		poisonValue,
    		$currentStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('resources' in $$props) $$invalidate(0, resources = $$props.resources);
    		if ('gameStatus' in $$props) $$invalidate(1, gameStatus = $$props.gameStatus);
    		if ('poisonAmount' in $$props) $$invalidate(6, poisonAmount = $$props.poisonAmount);
    		if ('energyClasses' in $$props) $$invalidate(3, energyClasses = $$props.energyClasses);
    		if ('powerClasses' in $$props) $$invalidate(4, powerClasses = $$props.powerClasses);
    		if ('poisonClasses' in $$props) $$invalidate(5, poisonClasses = $$props.poisonClasses);
    		if ('poisonValue' in $$props) $$invalidate(2, poisonValue = $$props.poisonValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentStore, resources, gameStatus, poisonAmount, poisonValue*/ 199) {
    			{
    				$$invalidate(0, resources = $currentStore.resources);
    				$$invalidate(1, gameStatus = $currentStore.gameStatus);
    				$$invalidate(6, poisonAmount = $currentStore.poisonAmount);

    				$$invalidate(4, powerClasses = classnames('counter-value', {
    					'counter-value-danger': resources.powerLevel / gameStatus.maxNeutrons >= .9
    				}));

    				$$invalidate(3, energyClasses = classnames('counter-value', {
    					'counter-value-danger': resources.energy / gameStatus.maxEnergy >= .9
    				}));

    				$$invalidate(2, poisonValue = poisonAmount / Math.max(resources.powerLevel, 1));

    				$$invalidate(5, poisonClasses = classnames('counter-value', {
    					'counter-value-danger': poisonValue >= 90
    				}));
    			}
    		}
    	};

    	return [
    		resources,
    		gameStatus,
    		poisonValue,
    		energyClasses,
    		powerClasses,
    		poisonClasses,
    		poisonAmount,
    		$currentStore
    	];
    }

    class ResourceCounter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResourceCounter",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /**
     * @name isDate
     * @category Common Helpers
     * @summary Is the given value a date?
     *
     * @description
     * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {*} value - the value to check
     * @returns {boolean} true if the given value is a date
     * @throws {TypeError} 1 arguments required
     *
     * @example
     * // For a valid date:
     * const result = isDate(new Date())
     * //=> true
     *
     * @example
     * // For an invalid date:
     * const result = isDate(new Date(NaN))
     * //=> true
     *
     * @example
     * // For some value:
     * const result = isDate('2014-02-31')
     * //=> false
     *
     * @example
     * // For an object:
     * const result = isDate({})
     * //=> false
     */

    function isDate(value) {
      requiredArgs(1, arguments);
      return value instanceof Date || typeof value === 'object' && Object.prototype.toString.call(value) === '[object Date]';
    }

    /**
     * @name isValid
     * @category Common Helpers
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - Now `isValid` doesn't throw an exception
     *   if the first argument is not an instance of Date.
     *   Instead, argument is converted beforehand using `toDate`.
     *
     *   Examples:
     *
     *   | `isValid` argument        | Before v2.0.0 | v2.0.0 onward |
     *   |---------------------------|---------------|---------------|
     *   | `new Date()`              | `true`        | `true`        |
     *   | `new Date('2016-01-01')`  | `true`        | `true`        |
     *   | `new Date('')`            | `false`       | `false`       |
     *   | `new Date(1488370835081)` | `true`        | `true`        |
     *   | `new Date(NaN)`           | `false`       | `false`       |
     *   | `'2016-01-01'`            | `TypeError`   | `false`       |
     *   | `''`                      | `TypeError`   | `false`       |
     *   | `1488370835081`           | `TypeError`   | `true`        |
     *   | `NaN`                     | `TypeError`   | `false`       |
     *
     *   We introduce this change to make *date-fns* consistent with ECMAScript behavior
     *   that try to coerce arguments to the expected type
     *   (which is also the case with other *date-fns* functions).
     *
     * @param {*} date - the date to check
     * @returns {Boolean} the date is valid
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // For the valid date:
     * const result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the value, convertable into a date:
     * const result = isValid(1393804800000)
     * //=> true
     *
     * @example
     * // For the invalid date:
     * const result = isValid(new Date(''))
     * //=> false
     */

    function isValid(dirtyDate) {
      requiredArgs(1, arguments);

      if (!isDate(dirtyDate) && typeof dirtyDate !== 'number') {
        return false;
      }

      var date = toDate(dirtyDate);
      return !isNaN(Number(date));
    }

    var formatDistanceLocale = {
      lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} seconds'
      },
      xSeconds: {
        one: '1 second',
        other: '{{count}} seconds'
      },
      halfAMinute: 'half a minute',
      lessThanXMinutes: {
        one: 'less than a minute',
        other: 'less than {{count}} minutes'
      },
      xMinutes: {
        one: '1 minute',
        other: '{{count}} minutes'
      },
      aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours'
      },
      xHours: {
        one: '1 hour',
        other: '{{count}} hours'
      },
      xDays: {
        one: '1 day',
        other: '{{count}} days'
      },
      aboutXWeeks: {
        one: 'about 1 week',
        other: 'about {{count}} weeks'
      },
      xWeeks: {
        one: '1 week',
        other: '{{count}} weeks'
      },
      aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months'
      },
      xMonths: {
        one: '1 month',
        other: '{{count}} months'
      },
      aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years'
      },
      xYears: {
        one: '1 year',
        other: '{{count}} years'
      },
      overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years'
      },
      almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years'
      }
    };

    var formatDistance = function (token, count, options) {
      var result;
      var tokenValue = formatDistanceLocale[token];

      if (typeof tokenValue === 'string') {
        result = tokenValue;
      } else if (count === 1) {
        result = tokenValue.one;
      } else {
        result = tokenValue.other.replace('{{count}}', count.toString());
      }

      if (options !== null && options !== void 0 && options.addSuffix) {
        if (options.comparison && options.comparison > 0) {
          return 'in ' + result;
        } else {
          return result + ' ago';
        }
      }

      return result;
    };

    var formatDistance$1 = formatDistance;

    function buildFormatLongFn(args) {
      return function () {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // TODO: Remove String()
        var width = options.width ? String(options.width) : args.defaultWidth;
        var format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
      };
    }

    var dateFormats = {
      full: 'EEEE, MMMM do, y',
      long: 'MMMM do, y',
      medium: 'MMM d, y',
      short: 'MM/dd/yyyy'
    };
    var timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };
    var dateTimeFormats = {
      full: "{{date}} 'at' {{time}}",
      long: "{{date}} 'at' {{time}}",
      medium: '{{date}}, {{time}}',
      short: '{{date}}, {{time}}'
    };
    var formatLong = {
      date: buildFormatLongFn({
        formats: dateFormats,
        defaultWidth: 'full'
      }),
      time: buildFormatLongFn({
        formats: timeFormats,
        defaultWidth: 'full'
      }),
      dateTime: buildFormatLongFn({
        formats: dateTimeFormats,
        defaultWidth: 'full'
      })
    };
    var formatLong$1 = formatLong;

    var formatRelativeLocale = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: 'P'
    };

    var formatRelative = function (token, _date, _baseDate, _options) {
      return formatRelativeLocale[token];
    };

    var formatRelative$1 = formatRelative;

    function buildLocalizeFn(args) {
      return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {};
        var context = options.context ? String(options.context) : 'standalone';
        var valuesArray;

        if (context === 'formatting' && args.formattingValues) {
          var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
          var width = options.width ? String(options.width) : defaultWidth;
          valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
          var _defaultWidth = args.defaultWidth;

          var _width = options.width ? String(options.width) : args.defaultWidth;

          valuesArray = args.values[_width] || args.values[_defaultWidth];
        }

        var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex; // @ts-ignore: For some reason TypeScript just don't want to match it, no matter how hard we try. I challange you to try to remove it!

        return valuesArray[index];
      };
    }

    var eraValues = {
      narrow: ['B', 'A'],
      abbreviated: ['BC', 'AD'],
      wide: ['Before Christ', 'Anno Domini']
    };
    var quarterValues = {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
    }; // Note: in English, the names of days of the week and months are capitalized.
    // If you are making a new locale based on this one, check if the same is true for the language you're working on.
    // Generally, formatted dates should look like they are in the middle of a sentence,
    // e.g. in Spanish language the weekdays and months should be in the lowercase.

    var monthValues = {
      narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
    var dayValues = {
      narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    var dayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      }
    };
    var formattingDayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      }
    };

    var ordinalNumber = function (dirtyNumber, _options) {
      var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
      // if they are different for different grammatical genders,
      // use `options.unit`.
      //
      // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
      // 'day', 'hour', 'minute', 'second'.

      var rem100 = number % 100;

      if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
          case 1:
            return number + 'st';

          case 2:
            return number + 'nd';

          case 3:
            return number + 'rd';
        }
      }

      return number + 'th';
    };

    var localize = {
      ordinalNumber: ordinalNumber,
      era: buildLocalizeFn({
        values: eraValues,
        defaultWidth: 'wide'
      }),
      quarter: buildLocalizeFn({
        values: quarterValues,
        defaultWidth: 'wide',
        argumentCallback: function (quarter) {
          return quarter - 1;
        }
      }),
      month: buildLocalizeFn({
        values: monthValues,
        defaultWidth: 'wide'
      }),
      day: buildLocalizeFn({
        values: dayValues,
        defaultWidth: 'wide'
      }),
      dayPeriod: buildLocalizeFn({
        values: dayPeriodValues,
        defaultWidth: 'wide',
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: 'wide'
      })
    };
    var localize$1 = localize;

    function buildMatchFn(args) {
      return function (string) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var width = options.width;
        var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
        var matchResult = string.match(matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
        var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function (pattern) {
          return pattern.test(matchedString);
        }) : findKey(parsePatterns, function (pattern) {
          return pattern.test(matchedString);
        });
        var value;
        value = args.valueCallback ? args.valueCallback(key) : key;
        value = options.valueCallback ? options.valueCallback(value) : value;
        var rest = string.slice(matchedString.length);
        return {
          value: value,
          rest: rest
        };
      };
    }

    function findKey(object, predicate) {
      for (var key in object) {
        if (object.hasOwnProperty(key) && predicate(object[key])) {
          return key;
        }
      }

      return undefined;
    }

    function findIndex(array, predicate) {
      for (var key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
          return key;
        }
      }

      return undefined;
    }

    function buildMatchPatternFn(args) {
      return function (string) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var matchResult = string.match(args.matchPattern);
        if (!matchResult) return null;
        var matchedString = matchResult[0];
        var parseResult = string.match(args.parsePattern);
        if (!parseResult) return null;
        var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
        value = options.valueCallback ? options.valueCallback(value) : value;
        var rest = string.slice(matchedString.length);
        return {
          value: value,
          rest: rest
        };
      };
    }

    var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
    var parseOrdinalNumberPattern = /\d+/i;
    var matchEraPatterns = {
      narrow: /^(b|a)/i,
      abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
      wide: /^(before christ|before common era|anno domini|common era)/i
    };
    var parseEraPatterns = {
      any: [/^b/i, /^(a|c)/i]
    };
    var matchQuarterPatterns = {
      narrow: /^[1234]/i,
      abbreviated: /^q[1234]/i,
      wide: /^[1234](th|st|nd|rd)? quarter/i
    };
    var parseQuarterPatterns = {
      any: [/1/i, /2/i, /3/i, /4/i]
    };
    var matchMonthPatterns = {
      narrow: /^[jfmasond]/i,
      abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };
    var parseMonthPatterns = {
      narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
      any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };
    var matchDayPatterns = {
      narrow: /^[smtwf]/i,
      short: /^(su|mo|tu|we|th|fr|sa)/i,
      abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
      wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };
    var parseDayPatterns = {
      narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
      any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };
    var matchDayPeriodPatterns = {
      narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
      any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
    };
    var parseDayPeriodPatterns = {
      any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i
      }
    };
    var match = {
      ordinalNumber: buildMatchPatternFn({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: function (value) {
          return parseInt(value, 10);
        }
      }),
      era: buildMatchFn({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseEraPatterns,
        defaultParseWidth: 'any'
      }),
      quarter: buildMatchFn({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: 'any',
        valueCallback: function (index) {
          return index + 1;
        }
      }),
      month: buildMatchFn({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: 'any'
      }),
      day: buildMatchFn({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseDayPatterns,
        defaultParseWidth: 'any'
      }),
      dayPeriod: buildMatchFn({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: 'any',
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: 'any'
      })
    };
    var match$1 = match;

    /**
     * @type {Locale}
     * @category Locales
     * @summary English locale (United States).
     * @language English
     * @iso-639-2 eng
     * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
     * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
     */
    var locale = {
      code: 'en-US',
      formatDistance: formatDistance$1,
      formatLong: formatLong$1,
      formatRelative: formatRelative$1,
      localize: localize$1,
      match: match$1,
      options: {
        weekStartsOn: 0
        /* Sunday */
        ,
        firstWeekContainsDate: 1
      }
    };
    var defaultLocale = locale;

    /**
     * @name subMilliseconds
     * @category Millisecond Helpers
     * @summary Subtract the specified number of milliseconds from the given date.
     *
     * @description
     * Subtract the specified number of milliseconds from the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds subtracted
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
     * const result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:29.250
     */

    function subMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var amount = toInteger(dirtyAmount);
      return addMilliseconds(dirtyDate, -amount);
    }

    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();

      while (output.length < targetLength) {
        output = '0' + output;
      }

      return sign + output;
    }

    /*
     * |     | Unit                           |     | Unit                           |
     * |-----|--------------------------------|-----|--------------------------------|
     * |  a  | AM, PM                         |  A* |                                |
     * |  d  | Day of month                   |  D  |                                |
     * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
     * |  m  | Minute                         |  M  | Month                          |
     * |  s  | Second                         |  S  | Fraction of second             |
     * |  y  | Year (abs)                     |  Y  |                                |
     *
     * Letters marked by * are not implemented but reserved by Unicode standard.
     */

    var formatters$2 = {
      // Year
      y: function (date, token) {
        // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
        var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
      },
      // Month
      M: function (date, token) {
        var month = date.getUTCMonth();
        return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
      },
      // Day of the month
      d: function (date, token) {
        return addLeadingZeros(date.getUTCDate(), token.length);
      },
      // AM or PM
      a: function (date, token) {
        var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
            return dayPeriodEnumValue.toUpperCase();

          case 'aaa':
            return dayPeriodEnumValue;

          case 'aaaaa':
            return dayPeriodEnumValue[0];

          case 'aaaa':
          default:
            return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
        }
      },
      // Hour [1-12]
      h: function (date, token) {
        return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
      },
      // Hour [0-23]
      H: function (date, token) {
        return addLeadingZeros(date.getUTCHours(), token.length);
      },
      // Minute
      m: function (date, token) {
        return addLeadingZeros(date.getUTCMinutes(), token.length);
      },
      // Second
      s: function (date, token) {
        return addLeadingZeros(date.getUTCSeconds(), token.length);
      },
      // Fraction of second
      S: function (date, token) {
        var numberOfDigits = token.length;
        var milliseconds = date.getUTCMilliseconds();
        var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
        return addLeadingZeros(fractionalSeconds, token.length);
      }
    };
    var lightFormatters = formatters$2;

    var MILLISECONDS_IN_DAY = 86400000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCDayOfYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var timestamp = date.getTime();
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      var startOfYearTimestamp = date.getTime();
      var difference = timestamp - startOfYearTimestamp;
      return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var weekStartsOn = 1;
      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var year = date.getUTCFullYear();
      var fourthOfJanuaryOfNextYear = new Date(0);
      fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
      fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
      var fourthOfJanuaryOfThisYear = new Date(0);
      fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
      fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var year = getUTCISOWeekYear(dirtyDate);
      var fourthOfJanuary = new Date(0);
      fourthOfJanuary.setUTCFullYear(year, 0, 4);
      fourthOfJanuary.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCISOWeek(fourthOfJanuary);
      return date;
    }

    var MILLISECONDS_IN_WEEK$1 = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeek(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate, dirtyOptions);
      var year = date.getUTCFullYear();
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var firstWeekOfNextYear = new Date(0);
      firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
      firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
      var firstWeekOfThisYear = new Date(0);
      firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
      var year = getUTCWeekYear(dirtyDate, dirtyOptions);
      var firstWeek = new Date(0);
      firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeek.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCWeek(firstWeek, dirtyOptions);
      return date;
    }

    var MILLISECONDS_IN_WEEK = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeek(dirtyDate, options) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }

    var dayPeriodEnum = {
      am: 'am',
      pm: 'pm',
      midnight: 'midnight',
      noon: 'noon',
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'night'
    };
    /*
     * |     | Unit                           |     | Unit                           |
     * |-----|--------------------------------|-----|--------------------------------|
     * |  a  | AM, PM                         |  A* | Milliseconds in day            |
     * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
     * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
     * |  d  | Day of month                   |  D  | Day of year                    |
     * |  e  | Local day of week              |  E  | Day of week                    |
     * |  f  |                                |  F* | Day of week in month           |
     * |  g* | Modified Julian day            |  G  | Era                            |
     * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
     * |  i! | ISO day of week                |  I! | ISO week of year               |
     * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
     * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
     * |  l* | (deprecated)                   |  L  | Stand-alone month              |
     * |  m  | Minute                         |  M  | Month                          |
     * |  n  |                                |  N  |                                |
     * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
     * |  p! | Long localized time            |  P! | Long localized date            |
     * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
     * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
     * |  s  | Second                         |  S  | Fraction of second             |
     * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
     * |  u  | Extended year                  |  U* | Cyclic year                    |
     * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
     * |  w  | Local week of year             |  W* | Week of month                  |
     * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
     * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
     * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
     *
     * Letters marked by * are not implemented but reserved by Unicode standard.
     *
     * Letters marked by ! are non-standard, but implemented by date-fns:
     * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
     * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
     *   i.e. 7 for Sunday, 1 for Monday, etc.
     * - `I` is ISO week of year, as opposed to `w` which is local week of year.
     * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
     *   `R` is supposed to be used in conjunction with `I` and `i`
     *   for universal ISO week-numbering date, whereas
     *   `Y` is supposed to be used in conjunction with `w` and `e`
     *   for week-numbering date specific to the locale.
     * - `P` is long localized date format
     * - `p` is long localized time format
     */

    var formatters = {
      // Era
      G: function (date, token, localize) {
        var era = date.getUTCFullYear() > 0 ? 1 : 0;

        switch (token) {
          // AD, BC
          case 'G':
          case 'GG':
          case 'GGG':
            return localize.era(era, {
              width: 'abbreviated'
            });
          // A, B

          case 'GGGGG':
            return localize.era(era, {
              width: 'narrow'
            });
          // Anno Domini, Before Christ

          case 'GGGG':
          default:
            return localize.era(era, {
              width: 'wide'
            });
        }
      },
      // Year
      y: function (date, token, localize) {
        // Ordinal number
        if (token === 'yo') {
          var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

          var year = signedYear > 0 ? signedYear : 1 - signedYear;
          return localize.ordinalNumber(year, {
            unit: 'year'
          });
        }

        return lightFormatters.y(date, token);
      },
      // Local week-numbering year
      Y: function (date, token, localize, options) {
        var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

        if (token === 'YY') {
          var twoDigitYear = weekYear % 100;
          return addLeadingZeros(twoDigitYear, 2);
        } // Ordinal number


        if (token === 'Yo') {
          return localize.ordinalNumber(weekYear, {
            unit: 'year'
          });
        } // Padding


        return addLeadingZeros(weekYear, token.length);
      },
      // ISO week-numbering year
      R: function (date, token) {
        var isoWeekYear = getUTCISOWeekYear(date); // Padding

        return addLeadingZeros(isoWeekYear, token.length);
      },
      // Extended year. This is a single number designating the year of this calendar system.
      // The main difference between `y` and `u` localizers are B.C. years:
      // | Year | `y` | `u` |
      // |------|-----|-----|
      // | AC 1 |   1 |   1 |
      // | BC 1 |   1 |   0 |
      // | BC 2 |   2 |  -1 |
      // Also `yy` always returns the last two digits of a year,
      // while `uu` pads single digit years to 2 characters and returns other years unchanged.
      u: function (date, token) {
        var year = date.getUTCFullYear();
        return addLeadingZeros(year, token.length);
      },
      // Quarter
      Q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'Q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'QQ':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'Qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'QQQ':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'QQQQQ':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'formatting'
            });
          // 1st quarter, 2nd quarter, ...

          case 'QQQQ':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone quarter
      q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'qq':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'qqq':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'qqqqq':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'standalone'
            });
          // 1st quarter, 2nd quarter, ...

          case 'qqqq':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Month
      M: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          case 'M':
          case 'MM':
            return lightFormatters.M(date, token);
          // 1st, 2nd, ..., 12th

          case 'Mo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'MMM':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // J, F, ..., D

          case 'MMMMM':
            return localize.month(month, {
              width: 'narrow',
              context: 'formatting'
            });
          // January, February, ..., December

          case 'MMMM':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone month
      L: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          // 1, 2, ..., 12
          case 'L':
            return String(month + 1);
          // 01, 02, ..., 12

          case 'LL':
            return addLeadingZeros(month + 1, 2);
          // 1st, 2nd, ..., 12th

          case 'Lo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'LLL':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // J, F, ..., D

          case 'LLLLL':
            return localize.month(month, {
              width: 'narrow',
              context: 'standalone'
            });
          // January, February, ..., December

          case 'LLLL':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Local week of year
      w: function (date, token, localize, options) {
        var week = getUTCWeek(date, options);

        if (token === 'wo') {
          return localize.ordinalNumber(week, {
            unit: 'week'
          });
        }

        return addLeadingZeros(week, token.length);
      },
      // ISO week of year
      I: function (date, token, localize) {
        var isoWeek = getUTCISOWeek(date);

        if (token === 'Io') {
          return localize.ordinalNumber(isoWeek, {
            unit: 'week'
          });
        }

        return addLeadingZeros(isoWeek, token.length);
      },
      // Day of the month
      d: function (date, token, localize) {
        if (token === 'do') {
          return localize.ordinalNumber(date.getUTCDate(), {
            unit: 'date'
          });
        }

        return lightFormatters.d(date, token);
      },
      // Day of year
      D: function (date, token, localize) {
        var dayOfYear = getUTCDayOfYear(date);

        if (token === 'Do') {
          return localize.ordinalNumber(dayOfYear, {
            unit: 'dayOfYear'
          });
        }

        return addLeadingZeros(dayOfYear, token.length);
      },
      // Day of week
      E: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();

        switch (token) {
          // Tue
          case 'E':
          case 'EE':
          case 'EEE':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'EEEEE':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'EEEEEE':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'EEEE':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Local day of week
      e: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (Nth day of week with current locale or weekStartsOn)
          case 'e':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'ee':
            return addLeadingZeros(localDayOfWeek, 2);
          // 1st, 2nd, ..., 7th

          case 'eo':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'eee':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'eeeee':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'eeeeee':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'eeee':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone local day of week
      c: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (same as in `e`)
          case 'c':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'cc':
            return addLeadingZeros(localDayOfWeek, token.length);
          // 1st, 2nd, ..., 7th

          case 'co':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'ccc':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // T

          case 'ccccc':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'standalone'
            });
          // Tu

          case 'cccccc':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'standalone'
            });
          // Tuesday

          case 'cccc':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // ISO day of week
      i: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();
        var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

        switch (token) {
          // 2
          case 'i':
            return String(isoDayOfWeek);
          // 02

          case 'ii':
            return addLeadingZeros(isoDayOfWeek, token.length);
          // 2nd

          case 'io':
            return localize.ordinalNumber(isoDayOfWeek, {
              unit: 'day'
            });
          // Tue

          case 'iii':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'iiiii':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'iiiiii':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'iiii':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM or PM
      a: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'aaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            }).toLowerCase();

          case 'aaaaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'aaaa':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM, PM, midnight, noon
      b: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours === 12) {
          dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
          dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
          dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        }

        switch (token) {
          case 'b':
          case 'bb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'bbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            }).toLowerCase();

          case 'bbbbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'bbbb':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // in the morning, in the afternoon, in the evening, at night
      B: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours >= 17) {
          dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
          dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
          dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
          dayPeriodEnumValue = dayPeriodEnum.night;
        }

        switch (token) {
          case 'B':
          case 'BB':
          case 'BBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'BBBBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'BBBB':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Hour [1-12]
      h: function (date, token, localize) {
        if (token === 'ho') {
          var hours = date.getUTCHours() % 12;
          if (hours === 0) hours = 12;
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return lightFormatters.h(date, token);
      },
      // Hour [0-23]
      H: function (date, token, localize) {
        if (token === 'Ho') {
          return localize.ordinalNumber(date.getUTCHours(), {
            unit: 'hour'
          });
        }

        return lightFormatters.H(date, token);
      },
      // Hour [0-11]
      K: function (date, token, localize) {
        var hours = date.getUTCHours() % 12;

        if (token === 'Ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Hour [1-24]
      k: function (date, token, localize) {
        var hours = date.getUTCHours();
        if (hours === 0) hours = 24;

        if (token === 'ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Minute
      m: function (date, token, localize) {
        if (token === 'mo') {
          return localize.ordinalNumber(date.getUTCMinutes(), {
            unit: 'minute'
          });
        }

        return lightFormatters.m(date, token);
      },
      // Second
      s: function (date, token, localize) {
        if (token === 'so') {
          return localize.ordinalNumber(date.getUTCSeconds(), {
            unit: 'second'
          });
        }

        return lightFormatters.s(date, token);
      },
      // Fraction of second
      S: function (date, token) {
        return lightFormatters.S(date, token);
      },
      // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
      X: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        if (timezoneOffset === 0) {
          return 'Z';
        }

        switch (token) {
          // Hours and optional minutes
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XX`

          case 'XXXX':
          case 'XX':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XXX`

          case 'XXXXX':
          case 'XXX': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
      x: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Hours and optional minutes
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xx`

          case 'xxxx':
          case 'xx':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xxx`

          case 'xxxxx':
          case 'xxx': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (GMT)
      O: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (specific non-location)
      z: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'z':
          case 'zz':
          case 'zzz':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'zzzz':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Seconds timestamp
      t: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = Math.floor(originalDate.getTime() / 1000);
        return addLeadingZeros(timestamp, token.length);
      },
      // Milliseconds timestamp
      T: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = originalDate.getTime();
        return addLeadingZeros(timestamp, token.length);
      }
    };

    function formatTimezoneShort(offset, dirtyDelimiter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;

      if (minutes === 0) {
        return sign + String(hours);
      }

      var delimiter = dirtyDelimiter || '';
      return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
    }

    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
      }

      return formatTimezone(offset, dirtyDelimiter);
    }

    function formatTimezone(offset, dirtyDelimiter) {
      var delimiter = dirtyDelimiter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
      var minutes = addLeadingZeros(absOffset % 60, 2);
      return sign + hours + delimiter + minutes;
    }

    var formatters$1 = formatters;

    function dateLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'P':
          return formatLong.date({
            width: 'short'
          });

        case 'PP':
          return formatLong.date({
            width: 'medium'
          });

        case 'PPP':
          return formatLong.date({
            width: 'long'
          });

        case 'PPPP':
        default:
          return formatLong.date({
            width: 'full'
          });
      }
    }

    function timeLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'p':
          return formatLong.time({
            width: 'short'
          });

        case 'pp':
          return formatLong.time({
            width: 'medium'
          });

        case 'ppp':
          return formatLong.time({
            width: 'long'
          });

        case 'pppp':
        default:
          return formatLong.time({
            width: 'full'
          });
      }
    }

    function dateTimeLongFormatter(pattern, formatLong) {
      var matchResult = pattern.match(/(P+)(p+)?/);
      var datePattern = matchResult[1];
      var timePattern = matchResult[2];

      if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
      }

      var dateTimeFormat;

      switch (datePattern) {
        case 'P':
          dateTimeFormat = formatLong.dateTime({
            width: 'short'
          });
          break;

        case 'PP':
          dateTimeFormat = formatLong.dateTime({
            width: 'medium'
          });
          break;

        case 'PPP':
          dateTimeFormat = formatLong.dateTime({
            width: 'long'
          });
          break;

        case 'PPPP':
        default:
          dateTimeFormat = formatLong.dateTime({
            width: 'full'
          });
          break;
      }

      return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
    }

    var longFormatters = {
      p: timeLongFormatter,
      P: dateTimeLongFormatter
    };
    var longFormatters$1 = longFormatters;

    /**
     * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
     * They usually appear for dates that denote time before the timezones were introduced
     * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
     * and GMT+01:00:00 after that date)
     *
     * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
     * which would lead to incorrect calculations.
     *
     * This function returns the timezone offset in milliseconds that takes seconds in account.
     */
    function getTimezoneOffsetInMilliseconds(date) {
      var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
      utcDate.setUTCFullYear(date.getFullYear());
      return date.getTime() - utcDate.getTime();
    }

    var protectedDayOfYearTokens = ['D', 'DD'];
    var protectedWeekYearTokens = ['YY', 'YYYY'];
    function isProtectedDayOfYearToken(token) {
      return protectedDayOfYearTokens.indexOf(token) !== -1;
    }
    function isProtectedWeekYearToken(token) {
      return protectedWeekYearTokens.indexOf(token) !== -1;
    }
    function throwProtectedError(token, format, input) {
      if (token === 'YYYY') {
        throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'YY') {
        throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'D') {
        throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'DD') {
        throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      }
    }

    // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
    //   (one of the certain letters followed by `o`)
    // - (\w)\1* matches any sequences of the same letter
    // - '' matches two quote characters in a row
    // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
    //   except a single quote symbol, which ends the sequence.
    //   Two quote characters do not end the sequence.
    //   If there is no matching single quote
    //   then the sequence will continue until the end of the string.
    // - . matches any single character unmatched by previous parts of the RegExps

    var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
    // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

    var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
    var escapedStringRegExp = /^'([^]*?)'?$/;
    var doubleQuoteRegExp = /''/g;
    var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
    /**
     * @name format
     * @category Common Helpers
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format. The result may vary by locale.
     *
     * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
     * > See: https://git.io/fxCyr
     *
     * The characters wrapped between two single quotes characters (') are escaped.
     * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
     * (see the last example)
     *
     * Format of the string is based on Unicode Technical Standard #35:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * with a few additions (see note 7 below the table).
     *
     * Accepted patterns:
     * | Unit                            | Pattern | Result examples                   | Notes |
     * |---------------------------------|---------|-----------------------------------|-------|
     * | Era                             | G..GGG  | AD, BC                            |       |
     * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
     * |                                 | GGGGG   | A, B                              |       |
     * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
     * |                                 | yy      | 44, 01, 00, 17                    | 5     |
     * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
     * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
     * |                                 | yyyyy   | ...                               | 3,5   |
     * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
     * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
     * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
     * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
     * |                                 | YYYYY   | ...                               | 3,5   |
     * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
     * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
     * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
     * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
     * |                                 | RRRRR   | ...                               | 3,5,7 |
     * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
     * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
     * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
     * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
     * |                                 | uuuuu   | ...                               | 3,5   |
     * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
     * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | QQ      | 01, 02, 03, 04                    |       |
     * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
     * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
     * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | qq      | 01, 02, 03, 04                    |       |
     * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
     * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
     * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | MM      | 01, 02, ..., 12                   |       |
     * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
     * |                                 | MMMM    | January, February, ..., December  | 2     |
     * |                                 | MMMMM   | J, F, ..., D                      |       |
     * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
     * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | LL      | 01, 02, ..., 12                   |       |
     * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
     * |                                 | LLLL    | January, February, ..., December  | 2     |
     * |                                 | LLLLL   | J, F, ..., D                      |       |
     * | Local week of year              | w       | 1, 2, ..., 53                     |       |
     * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | ww      | 01, 02, ..., 53                   |       |
     * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
     * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | II      | 01, 02, ..., 53                   | 7     |
     * | Day of month                    | d       | 1, 2, ..., 31                     |       |
     * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
     * |                                 | dd      | 01, 02, ..., 31                   |       |
     * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
     * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
     * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
     * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
     * |                                 | DDDD    | ...                               | 3     |
     * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
     * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
     * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
     * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
     * |                                 | ii      | 01, 02, ..., 07                   | 7     |
     * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
     * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
     * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
     * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
     * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
     * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | ee      | 02, 03, ..., 01                   |       |
     * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
     * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
     * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
     * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | cc      | 02, 03, ..., 01                   |       |
     * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
     * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
     * | AM, PM                          | a..aa   | AM, PM                            |       |
     * |                                 | aaa     | am, pm                            |       |
     * |                                 | aaaa    | a.m., p.m.                        | 2     |
     * |                                 | aaaaa   | a, p                              |       |
     * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
     * |                                 | bbb     | am, pm, noon, midnight            |       |
     * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
     * |                                 | bbbbb   | a, p, n, mi                       |       |
     * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
     * |                                 | BBBB    | at night, in the morning, ...     | 2     |
     * |                                 | BBBBB   | at night, in the morning, ...     |       |
     * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
     * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
     * |                                 | hh      | 01, 02, ..., 11, 12               |       |
     * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
     * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
     * |                                 | HH      | 00, 01, 02, ..., 23               |       |
     * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
     * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
     * |                                 | KK      | 01, 02, ..., 11, 00               |       |
     * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
     * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
     * |                                 | kk      | 24, 01, 02, ..., 23               |       |
     * | Minute                          | m       | 0, 1, ..., 59                     |       |
     * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | mm      | 00, 01, ..., 59                   |       |
     * | Second                          | s       | 0, 1, ..., 59                     |       |
     * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | ss      | 00, 01, ..., 59                   |       |
     * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
     * |                                 | SS      | 00, 01, ..., 99                   |       |
     * |                                 | SSS     | 000, 001, ..., 999                |       |
     * |                                 | SSSS    | ...                               | 3     |
     * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
     * |                                 | XX      | -0800, +0530, Z                   |       |
     * |                                 | XXX     | -08:00, +05:30, Z                 |       |
     * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
     * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
     * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
     * |                                 | xx      | -0800, +0530, +0000               |       |
     * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
     * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
     * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
     * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
     * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
     * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
     * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
     * | Seconds timestamp               | t       | 512969520                         | 7     |
     * |                                 | tt      | ...                               | 3,7   |
     * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
     * |                                 | TT      | ...                               | 3,7   |
     * | Long localized date             | P       | 04/29/1453                        | 7     |
     * |                                 | PP      | Apr 29, 1453                      | 7     |
     * |                                 | PPP     | April 29th, 1453                  | 7     |
     * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
     * | Long localized time             | p       | 12:00 AM                          | 7     |
     * |                                 | pp      | 12:00:00 AM                       | 7     |
     * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
     * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
     * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
     * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
     * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
     * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
     * Notes:
     * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     *    are the same as "stand-alone" units, but are different in some languages.
     *    "Formatting" units are declined according to the rules of the language
     *    in the context of a date. "Stand-alone" units are always nominative singular:
     *
     *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     *
     *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     *
     * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     *    the single quote characters (see below).
     *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     *    the output will be the same as default pattern for this unit, usually
     *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     *    are marked with "2" in the last column of the table.
     *
     *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     *
     * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     *    The output will be padded with zeros to match the length of the pattern.
     *
     *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     *
     * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     *    These tokens represent the shortest form of the quarter.
     *
     * 5. The main difference between `y` and `u` patterns are B.C. years:
     *
     *    | Year | `y` | `u` |
     *    |------|-----|-----|
     *    | AC 1 |   1 |   1 |
     *    | BC 1 |   1 |   0 |
     *    | BC 2 |   2 |  -1 |
     *
     *    Also `yy` always returns the last two digits of a year,
     *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     *
     *    | Year | `yy` | `uu` |
     *    |------|------|------|
     *    | 1    |   01 |   01 |
     *    | 14   |   14 |   14 |
     *    | 376  |   76 |  376 |
     *    | 1453 |   53 | 1453 |
     *
     *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     *    except local week-numbering years are dependent on `options.weekStartsOn`
     *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     *
     * 6. Specific non-location timezones are currently unavailable in `date-fns`,
     *    so right now these tokens fall back to GMT timezones.
     *
     * 7. These patterns are not in the Unicode Technical Standard #35:
     *    - `i`: ISO day of week
     *    - `I`: ISO week of year
     *    - `R`: ISO week-numbering year
     *    - `t`: seconds timestamp
     *    - `T`: milliseconds timestamp
     *    - `o`: ordinal number modifier
     *    - `P`: long localized date
     *    - `p`: long localized time
     *
     * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
     *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
     *
     * 9. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
     *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - The second argument is now required for the sake of explicitness.
     *
     *   ```javascript
     *   // Before v2.0.0
     *   format(new Date(2016, 0, 1))
     *
     *   // v2.0.0 onward
     *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
     *   ```
     *
     * - New format string API for `format` function
     *   which is based on [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
     *   See [this post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
     *
     * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
     *
     * @param {Date|Number} date - the original date
     * @param {String} format - the string of tokens
     * @param {Object} [options] - an object with options.
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
     *   see: https://git.io/fxCyr
     * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
     *   see: https://git.io/fxCyr
     * @returns {String} the formatted date string
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `date` must not be Invalid Date
     * @throws {RangeError} `options.locale` must contain `localize` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
     * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
     * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} format string contains an unescaped latin alphabet character
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * var result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
     *   locale: eoLocale
     * })
     * //=> '2-a de julio 2014'
     *
     * @example
     * // Escape string by single quote characters:
     * var result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
     * //=> "3 o'clock"
     */

    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      requiredArgs(2, arguments);
      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var locale = options.locale || defaultLocale;
      var localeFirstWeekContainsDate = locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var localeWeekStartsOn = locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      if (!locale.localize) {
        throw new RangeError('locale must contain localize property');
      }

      if (!locale.formatLong) {
        throw new RangeError('locale must contain formatLong property');
      }

      var originalDate = toDate(dirtyDate);

      if (!isValid(originalDate)) {
        throw new RangeError('Invalid time value');
      } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
      // This ensures that when UTC functions will be implemented, locales will be compatible with them.
      // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


      var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
      var utcDate = subMilliseconds(originalDate, timezoneOffset);
      var formatterOptions = {
        firstWeekContainsDate: firstWeekContainsDate,
        weekStartsOn: weekStartsOn,
        locale: locale,
        _originalDate: originalDate
      };
      var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
        var firstCharacter = substring[0];

        if (firstCharacter === 'p' || firstCharacter === 'P') {
          var longFormatter = longFormatters$1[firstCharacter];
          return longFormatter(substring, locale.formatLong, formatterOptions);
        }

        return substring;
      }).join('').match(formattingTokensRegExp).map(function (substring) {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return "'";
        }

        var firstCharacter = substring[0];

        if (firstCharacter === "'") {
          return cleanEscapedString(substring);
        }

        var formatter = formatters$1[firstCharacter];

        if (formatter) {
          if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          return formatter(utcDate, substring, locale.localize, formatterOptions);
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
        }

        return substring;
      }).join('');
      return result;
    }

    function cleanEscapedString(input) {
      return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
    }

    /* src/components/DateDisplay.svelte generated by Svelte v3.43.1 */
    const file$d = "src/components/DateDisplay.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = getYear(/*currentDate*/ ctx[0]) + "";
    	let t2;
    	let t3;
    	let span2;
    	let t4_value = format(/*currentDate*/ ctx[0], 'MMM') + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "Date:";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text(t4_value);
    			attr_dev(span0, "class", "panel-label");
    			add_location(span0, file$d, 51, 2, 969);
    			attr_dev(span1, "class", "date-year svelte-va55eu");
    			add_location(span1, file$d, 54, 2, 1017);
    			attr_dev(span2, "class", "date-month");
    			add_location(span2, file$d, 57, 1, 1077);
    			attr_dev(div, "class", "date-display svelte-va55eu");
    			add_location(div, file$d, 50, 0, 940);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(div, t3);
    			append_dev(div, span2);
    			append_dev(span2, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentDate*/ 1 && t2_value !== (t2_value = getYear(/*currentDate*/ ctx[0]) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*currentDate*/ 1 && t4_value !== (t4_value = format(/*currentDate*/ ctx[0], 'MMM') + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $gameStatus;
    	validate_store(gameStatus$1, 'gameStatus');
    	component_subscribe($$self, gameStatus$1, $$value => $$invalidate(1, $gameStatus = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DateDisplay', slots, []);
    	let currentDate;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DateDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		gameStatus: gameStatus$1,
    		getDateFromTicks: getDate,
    		getYear,
    		format,
    		currentDate,
    		$gameStatus
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentDate' in $$props) $$invalidate(0, currentDate = $$props.currentDate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameStatus*/ 2) {
    			{
    				$$invalidate(0, currentDate = getDate($gameStatus.tickCount));
    			}
    		}
    	};

    	return [currentDate, $gameStatus];
    }

    class DateDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateDisplay",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/AntimatterToggle.svelte generated by Svelte v3.43.1 */
    const file$c = "src/components/AntimatterToggle.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[2]);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`antimatterToggle${/*$amDimension*/ ctx[1] ? ' active' : ''}`) + " svelte-1fr8k5t"));
    			add_location(div, file$c, 51, 0, 1139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 4) set_data_dev(t, /*text*/ ctx[2]);

    			if (dirty & /*$amDimension*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(`antimatterToggle${/*$amDimension*/ ctx[1] ? ' active' : ''}`) + " svelte-1fr8k5t"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $amDimension;
    	validate_store(amDimension, 'amDimension');
    	component_subscribe($$self, amDimension, $$value => $$invalidate(1, $amDimension = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AntimatterToggle', slots, []);
    	let text;

    	let { onClick = () => {
    		set_store_value(amDimension, $amDimension = !$amDimension, $amDimension);
    	} } = $$props;

    	const writable_props = ['onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AntimatterToggle> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onClick();

    	$$self.$$set = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		classNames: classnames,
    		amDimension,
    		text,
    		onClick,
    		$amDimension
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$amDimension*/ 2) {
    			{
    				$$invalidate(2, text = $amDimension
    				? 'Return to matter dimension'
    				: 'Traverse to antimatter dimsension');
    			}
    		}
    	};

    	return [onClick, $amDimension, text, click_handler];
    }

    class AntimatterToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AntimatterToggle",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get onClick() {
    		throw new Error("<AntimatterToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<AntimatterToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ActivityDisplay.svelte generated by Svelte v3.43.1 */
    const file$b = "src/components/ActivityDisplay.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (54:2) {#each $activityLog as log}
    function create_each_block$2(ctx) {
    	let div;
    	let t_value = /*log*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "log-item svelte-1ovbfao");
    			add_location(div, file$b, 54, 3, 954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activityLog*/ 1 && t_value !== (t_value = /*log*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(54:2) {#each $activityLog as log}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let each_value = /*$activityLog*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Activity Log";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "log-header svelte-1ovbfao");
    			add_location(div0, file$b, 51, 1, 844);
    			attr_dev(div1, "class", "log-item-container svelte-1ovbfao");
    			add_location(div1, file$b, 52, 1, 888);
    			attr_dev(div2, "class", "activity-display svelte-1ovbfao");
    			add_location(div2, file$b, 50, 0, 812);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$activityLog*/ 1) {
    				each_value = /*$activityLog*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $activityLog;
    	validate_store(activityLog, 'activityLog');
    	component_subscribe($$self, activityLog, $$value => $$invalidate(0, $activityLog = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ActivityDisplay', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ActivityDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ activityLog, $activityLog });
    	return [$activityLog];
    }

    class ActivityDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ActivityDisplay",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/Sidebar.svelte generated by Svelte v3.43.1 */
    const file$a = "src/components/Sidebar.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let pausebutton;
    	let t0;
    	let statspanel;
    	let t1;
    	let resourcecounter;
    	let t2;
    	let datedisplay;
    	let t3;
    	let activitydisplay;
    	let t4;
    	let antimattertoggle;
    	let current;
    	pausebutton = new PauseButton({ $$inline: true });
    	statspanel = new StatsPanel({ $$inline: true });
    	resourcecounter = new ResourceCounter({ $$inline: true });
    	datedisplay = new DateDisplay({ $$inline: true });
    	activitydisplay = new ActivityDisplay({ $$inline: true });
    	antimattertoggle = new AntimatterToggle({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pausebutton.$$.fragment);
    			t0 = space();
    			create_component(statspanel.$$.fragment);
    			t1 = space();
    			create_component(resourcecounter.$$.fragment);
    			t2 = space();
    			create_component(datedisplay.$$.fragment);
    			t3 = space();
    			create_component(activitydisplay.$$.fragment);
    			t4 = space();
    			create_component(antimattertoggle.$$.fragment);
    			attr_dev(div, "id", "sidebar");
    			attr_dev(div, "class", "svelte-xudiia");
    			add_location(div, file$a, 26, 0, 590);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pausebutton, div, null);
    			append_dev(div, t0);
    			mount_component(statspanel, div, null);
    			append_dev(div, t1);
    			mount_component(resourcecounter, div, null);
    			append_dev(div, t2);
    			mount_component(datedisplay, div, null);
    			append_dev(div, t3);
    			mount_component(activitydisplay, div, null);
    			append_dev(div, t4);
    			mount_component(antimattertoggle, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pausebutton.$$.fragment, local);
    			transition_in(statspanel.$$.fragment, local);
    			transition_in(resourcecounter.$$.fragment, local);
    			transition_in(datedisplay.$$.fragment, local);
    			transition_in(activitydisplay.$$.fragment, local);
    			transition_in(antimattertoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pausebutton.$$.fragment, local);
    			transition_out(statspanel.$$.fragment, local);
    			transition_out(resourcecounter.$$.fragment, local);
    			transition_out(datedisplay.$$.fragment, local);
    			transition_out(activitydisplay.$$.fragment, local);
    			transition_out(antimattertoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pausebutton);
    			destroy_component(statspanel);
    			destroy_component(resourcecounter);
    			destroy_component(datedisplay);
    			destroy_component(activitydisplay);
    			destroy_component(antimattertoggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sidebar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PauseButton,
    		StatsPanel,
    		ResourceCounter,
    		DateDisplay,
    		AntimatterToggle,
    		ActivityDisplay
    	});

    	return [];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/FaqTab.svelte generated by Svelte v3.43.1 */
    const file$9 = "src/components/FaqTab.svelte";

    // (72:1) {#if expanded}
    function create_if_block$4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Changelog info will live here!";
    			attr_dev(p, "class", "faqTab-changelog svelte-4a74kr");
    			add_location(p, file$9, 72, 2, 2229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(72:1) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let section;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let p3;
    	let t6;
    	let p4;
    	let t8;
    	let p5;
    	let t10;
    	let p6;
    	let expandbutton;
    	let t11;
    	let t12;
    	let current;
    	let mounted;
    	let dispose;

    	expandbutton = new ExpandButton({
    			props: {
    				open: /*expanded*/ ctx[0],
    				class: "faqTab-expandButton"
    			},
    			$$inline: true
    		});

    	let if_block = /*expanded*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			p0 = element("p");
    			p0.textContent = "Hyperbreeder is an idle game about generating power. This is a very, very, very early version of the game! It is not yet ready to be fun for long periods of time.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Clicking the big green \"start reactor\" button will begin generating energyover time. Energy can be used for upgrades and is additionally used for the initial reactor startup. If the power level reaches maximum, the reactor will automatically shut down and you will have to wait to start up again. Starting or restarting the reactor requires 1000 energy.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "Every year, a certain amount of energy must be budgeted for the earth rather than upgrades. Failing to meet this goal will cause fossil fuels to be used instead causing a huge increase in waste.\n\n\t";
    			p3 = element("p");
    			p3.textContent = "Running the reactor generates poison over time, which reduces efficiency. This can be counteracted by adjusting the control rods at the bottom of the screen: each rod in the up position increases overall reactor power. Poison takes time to both build up and dissipate.";
    			t6 = space();
    			p4 = element("p");
    			p4.textContent = "The Reactor also generates waste, which is currently unused.";
    			t8 = space();
    			p5 = element("p");
    			p5.textContent = "Save files are not yet implemented. You will lose all progress if you refresh!";
    			t10 = space();
    			p6 = element("p");
    			create_component(expandbutton.$$.fragment);
    			t11 = text("\n\t\tView patch notes / Changelog");
    			t12 = space();
    			if (if_block) if_block.c();
    			add_location(p0, file$9, 55, 1, 881);
    			add_location(p1, file$9, 57, 1, 1053);
    			add_location(p2, file$9, 59, 1, 1416);
    			add_location(p3, file$9, 61, 1, 1616);
    			add_location(p4, file$9, 63, 1, 1894);
    			add_location(p5, file$9, 65, 1, 1964);
    			attr_dev(p6, "class", "faqTab-changelogButton svelte-4a74kr");
    			add_location(p6, file$9, 67, 1, 2052);
    			attr_dev(section, "class", "faqTab svelte-4a74kr");
    			add_location(section, file$9, 54, 0, 855);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p0);
    			append_dev(section, t1);
    			append_dev(section, p1);
    			append_dev(section, t3);
    			append_dev(section, p2);
    			append_dev(section, p3);
    			append_dev(section, t6);
    			append_dev(section, p4);
    			append_dev(section, t8);
    			append_dev(section, p5);
    			append_dev(section, t10);
    			append_dev(section, p6);
    			mount_component(expandbutton, p6, null);
    			append_dev(p6, t11);
    			append_dev(section, t12);
    			if (if_block) if_block.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(p6, "click", /*expandToggle*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const expandbutton_changes = {};
    			if (dirty & /*expanded*/ 1) expandbutton_changes.open = /*expanded*/ ctx[0];
    			expandbutton.$set(expandbutton_changes);

    			if (/*expanded*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expandbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expandbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(expandbutton);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaqTab', slots, []);
    	let expanded = false;

    	const expandToggle = () => {
    		$$invalidate(0, expanded = !expanded);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FaqTab> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ExpandButton, expanded, expandToggle });

    	$$self.$inject_state = $$props => {
    		if ('expanded' in $$props) $$invalidate(0, expanded = $$props.expanded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expanded, expandToggle];
    }

    class FaqTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaqTab",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/ResearchTab.svelte generated by Svelte v3.43.1 */
    const file$8 = "src/components/ResearchTab.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let svg0;
    	let ellipse0;
    	let t0;
    	let svg1;
    	let ellipse1;
    	let t1;
    	let button;
    	let section_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			svg0 = svg_element("svg");
    			ellipse0 = svg_element("ellipse");
    			t0 = space();
    			svg1 = svg_element("svg");
    			ellipse1 = svg_element("ellipse");
    			t1 = space();
    			button = element("button");
    			button.textContent = "SpIN";
    			attr_dev(ellipse0, "cx", "400");
    			attr_dev(ellipse0, "cy", "200");
    			attr_dev(ellipse0, "rx", "300");
    			attr_dev(ellipse0, "ry", "100");
    			attr_dev(ellipse0, "fill", "none");
    			attr_dev(ellipse0, "stroke-width", "5");
    			add_location(ellipse0, file$8, 97, 2, 1667);
    			attr_dev(svg0, "viewBox", "0 0 800 400");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "track svelte-11s8ay9");
    			add_location(svg0, file$8, 96, 1, 1588);
    			attr_dev(ellipse1, "cx", "400");
    			attr_dev(ellipse1, "cy", "200");
    			attr_dev(ellipse1, "rx", "300");
    			attr_dev(ellipse1, "ry", "100");
    			attr_dev(ellipse1, "fill", "none");
    			attr_dev(ellipse1, "stroke-width", "5");
    			add_location(ellipse1, file$8, 100, 2, 1830);
    			attr_dev(svg1, "viewBox", "0 0 800 400");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "dot svelte-11s8ay9");
    			add_location(svg1, file$8, 99, 1, 1753);
    			attr_dev(button, "class", "svelte-11s8ay9");
    			add_location(button, file$8, 102, 1, 1916);
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(classnames('researchTab', { active: /*active*/ ctx[0] })) + " svelte-11s8ay9"));
    			add_location(section, file$8, 95, 0, 1531);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, svg0);
    			append_dev(svg0, ellipse0);
    			append_dev(section, t0);
    			append_dev(section, svg1);
    			append_dev(svg1, ellipse1);
    			append_dev(section, t1);
    			append_dev(section, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*activate*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 1 && section_class_value !== (section_class_value = "" + (null_to_empty(classnames('researchTab', { active: /*active*/ ctx[0] })) + " svelte-11s8ay9"))) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ResearchTab', slots, []);
    	let active = false;

    	const activate = () => {
    		if (!active) {
    			$$invalidate(0, active = true);

    			setTimeout(
    				() => {
    					$$invalidate(0, active = false);
    				},
    				7000
    			);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ResearchTab> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ classNames: classnames, active, activate });

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, activate];
    }

    class ResearchTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResearchTab",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/TabSelector.svelte generated by Svelte v3.43.1 */
    const file$7 = "src/components/TabSelector.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (48:1) {#each tabData as tab, index}
    function create_each_block$1(ctx) {
    	let div;
    	let t_value = /*tab*/ ctx[4] + "";
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*tab*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classnames('tab', {
    				selected: /*tab*/ ctx[4] === /*selectedTab*/ ctx[1]
    			})) + " svelte-1enos07"));

    			add_location(div, file$7, 48, 2, 874);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tabData*/ 1 && t_value !== (t_value = /*tab*/ ctx[4] + "")) set_data_dev(t, t_value);

    			if (dirty & /*tabData, selectedTab*/ 3 && div_class_value !== (div_class_value = "" + (null_to_empty(classnames('tab', {
    				selected: /*tab*/ ctx[4] === /*selectedTab*/ ctx[1]
    			})) + " svelte-1enos07"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(48:1) {#each tabData as tab, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let each_value = /*tabData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "tabSelector svelte-1enos07");
    			add_location(div, file$7, 46, 0, 815);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*classNames, tabData, selectedTab, onClick*/ 7) {
    				each_value = /*tabData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabSelector', slots, []);
    	let { tabData = [] } = $$props;
    	let { selectedTab = 'MAIN' } = $$props;

    	let { onClick = () => {
    		
    	} } = $$props;

    	const writable_props = ['tabData', 'selectedTab', 'onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabSelector> was created with unknown prop '${key}'`);
    	});

    	const click_handler = tab => onClick(tab);

    	$$self.$$set = $$props => {
    		if ('tabData' in $$props) $$invalidate(0, tabData = $$props.tabData);
    		if ('selectedTab' in $$props) $$invalidate(1, selectedTab = $$props.selectedTab);
    		if ('onClick' in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		classNames: classnames,
    		tabData,
    		selectedTab,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabData' in $$props) $$invalidate(0, tabData = $$props.tabData);
    		if ('selectedTab' in $$props) $$invalidate(1, selectedTab = $$props.selectedTab);
    		if ('onClick' in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tabData, selectedTab, onClick, click_handler];
    }

    class TabSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { tabData: 0, selectedTab: 1, onClick: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabSelector",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get tabData() {
    		throw new Error("<TabSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabData(value) {
    		throw new Error("<TabSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedTab() {
    		throw new Error("<TabSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTab(value) {
    		throw new Error("<TabSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<TabSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<TabSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/OverviewTab.svelte generated by Svelte v3.43.1 */
    const file$6 = "src/components/OverviewTab.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let t0;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			t0 = text("TBD\n\t");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "poison-chart");
    			add_location(div0, file$6, 38, 1, 631);
    			attr_dev(div1, "class", "resource-budget");
    			add_location(div1, file$6, 39, 1, 665);
    			attr_dev(section, "class", "overviewTab svelte-1ryvk1u");
    			add_location(section, file$6, 36, 0, 595);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, t0);
    			append_dev(section, div0);
    			append_dev(section, t1);
    			append_dev(section, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OverviewTab', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OverviewTab> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ currentStore });
    	return [];
    }

    class OverviewTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OverviewTab",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeFloor = Math.floor,
        nativeRandom = Math.random;

    /**
     * The base implementation of `_.random` without support for returning
     * floating-point numbers.
     *
     * @private
     * @param {number} lower The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the random number.
     */
    function baseRandom(lower, upper) {
      return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
    }

    var _baseRandom = baseRandom;

    /**
     * A specialized version of `_.sample` for arrays.
     *
     * @private
     * @param {Array} array The array to sample.
     * @returns {*} Returns the random element.
     */
    function arraySample(array) {
      var length = array.length;
      return length ? array[_baseRandom(0, length - 1)] : undefined;
    }

    var _arraySample = arraySample;

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return _arrayMap(props, function(key) {
        return object[key];
      });
    }

    var _baseValues = baseValues;

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object == null ? [] : _baseValues(object, keys_1(object));
    }

    var values_1 = values;

    /**
     * The base implementation of `_.sample`.
     *
     * @private
     * @param {Array|Object} collection The collection to sample.
     * @returns {*} Returns the random element.
     */
    function baseSample(collection) {
      return _arraySample(values_1(collection));
    }

    var _baseSample = baseSample;

    /**
     * Gets a random element from `collection`.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to sample.
     * @returns {*} Returns the random element.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     */
    function sample(collection) {
      var func = isArray_1(collection) ? _arraySample : _baseSample;
      return func(collection);
    }

    var sample_1 = sample;

    const loreLines = [
    	{
    		id: 0,
    		text: 'World\'s first experimental "hyper" breeder typer nuclear reactor to be activated for the first time.',
    		isValid: save => getYear(getDate(save.tickCount)) === 2030,
    	},
    	{
    		id: 1,
    		text: 'Always valid lore line',
    		isValid: save => true,
    	},
    	{
    		id: 2,
    		text: 'Never valid lore line',
    		isValid: save => false,
    	},
    ];

    const nextLoreTickerLine = (save) => {
    	const validLines = filter_1(loreLines, line => line.isValid(save));
    	return sample_1(validLines).text;
    };

    /* src/components/LoreTicker.svelte generated by Svelte v3.43.1 */

    const { console: console_1 } = globals;
    const file$5 = "src/components/LoreTicker.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "World News Updates";
    			t1 = space();
    			span = element("span");
    			t2 = text(/*rotated*/ ctx[0]);
    			attr_dev(div0, "class", "loreTicker-label svelte-1rpklhm");
    			add_location(div0, file$5, 82, 1, 1754);
    			attr_dev(span, "class", "loreTicker-content svelte-1rpklhm");
    			add_location(span, file$5, 85, 1, 1815);
    			attr_dev(div1, "class", "loreTicker svelte-1rpklhm");
    			add_location(div1, file$5, 81, 0, 1728);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, span);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rotated*/ 1) set_data_dev(t2, /*rotated*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TEXT_PADDING = '                ';

    function instance$5($$self, $$props, $$invalidate) {
    	let $currentStore;
    	validate_store(currentStore, 'currentStore');
    	component_subscribe($$self, currentStore, $$value => $$invalidate(2, $currentStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoreTicker', slots, []);
    	let nextLine = nextLoreTickerLine($currentStore.gameStatus);

    	// let text = `${' '.repeat(nextLine.length)}${nextLine}`;
    	let text = TEXT_PADDING + nextLine;

    	let rotated = text;

    	function rotate(text, noOfChars = 0) {
    		console.log('rorating', text, noOfChars);

    		if (noOfChars <= text.length) {
    			setTimeout(() => rotate(text, noOfChars + 1), 250);
    		} else {
    			nextLine = nextLoreTickerLine($currentStore.gameStatus);
    			text = `${(' ').repeat(nextLine.length)}${nextLine}`;
    			setTimeout(() => rotate(text, 0), 250);
    		}

    		const n = noOfChars % text.length;
    		$$invalidate(0, rotated = text.slice(n) + text.slice(0, n));
    	}

    	rotate(text, 0);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<LoreTicker> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		sample: sample_1,
    		currentStore,
    		format,
    		nextLoreTickerLine,
    		TEXT_PADDING,
    		nextLine,
    		text,
    		rotated,
    		rotate,
    		$currentStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('nextLine' in $$props) nextLine = $$props.nextLine;
    		if ('text' in $$props) text = $$props.text;
    		if ('rotated' in $$props) $$invalidate(0, rotated = $$props.rotated);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rotated];
    }

    class LoreTicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoreTicker",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    var intro = {
    	title: "The Year is 2030",
    	text: "As the search for renewable energy continues...",
    	dismissText: "Begin."
    };
    var popupStrings = {
    	intro: intro
    };

    const popupStatus = writable('intro');

    const popupText = derived([popupStatus], ([$popupStatus]) => {
    	if ($popupStatus) {
    		return popupStrings[$popupStatus];
    	} else {
    		return {};
    	}
    });

    /** `Object#toString` result references. */
    var mapTag = '[object Map]',
        setTag = '[object Set]';

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Checks if `value` is an empty object, collection, map, or set.
     *
     * Objects are considered empty if they have no own enumerable string keyed
     * properties.
     *
     * Array-like values such as `arguments` objects, arrays, buffers, strings, or
     * jQuery-like collections are considered empty if they have a `length` of `0`.
     * Similarly, maps and sets are considered empty if they have a `size` of `0`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty(null);
     * // => true
     *
     * _.isEmpty(true);
     * // => true
     *
     * _.isEmpty(1);
     * // => true
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({ 'a': 1 });
     * // => false
     */
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      if (isArrayLike_1(value) &&
          (isArray_1(value) || typeof value == 'string' || typeof value.splice == 'function' ||
            isBuffer_1(value) || isTypedArray_1(value) || isArguments_1(value))) {
        return !value.length;
      }
      var tag = _getTag(value);
      if (tag == mapTag || tag == setTag) {
        return !value.size;
      }
      if (_isPrototype(value)) {
        return !_baseKeys(value).length;
      }
      for (var key in value) {
        if (hasOwnProperty.call(value, key)) {
          return false;
        }
      }
      return true;
    }

    var isEmpty_1 = isEmpty;

    /* src/components/ui/AnimatedText.svelte generated by Svelte v3.43.1 */
    const file$4 = "src/components/ui/AnimatedText.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (76:2) {:else}
    function create_else_block$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${' '}`;
    			attr_dev(span, "class", "svelte-r4i7fj");
    			add_location(span, file$4, 76, 3, 1556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(76:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (74:2) {#if index < currentText.length}
    function create_if_block$3(ctx) {
    	let span;
    	let t_value = /*currentText*/ ctx[1][/*index*/ ctx[14]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-r4i7fj");
    			add_location(span, file$4, 74, 3, 1509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentText*/ 2 && t_value !== (t_value = /*currentText*/ ctx[1][/*index*/ ctx[14]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(74:2) {#if index < currentText.length}",
    		ctx
    	});

    	return block;
    }

    // (73:1) {#each text as char, index}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*index*/ ctx[14] < /*currentText*/ ctx[1].length) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(73:1) {#each text as char, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let each_value = /*text*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "animated-text");
    			add_location(div, file$4, 71, 0, 1414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentText, text*/ 3) {
    				each_value = /*text*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $options;
    	validate_store(options, 'options');
    	component_subscribe($$self, options, $$value => $$invalidate(6, $options = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AnimatedText', slots, []);
    	let { text = 'TEST TEXT' } = $$props;

    	let { onComplete = () => {
    		
    	} } = $$props;

    	let { slowMode = true } = $$props;
    	let { playing = true } = $$props;
    	let currentText = [];
    	let animationComplete = false;
    	let textArray = [];
    	let letterDelay = 10;
    	let intervalTime = 30;
    	let maxIterations = 9 - 2 * $options.textSpeed;

    	const loop = (a, index) => {
    		let c, interval, g, h, count;
    		count = 0;

    		if (index === a.length) {
    			animationComplete = true;
    			onComplete();
    		} else {
    			g = currentText;
    			h = Math.floor(21 * Math.random() + 5);
    			c = 32 === a[index] ? 32 : a[index] - h;

    			interval = setInterval(
    				function () {
    					count++;
    					$$invalidate(1, currentText = g.concat([String.fromCharCode(c)]));

    					if (count === maxIterations) {
    						$$invalidate(1, currentText = text.slice(0, currentText.length));
    						clearInterval(interval);
    						count = 0;
    						c = 32;
    						index++;

    						setTimeout(
    							function () {
    								loop(a, index);
    							},
    							letterDelay
    						);
    					} else {
    						c++;
    					}
    				},
    				intervalTime
    			);
    		}
    	};

    	for (let d = text, c = 0; c < d.length; c++) {
    		textArray.push(d.charCodeAt(c));
    	}

    	const writable_props = ['text', 'onComplete', 'slowMode', 'playing'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AnimatedText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('onComplete' in $$props) $$invalidate(2, onComplete = $$props.onComplete);
    		if ('slowMode' in $$props) $$invalidate(3, slowMode = $$props.slowMode);
    		if ('playing' in $$props) $$invalidate(4, playing = $$props.playing);
    	};

    	$$self.$capture_state = () => ({
    		options,
    		text,
    		onComplete,
    		slowMode,
    		playing,
    		currentText,
    		animationComplete,
    		textArray,
    		letterDelay,
    		intervalTime,
    		maxIterations,
    		loop,
    		$options
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('onComplete' in $$props) $$invalidate(2, onComplete = $$props.onComplete);
    		if ('slowMode' in $$props) $$invalidate(3, slowMode = $$props.slowMode);
    		if ('playing' in $$props) $$invalidate(4, playing = $$props.playing);
    		if ('currentText' in $$props) $$invalidate(1, currentText = $$props.currentText);
    		if ('animationComplete' in $$props) animationComplete = $$props.animationComplete;
    		if ('textArray' in $$props) $$invalidate(7, textArray = $$props.textArray);
    		if ('letterDelay' in $$props) letterDelay = $$props.letterDelay;
    		if ('intervalTime' in $$props) intervalTime = $$props.intervalTime;
    		if ('maxIterations' in $$props) maxIterations = $$props.maxIterations;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*playing*/ 16) {
    			{
    				if (playing) {
    					loop(textArray, 0);
    				}
    			}
    		}
    	};

    	return [text, currentText, onComplete, slowMode, playing];
    }

    class AnimatedText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			text: 0,
    			onComplete: 2,
    			slowMode: 3,
    			playing: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AnimatedText",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get text() {
    		throw new Error("<AnimatedText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<AnimatedText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onComplete() {
    		throw new Error("<AnimatedText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onComplete(value) {
    		throw new Error("<AnimatedText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slowMode() {
    		throw new Error("<AnimatedText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slowMode(value) {
    		throw new Error("<AnimatedText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get playing() {
    		throw new Error("<AnimatedText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set playing(value) {
    		throw new Error("<AnimatedText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/popup/Popup.svelte generated by Svelte v3.43.1 */
    const file$3 = "src/popup/Popup.svelte";

    // (122:1) {#if isEmpty($popupText) === false}
    function create_if_block$2(ctx) {
    	let div8;
    	let div0;
    	let t0;
    	let div7;
    	let div1;
    	let t1;
    	let div6;
    	let div2;
    	let animatedtext0;
    	let t2;
    	let div3;
    	let animatedtext1;
    	let t3;
    	let div5;
    	let div4;
    	let t4_value = /*$popupText*/ ctx[1].dismissText + "";
    	let t4;
    	let current;
    	let mounted;
    	let dispose;

    	animatedtext0 = new AnimatedText({
    			props: {
    				text: /*$popupText*/ ctx[1].title,
    				onComplete: /*onTitleComplete*/ ctx[3]
    			},
    			$$inline: true
    		});

    	animatedtext1 = new AnimatedText({
    			props: {
    				text: /*$popupText*/ ctx[1].text,
    				playing: /*descPlaying*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div7 = element("div");
    			div1 = element("div");
    			t1 = space();
    			div6 = element("div");
    			div2 = element("div");
    			create_component(animatedtext0.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(animatedtext1.$$.fragment);
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t4 = text(t4_value);
    			attr_dev(div0, "id", "popup-overlay");
    			attr_dev(div0, "class", "svelte-1vol4zv");
    			add_location(div0, file$3, 123, 3, 2186);
    			attr_dev(div1, "id", "popup-text-overlay");
    			attr_dev(div1, "class", "svelte-1vol4zv");
    			add_location(div1, file$3, 125, 4, 2256);
    			attr_dev(div2, "id", "popup-title");
    			attr_dev(div2, "class", "svelte-1vol4zv");
    			add_location(div2, file$3, 127, 5, 2323);
    			attr_dev(div3, "id", "popup-desc");
    			attr_dev(div3, "class", "svelte-1vol4zv");
    			add_location(div3, file$3, 133, 5, 2459);
    			attr_dev(div4, "id", "popup-dismiss");
    			attr_dev(div4, "class", "svelte-1vol4zv");
    			add_location(div4, file$3, 140, 6, 2624);
    			attr_dev(div5, "class", "dismiss-container svelte-1vol4zv");
    			add_location(div5, file$3, 139, 5, 2586);
    			attr_dev(div6, "id", "popup-contents");
    			attr_dev(div6, "class", "svelte-1vol4zv");
    			add_location(div6, file$3, 126, 4, 2292);
    			attr_dev(div7, "id", "popup-contents-container");
    			attr_dev(div7, "class", "svelte-1vol4zv");
    			add_location(div7, file$3, 124, 3, 2216);
    			attr_dev(div8, "id", "popup");
    			attr_dev(div8, "class", "svelte-1vol4zv");
    			add_location(div8, file$3, 122, 2, 2166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div0);
    			append_dev(div8, t0);
    			append_dev(div8, div7);
    			append_dev(div7, div1);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			mount_component(animatedtext0, div2, null);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			mount_component(animatedtext1, div3, null);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, t4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*dismiss*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const animatedtext0_changes = {};
    			if (dirty & /*$popupText*/ 2) animatedtext0_changes.text = /*$popupText*/ ctx[1].title;
    			animatedtext0.$set(animatedtext0_changes);
    			const animatedtext1_changes = {};
    			if (dirty & /*$popupText*/ 2) animatedtext1_changes.text = /*$popupText*/ ctx[1].text;
    			if (dirty & /*descPlaying*/ 1) animatedtext1_changes.playing = /*descPlaying*/ ctx[0];
    			animatedtext1.$set(animatedtext1_changes);
    			if ((!current || dirty & /*$popupText*/ 2) && t4_value !== (t4_value = /*$popupText*/ ctx[1].dismissText + "")) set_data_dev(t4, t4_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(animatedtext0.$$.fragment, local);
    			transition_in(animatedtext1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(animatedtext0.$$.fragment, local);
    			transition_out(animatedtext1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_component(animatedtext0);
    			destroy_component(animatedtext1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(122:1) {#if isEmpty($popupText) === false}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let show_if = isEmpty_1(/*$popupText*/ ctx[1]) === false;
    	let current;
    	let if_block = show_if && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "popup-container");
    			add_location(div, file$3, 120, 0, 2100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$popupText*/ 2) show_if = isEmpty_1(/*$popupText*/ ctx[1]) === false;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$popupText*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $popupStatus;
    	let $popupText;
    	validate_store(popupStatus, 'popupStatus');
    	component_subscribe($$self, popupStatus, $$value => $$invalidate(5, $popupStatus = $$value));
    	validate_store(popupText, 'popupText');
    	component_subscribe($$self, popupText, $$value => $$invalidate(1, $popupText = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, []);

    	let { onDismiss = () => {
    		
    	} } = $$props;

    	let dismiss = () => {
    		onDismiss($popupStatus);
    		set_store_value(popupStatus, $popupStatus = '', $popupStatus);
    	};

    	let descPlaying = false;

    	let onTitleComplete = () => {
    		setTimeout(
    			() => {
    				$$invalidate(0, descPlaying = true);
    			},
    			100
    		);
    	};

    	const writable_props = ['onDismiss'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onDismiss' in $$props) $$invalidate(4, onDismiss = $$props.onDismiss);
    	};

    	$$self.$capture_state = () => ({
    		isEmpty: isEmpty_1,
    		AnimatedText,
    		popupText,
    		popupStatus,
    		onDismiss,
    		dismiss,
    		descPlaying,
    		onTitleComplete,
    		$popupStatus,
    		$popupText
    	});

    	$$self.$inject_state = $$props => {
    		if ('onDismiss' in $$props) $$invalidate(4, onDismiss = $$props.onDismiss);
    		if ('dismiss' in $$props) $$invalidate(2, dismiss = $$props.dismiss);
    		if ('descPlaying' in $$props) $$invalidate(0, descPlaying = $$props.descPlaying);
    		if ('onTitleComplete' in $$props) $$invalidate(3, onTitleComplete = $$props.onTitleComplete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [descPlaying, $popupText, dismiss, onTitleComplete, onDismiss];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { onDismiss: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get onDismiss() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDismiss(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Game.svelte generated by Svelte v3.43.1 */
    const file$2 = "src/components/Game.svelte";

    // (74:1) {#if introDismissed === true}
    function create_if_block_6(ctx) {
    	let loopm;
    	let t;
    	let loopam;
    	let current;
    	loopm = new LoopM({ $$inline: true });
    	loopam = new LoopAM({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loopm.$$.fragment);
    			t = space();
    			create_component(loopam.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loopm, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(loopam, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loopm.$$.fragment, local);
    			transition_in(loopam.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loopm.$$.fragment, local);
    			transition_out(loopam.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loopm, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(loopam, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(74:1) {#if introDismissed === true}",
    		ctx
    	});

    	return block;
    }

    // (99:35) 
    function create_if_block_5(ctx) {
    	let faqtab;
    	let current;
    	faqtab = new FaqTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(faqtab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(faqtab, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faqtab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faqtab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(faqtab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(99:35) ",
    		ctx
    	});

    	return block;
    }

    // (97:40) 
    function create_if_block_4(ctx) {
    	let researchtab;
    	let current;
    	researchtab = new ResearchTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(researchtab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(researchtab, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(researchtab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(researchtab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(researchtab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(97:40) ",
    		ctx
    	});

    	return block;
    }

    // (91:40) 
    function create_if_block_2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$amDimension*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(91:40) ",
    		ctx
    	});

    	return block;
    }

    // (90:40) 
    function create_if_block_1(ctx) {
    	let overviewtab;
    	let current;
    	overviewtab = new OverviewTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(overviewtab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(overviewtab, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overviewtab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overviewtab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(overviewtab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(90:40) ",
    		ctx
    	});

    	return block;
    }

    // (89:3) {#if selectedTab === 'MAIN'}
    function create_if_block$1(ctx) {
    	let neutrondisplay;
    	let current;
    	neutrondisplay = new NeutronDisplay({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(neutrondisplay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(neutrondisplay, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(neutrondisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(neutrondisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(neutrondisplay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(89:3) {#if selectedTab === 'MAIN'}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {:else}
    function create_else_block$1(ctx) {
    	let upgradelistm;
    	let current;
    	upgradelistm = new UpgradeListM({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(upgradelistm.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(upgradelistm, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upgradelistm.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upgradelistm.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(upgradelistm, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(94:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#if $amDimension}
    function create_if_block_3(ctx) {
    	let upgradelistam;
    	let current;
    	upgradelistam = new UpgradeListAM({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(upgradelistam.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(upgradelistam, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upgradelistam.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upgradelistam.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(upgradelistam, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(92:4) {#if $amDimension}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let popup;
    	let t0;
    	let t1;
    	let div0;
    	let sidebar;
    	let t2;
    	let div2;
    	let loreticker;
    	let t3;
    	let div1;
    	let tabselector;
    	let t4;
    	let current_block_type_index;
    	let if_block1;
    	let current;

    	popup = new Popup({
    			props: { onDismiss: /*introDismiss*/ ctx[4] },
    			$$inline: true
    		});

    	let if_block0 = /*introDismissed*/ ctx[1] === true && create_if_block_6(ctx);
    	sidebar = new Sidebar({ $$inline: true });
    	loreticker = new LoreTicker({ $$inline: true });

    	tabselector = new TabSelector({
    			props: {
    				tabData: ['MAIN', 'OVERVIEW', 'UPGRADES', 'RESEARCH', 'FAQ'],
    				selectedTab: /*selectedTab*/ ctx[0],
    				onClick: /*changeTab*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [
    		create_if_block$1,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_4,
    		create_if_block_5
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedTab*/ ctx[0] === 'MAIN') return 0;
    		if (/*selectedTab*/ ctx[0] === 'OVERVIEW') return 1;
    		if (/*selectedTab*/ ctx[0] === 'UPGRADES') return 2;
    		if (/*selectedTab*/ ctx[0] === 'RESEARCH') return 3;
    		if (/*selectedTab*/ ctx[0] === 'FAQ') return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			create_component(popup.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div0 = element("div");
    			create_component(sidebar.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(loreticker.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			create_component(tabselector.$$.fragment);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "id", "left-column");
    			attr_dev(div0, "class", "svelte-1li7np2");
    			add_location(div0, file$2, 77, 1, 1803);
    			attr_dev(div1, "id", "tabSelector-container");
    			attr_dev(div1, "class", "svelte-1li7np2");
    			add_location(div1, file$2, 82, 2, 1892);
    			attr_dev(div2, "id", "right-column");
    			attr_dev(div2, "class", "svelte-1li7np2");
    			add_location(div2, file$2, 80, 1, 1849);
    			attr_dev(div3, "id", "game-container");
    			attr_dev(div3, "class", "game-container svelte-1li7np2");
    			toggle_class(div3, "amDimension", /*$amDimension*/ ctx[2]);
    			add_location(div3, file$2, 71, 0, 1621);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			mount_component(popup, div3, null);
    			append_dev(div3, t0);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			mount_component(sidebar, div0, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(loreticker, div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			mount_component(tabselector, div1, null);
    			append_dev(div1, t4);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*introDismissed*/ ctx[1] === true) {
    				if (if_block0) {
    					if (dirty & /*introDismissed*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const tabselector_changes = {};
    			if (dirty & /*selectedTab*/ 1) tabselector_changes.selectedTab = /*selectedTab*/ ctx[0];
    			tabselector.$set(tabselector_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (dirty & /*$amDimension*/ 4) {
    				toggle_class(div3, "amDimension", /*$amDimension*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(loreticker.$$.fragment, local);
    			transition_in(tabselector.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(loreticker.$$.fragment, local);
    			transition_out(tabselector.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(popup);
    			if (if_block0) if_block0.d();
    			destroy_component(sidebar);
    			destroy_component(loreticker);
    			destroy_component(tabselector);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $amDimension;
    	validate_store(amDimension, 'amDimension');
    	component_subscribe($$self, amDimension, $$value => $$invalidate(2, $amDimension = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	let selectedTab = 'MAIN';
    	let introDismissed = false;

    	let changeTab = (newTab, x, xx, xxx) => {
    		$$invalidate(0, selectedTab = newTab);
    	};

    	const introDismiss = () => {
    		$$invalidate(1, introDismissed = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LoopM,
    		LoopAM,
    		NeutronDisplay,
    		UpgradeListM,
    		UpgradeListAM,
    		Sidebar,
    		FaqTab,
    		ResearchTab,
    		TabSelector,
    		OverviewTab,
    		LoreTicker,
    		amDimension,
    		popupStatus,
    		Popup,
    		selectedTab,
    		introDismissed,
    		changeTab,
    		introDismiss,
    		$amDimension
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedTab' in $$props) $$invalidate(0, selectedTab = $$props.selectedTab);
    		if ('introDismissed' in $$props) $$invalidate(1, introDismissed = $$props.introDismissed);
    		if ('changeTab' in $$props) $$invalidate(3, changeTab = $$props.changeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedTab, introDismissed, $amDimension, changeTab, introDismiss];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/splash/SplashScreen.svelte generated by Svelte v3.43.1 */

    const file$1 = "src/splash/SplashScreen.svelte";

    function create_fragment$1(ctx) {
    	let div6;
    	let div0;
    	let t0;
    	let div1;
    	let t2;
    	let div2;
    	let t4;
    	let div4;
    	let div3;
    	let t6;
    	let div5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "HYPERBREEDER";
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "A Nuclear Idle Game";
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "Start";
    			t6 = space();
    			div5 = element("div");
    			attr_dev(div0, "id", "splash-top-spacer");
    			attr_dev(div0, "class", "svelte-rjhdjv");
    			add_location(div0, file$1, 79, 1, 1346);
    			attr_dev(div1, "id", "splash-logo");
    			attr_dev(div1, "class", "svelte-rjhdjv");
    			add_location(div1, file$1, 80, 1, 1378);
    			attr_dev(div2, "id", "splash-description");
    			attr_dev(div2, "class", "svelte-rjhdjv");
    			add_location(div2, file$1, 83, 1, 1425);
    			attr_dev(div3, "id", "splash-dismiss");
    			attr_dev(div3, "class", "svelte-rjhdjv");
    			add_location(div3, file$1, 87, 2, 1520);
    			attr_dev(div4, "class", "dismiss-container svelte-rjhdjv");
    			add_location(div4, file$1, 86, 1, 1486);
    			attr_dev(div5, "id", "splash-bottom-spacer");
    			attr_dev(div5, "class", "svelte-rjhdjv");
    			add_location(div5, file$1, 91, 0, 1591);
    			attr_dev(div6, "id", "splash-screen");
    			attr_dev(div6, "class", "svelte-rjhdjv");
    			add_location(div6, file$1, 78, 0, 1320);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div6, t0);
    			append_dev(div6, div1);
    			append_dev(div6, t2);
    			append_dev(div6, div2);
    			append_dev(div6, t4);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div6, t6);
    			append_dev(div6, div5);

    			if (!mounted) {
    				dispose = listen_dev(
    					div3,
    					"click",
    					function () {
    						if (is_function(/*dismiss*/ ctx[0])) /*dismiss*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SplashScreen', slots, []);

    	let { dismiss = () => {
    		
    	} } = $$props;

    	const writable_props = ['dismiss'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SplashScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('dismiss' in $$props) $$invalidate(0, dismiss = $$props.dismiss);
    	};

    	$$self.$capture_state = () => ({ dismiss });

    	$$self.$inject_state = $$props => {
    		if ('dismiss' in $$props) $$invalidate(0, dismiss = $$props.dismiss);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dismiss];
    }

    class SplashScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { dismiss: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SplashScreen",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get dismiss() {
    		throw new Error("<SplashScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dismiss(value) {
    		throw new Error("<SplashScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Main.svelte generated by Svelte v3.43.1 */
    const file = "src/Main.svelte";

    // (61:1) {:else}
    function create_else_block(ctx) {
    	let game;
    	let current;
    	game = new Game({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(61:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:1) {#if splashShown}
    function create_if_block(ctx) {
    	let splashscreen;
    	let current;

    	splashscreen = new SplashScreen({
    			props: { dismiss: /*dismissSplash*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(splashscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(splashscreen, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(splashscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(splashscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(splashscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(59:1) {#if splashShown}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let link1;
    	let t;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*splashShown*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			t = space();
    			div = element("div");
    			if_block.c();
    			attr_dev(link0, "rel", "preload");
    			attr_dev(link0, "href", "./MajorMonoDisplay-Regular.ttf");
    			attr_dev(link0, "as", "font");
    			attr_dev(link0, "type", "font/ttf");
    			attr_dev(link0, "crossorigin", "anonymous");
    			add_location(link0, file, 1, 2, 16);
    			attr_dev(link1, "rel", "preload");
    			attr_dev(link1, "href", "./XanhMono-Regular.ttf");
    			attr_dev(link1, "as", "font");
    			attr_dev(link1, "type", "font/ttf");
    			attr_dev(link1, "crossorigin", "anonymous");
    			add_location(link1, file, 3, 2, 133);
    			attr_dev(div, "id", "main-container");
    			attr_dev(div, "class", "svelte-1xth8xq");
    			add_location(div, file, 57, 0, 1129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let splashShown = true;

    	const dismissSplash = () => {
    		$$invalidate(0, splashShown = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Game,
    		SplashScreen,
    		splashShown,
    		dismissSplash
    	});

    	$$self.$inject_state = $$props => {
    		if ('splashShown' in $$props) $$invalidate(0, splashShown = $$props.splashShown);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [splashShown, dismissSplash];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    new Main({
      target: document.body,
    });

    // export default app;

})();
//# sourceMappingURL=bundle.js.map

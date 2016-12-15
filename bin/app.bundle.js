/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _jquery = __webpack_require__(1);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _algoliasearch = __webpack_require__(2);

	var _algoliasearch2 = _interopRequireDefault(_algoliasearch);

	var _algoliasearchHelper = __webpack_require__(37);

	var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

	var _hogan = __webpack_require__(333);

	var _hogan2 = _interopRequireDefault(_hogan);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	console.log('Hello World!');

	(0, _jquery2.default)(function () {
		var APPLICATION_ID = 'BH0GW7H4EJ';
		var SEARCH_ONLY_API_KEY = '5a7bd5a1909a6b197df53ad56aff3968';
		var INDEX_NAME = 'poc_restaurants';
		var PARAMS = {
			hitsPerPage: 3,
			maxValuesPerFacet: 7,
			index: INDEX_NAME,
			facets: ['food_type']
		};
		var FACETS_ORDER_OF_DISPLAY = ['food_type'];
		var FACETS_LABELS = { food_type: 'Cuisine / Food Type' };

		// Client + Helper initialization
		var algolia = (0, _algoliasearch2.default)(APPLICATION_ID, SEARCH_ONLY_API_KEY);
		var algoliaHelper = (0, _algoliasearchHelper2.default)(algolia, INDEX_NAME, PARAMS);

		// DOM BINDING
		var $searchInput = (0, _jquery2.default)('#search-input');

		var $main = (0, _jquery2.default)('#main');
		// $sortBySelect = $('#sort-by-select');
		var $hits = (0, _jquery2.default)('#hits');
		var $stats = (0, _jquery2.default)('#stats');
		var $facets = (0, _jquery2.default)('#facets');
		var $pagination = (0, _jquery2.default)('#pagination');

		// Hogan templates binding
		var hitTemplate = _hogan2.default.compile((0, _jquery2.default)('#hit-template').text());
		var statsTemplate = _hogan2.default.compile((0, _jquery2.default)('#stats-template').text());
		var facetTemplate = _hogan2.default.compile((0, _jquery2.default)('#facet-template').text());
		var paginationTemplate = _hogan2.default.compile((0, _jquery2.default)('#pagination-template').text());
		var noResultsTemplate = _hogan2.default.compile((0, _jquery2.default)('#no-results-template').text());

		// Input binding
		$searchInput.on('keyup', function () {
			var query = (0, _jquery2.default)(this).val();
			algoliaHelper.setQuery(query).search();
		}).focus();

		// Search results
		algoliaHelper.on('result', function (content, state) {
			renderHits(content);
			renderStats(content);
			renderFacets(content, state);
			renderPagination(content);
		});

		function renderHits(content) {
			$hits.html(hitTemplate.render(addMetadataToHits(content)));
		}

		function addMetadataToHits(content) {
			var numHits = content.hits.length;
			for (var i = 0; i < numHits; i++) {
				// normalize stars so they always consistently show a single decimal place
				var stars_count_fixed = parseFloat(content.hits[i].stars_count).toFixed(1);
				content.hits[i].stars_count_fixed = parseFloat(content.hits[i].stars_count).toFixed(1);
			}
			return content;
		}

		function renderStats(content) {
			var stats = {
				nbHits: content.nbHits,
				nbHits_plural: content.nbHits !== 1,
				processingTimeSeconds: content.processingTimeMS / 1000
			};
			$stats.html(statsTemplate.render(stats));
		}

		function renderFacets(content, state) {
			var facetsHtml = '';
			var facetName = 'food_type';
			var facetResult = content.getFacetByName(facetName);
			var facetContent = {};
			if (facetResult) {
				facetContent = {
					facet: facetName,
					title: FACETS_LABELS[facetName],
					values: content.getFacetValues(facetName, { sortBy: ['isRefined:desc', 'count:desc'] }),
					disjunctive: _jquery2.default.inArray(facetName, PARAMS.disjunctiveFacets) !== -1
				};
				facetsHtml += facetTemplate.render(facetContent);
			}
			$facets.html(facetsHtml);
		}

		function renderPagination(content) {
			// console.log(content);
			// console.log(content.page);
			// console.log(content.nbPages);
			var pages = [];
			if (content.page > 3) {
				pages.push({ current: false, number: 1 });
				pages.push({ current: false, number: '...', disabled: true });
			}
			for (var p = content.page - 3; p < content.page + 3; ++p) {
				if (p < 0 || p >= content.nbPages) continue;
				pages.push({ current: content.page === p, number: p + 1 });
			}
			if (content.page + 3 < content.nbPages) {
				pages.push({ current: false, number: '...', disabled: true });
				pages.push({ current: false, number: content.nbPages });
			}
			var pagination = {
				pages: pages,
				prev_page: content.page > 0 ? content.page : false,
				next_page: content.page + 1 < content.nbPages ? content.page + 2 : false
			};
			$pagination.html(paginationTemplate.render(pagination));
		}

		(0, _jquery2.default)(document).on('click', '.go-to-page', function (e) {
			e.preventDefault();
			(0, _jquery2.default)('html, body').animate({ scrollTop: 0 }, '500', 'swing');
			algoliaHelper.setCurrentPage(+(0, _jquery2.default)(this).data('page') - 1).search();
		});
		(0, _jquery2.default)(document).on('click', '.toggle-refine', function (e) {
			e.preventDefault();
			algoliaHelper.toggleRefine((0, _jquery2.default)(this).data('facet'), (0, _jquery2.default)(this).data('value')).search();
		});
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v3.1.1
	 * https://jquery.com/
	 *
	 * Includes Sizzle.js
	 * https://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * https://jquery.org/license
	 *
	 * Date: 2016-09-22T22:30Z
	 */
	( function( global, factory ) {

		"use strict";

		if ( typeof module === "object" && typeof module.exports === "object" ) {

			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

	// Pass this if window is not defined yet
	} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

	// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
	// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
	// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
	// enough that all such attempts are guarded in a try block.
	"use strict";

	var arr = [];

	var document = window.document;

	var getProto = Object.getPrototypeOf;

	var slice = arr.slice;

	var concat = arr.concat;

	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var fnToString = hasOwn.toString;

	var ObjectFunctionString = fnToString.call( Object );

	var support = {};



		function DOMEval( code, doc ) {
			doc = doc || document;

			var script = doc.createElement( "script" );

			script.text = code;
			doc.head.appendChild( script ).parentNode.removeChild( script );
		}
	/* global Symbol */
	// Defining this global in .eslintrc.json would create a danger of using the global
	// unguarded in another place, it seems safer to define global only for this module



	var
		version = "3.1.1",

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},

		// Support: Android <=4.0 only
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([a-z])/g,

		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {

			// Return all the elements in a clean array
			if ( num == null ) {
				return slice.call( this );
			}

			// Return just the one element from the set
			return num < 0 ? this[ num + this.length ] : this[ num ];
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];

						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},

		isArray: Array.isArray,

		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},

		isNumeric: function( obj ) {

			// As of jQuery 3.0, isNumeric is limited to
			// strings and numbers (primitives or objects)
			// that can be coerced to finite numbers (gh-2662)
			var type = jQuery.type( obj );
			return ( type === "number" || type === "string" ) &&

				// parseFloat NaNs numeric-cast false positives ("")
				// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
				// subtraction forces infinities to NaN
				!isNaN( obj - parseFloat( obj ) );
		},

		isPlainObject: function( obj ) {
			var proto, Ctor;

			// Detect obvious negatives
			// Use toString instead of jQuery.type to catch host objects
			if ( !obj || toString.call( obj ) !== "[object Object]" ) {
				return false;
			}

			proto = getProto( obj );

			// Objects with no prototype (e.g., `Object.create( null )`) are plain
			if ( !proto ) {
				return true;
			}

			// Objects with prototype are plain iff they were constructed by a global Object function
			Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
			return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
		},

		isEmptyObject: function( obj ) {

			/* eslint-disable no-unused-vars */
			// See https://github.com/eslint/eslint/issues/6125
			var name;

			for ( name in obj ) {
				return false;
			}
			return true;
		},

		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}

			// Support: Android <=2.3 only (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},

		// Evaluates a script in a global context
		globalEval: function( code ) {
			DOMEval( code );
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE <=9 - 11, Edge 12 - 13
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},

		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},

		// Support: Android <=4.0 only
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		// Support: Android <=4.0 only, PhantomJS 1 only
		// push.apply(_, arraylike) throws on ancient WebKit
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply( [], ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;

			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}

			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: Date.now,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	function isArrayLike( obj ) {

		// Support: real iOS 8.2 only (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );

		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.3.3
	 * https://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-08-08
	 */
	(function( window ) {

	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,

		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,

		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// https://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,

		// CSS escapes
		// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// CSS string/identifier serialization
		// https://drafts.csswg.org/cssom/#common-serializing-idioms
		rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
		fcssescape = function( ch, asCodePoint ) {
			if ( asCodePoint ) {

				// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
				if ( ch === "\0" ) {
					return "\uFFFD";
				}

				// Control characters and (dependent upon position) numbers get escaped as code points
				return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
			}

			// Other potentially-special ASCII characters get backslash-escaped
			return "\\" + ch;
		},

		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		},

		disabledAncestor = addCombinator(
			function( elem ) {
				return elem.disabled === true && ("form" in elem || "label" in elem);
			},
			{ dir: "parentNode", next: "legend" }
		);

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?

			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :

			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}

	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {

			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

					// ID selector
					if ( (m = match[1]) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {

								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {

								results.push( elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {

						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;

					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {

						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rcssescape, fcssescape );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						while ( i-- ) {
							groups[i] = "#" + nid + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}

					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created element and returns a boolean result
	 */
	function assert( fn ) {
		var el = document.createElement("fieldset");

		try {
			return !!fn( el );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( el.parentNode ) {
				el.parentNode.removeChild( el );
			}
			// release memory in IE
			el = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;

		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				a.sourceIndex - b.sourceIndex;

		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}

		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for :enabled/:disabled
	 * @param {Boolean} disabled true for :disabled; false for :enabled
	 */
	function createDisabledPseudo( disabled ) {

		// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
		return function( elem ) {

			// Only certain elements can match :enabled or :disabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
			if ( "form" in elem ) {

				// Check for inherited disabledness on relevant non-disabled elements:
				// * listed form-associated elements in a disabled fieldset
				//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
				// * option elements in a disabled optgroup
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
				// All such elements have a "form" property.
				if ( elem.parentNode && elem.disabled === false ) {

					// Option elements defer to a parent optgroup if present
					if ( "label" in elem ) {
						if ( "label" in elem.parentNode ) {
							return elem.parentNode.disabled === disabled;
						} else {
							return elem.disabled === disabled;
						}
					}

					// Support: IE 6 - 11
					// Use the isDisabled shortcut property to check for disabled fieldset ancestors
					return elem.isDisabled === disabled ||

						// Where there is no isDisabled, check manually
						/* jshint -W018 */
						elem.isDisabled !== !disabled &&
							disabledAncestor( elem ) === disabled;
				}

				return elem.disabled === disabled;

			// Try to winnow out elements that can't be disabled before trusting the disabled property.
			// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
			// even exist on them, let alone have a boolean value.
			} else if ( "label" in elem ) {
				return elem.disabled === disabled;
			}

			// Remaining elements are neither :enabled nor :disabled
			return false;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}

	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, subWindow,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );

		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( preferredDoc !== document &&
			(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

			// Support: IE 11, Edge
			if ( subWindow.addEventListener ) {
				subWindow.addEventListener( "unload", unloadHandler, false );

			// Support: IE 9 - 10 only
			} else if ( subWindow.attachEvent ) {
				subWindow.attachEvent( "onunload", unloadHandler );
			}
		}

		/* Attributes
		---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( el ) {
			el.className = "i";
			return !el.getAttribute("className");
		});

		/* getElement(s)By*
		---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( el ) {
			el.appendChild( document.createComment("") );
			return !el.getElementsByTagName("*").length;
		});

		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programmatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( el ) {
			docElem.appendChild( el ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});

		// ID filter and find
		if ( support.getById ) {
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var elem = context.getElementById( id );
					return elem ? [ elem ] : [];
				}
			};
		} else {
			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};

			// Support: IE 6 - 7 only
			// getElementById is not reliable as a find shortcut
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var node, i, elems,
						elem = context.getElementById( id );

					if ( elem ) {

						// Verify the id attribute
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}

						// Fall back on getElementsByName
						elems = context.getElementsByName( id );
						i = 0;
						while ( (elem = elems[i++]) ) {
							node = elem.getAttributeNode("id");
							if ( node && node.value === id ) {
								return [ elem ];
							}
						}
					}

					return [];
				}
			};
		}

		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :

			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			};

		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See https://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];

		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( el ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// https://bugs.jquery.com/ticket/12359
				docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";

				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( el.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !el.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}

				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !el.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}

				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibling-combinator selector` fails
				if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});

			assert(function( el ) {
				el.innerHTML = "<a href='' disabled='disabled'></a>" +
					"<select disabled='disabled'><option/></select>";

				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				el.appendChild( input ).setAttribute( "name", "D" );

				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( el.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( el.querySelectorAll(":enabled").length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Support: IE9-11+
				// IE's :disabled selector does not pick up the children of disabled fieldsets
				docElem.appendChild( el ).disabled = true;
				if ( el.querySelectorAll(":disabled").length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Opera 10-11 does not throw on post-comma invalid pseudos
				el.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}

		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {

			assert(function( el ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( el, "*" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( el, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );

		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];

			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;

			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}

			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}

			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}

			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};

		return document;
	};

	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};

	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );

		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}

		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};

	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};

	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};

	Sizzle.escape = function( sel ) {
		return (sel + "").replace( rcssescape, fcssescape );
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();

				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];

				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},

			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},

			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},

			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {

											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index

								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( (node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});

									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {

										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});

												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});

												uniqueCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );

				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),

			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),

			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),

			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			"root": function( elem ) {
				return elem === docElem;
			},

			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},

			// Boolean properties
			"enabled": createDisabledPseudo( false ),
			"disabled": createDisabledPseudo( true ),

			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},

			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},

			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},

			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),

			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),

			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),

			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};

	Expr.pseudos["nth"] = Expr.pseudos["eq"];

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}

			matched = false;

			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			skip = combinator.next,
			key = skip || dir,
			checkNonElements = base && key === "parentNode",
			doneName = done++;

		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
				return false;
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

							if ( skip && skip === elem.nodeName.toLowerCase() ) {
								elem = elem[ dir ] || elem;
							} else if ( (oldCache = uniqueCache[ key ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ key ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
				return false;
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,

				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

						// ...intermediate processing is necessary
						[] :

						// ...otherwise use results directly
						results :
					matcherIn;

			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

							seed[temp] = !(results[temp] = elem);
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;

				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						Sizzle.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};

	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( el ) {
		// Should return 1, but returns 4 (following)
		return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
	});

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( el ) {
		el.innerHTML = "<a href='#'></a>";
		return el.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( el ) {
		el.innerHTML = "<input/>";
		el.firstChild.setAttribute( "value", "" );
		return el.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( el ) {
		return el.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}

	return Sizzle;

	})( window );



	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;

	// Deprecated
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	jQuery.escapeSelector = Sizzle.escape;




	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
		}

		// Single element
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
		}

		// Arraylike of elements (jQuery, arguments, Array)
		if ( typeof qualifier !== "string" ) {
			return jQuery.grep( elements, function( elem ) {
				return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
			} );
		}

		// Simple selector that can be filtered directly, removing non-Elements
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		// Complex selector, compare the two sets, removing non-Elements
		qualifier = jQuery.filter( qualifier, elements );
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not && elem.nodeType === 1;
		} );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		if ( elems.length === 1 && elem.nodeType === 1 ) {
			return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
		}

		return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i, ret,
				len = this.length,
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			ret = this.pushStack( [] );

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			return len > 1 ? jQuery.uniqueSort( ret ) : ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		// Shortcut simple #id case for speed
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						if ( elem ) {

							// Inject the element directly into the jQuery object
							this[ 0 ] = elem;
							this.length = 1;
						}
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				targets = typeof selectors !== "string" && jQuery( selectors );

			// Positional selectors never match, since there's no _selection_ context
			if ( !rneedsContext.test( selectors ) ) {
				for ( ; i < l; i++ ) {
					for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

						// Always skip document fragments
						if ( cur.nodeType < 11 && ( targets ?
							targets.index( cur ) > -1 :

							// Don't pass non-elements to Sizzle
							cur.nodeType === 1 &&
								jQuery.find.matchesSelector( cur, selectors ) ) ) {

							matched.push( cur );
							break;
						}
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory && !firing ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	function Identity( v ) {
		return v;
	}
	function Thrower( ex ) {
		throw ex;
	}

	function adoptValue( value, resolve, reject ) {
		var method;

		try {

			// Check for promise aspect first to privilege synchronous behavior
			if ( value && jQuery.isFunction( ( method = value.promise ) ) ) {
				method.call( value ).done( resolve ).fail( reject );

			// Other thenables
			} else if ( value && jQuery.isFunction( ( method = value.then ) ) ) {
				method.call( value, resolve, reject );

			// Other non-thenables
			} else {

				// Support: Android 4.0 only
				// Strict mode functions invoked without .call/.apply get global-object context
				resolve.call( undefined, value );
			}

		// For Promises/A+, convert exceptions into rejections
		// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
		// Deferred#then to conditionally suppress rejection.
		} catch ( value ) {

			// Support: Android 4.0 only
			// Strict mode functions invoked without .call/.apply get global-object context
			reject.call( undefined, value );
		}
	}

	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, callbacks,
					// ... .then handlers, argument index, [final state]
					[ "notify", "progress", jQuery.Callbacks( "memory" ),
						jQuery.Callbacks( "memory" ), 2 ],
					[ "resolve", "done", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 0, "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 1, "rejected" ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					"catch": function( fn ) {
						return promise.then( null, fn );
					},

					// Keep pipe for back-compat
					pipe: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;

						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {

								// Map tuples (progress, done, fail) to arguments (done, fail, progress)
								var fn = jQuery.isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

								// deferred.progress(function() { bind to newDefer or newDefer.notify })
								// deferred.done(function() { bind to newDefer or newDefer.resolve })
								// deferred.fail(function() { bind to newDefer or newDefer.reject })
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
					then: function( onFulfilled, onRejected, onProgress ) {
						var maxDepth = 0;
						function resolve( depth, deferred, handler, special ) {
							return function() {
								var that = this,
									args = arguments,
									mightThrow = function() {
										var returned, then;

										// Support: Promises/A+ section 2.3.3.3.3
										// https://promisesaplus.com/#point-59
										// Ignore double-resolution attempts
										if ( depth < maxDepth ) {
											return;
										}

										returned = handler.apply( that, args );

										// Support: Promises/A+ section 2.3.1
										// https://promisesaplus.com/#point-48
										if ( returned === deferred.promise() ) {
											throw new TypeError( "Thenable self-resolution" );
										}

										// Support: Promises/A+ sections 2.3.3.1, 3.5
										// https://promisesaplus.com/#point-54
										// https://promisesaplus.com/#point-75
										// Retrieve `then` only once
										then = returned &&

											// Support: Promises/A+ section 2.3.4
											// https://promisesaplus.com/#point-64
											// Only check objects and functions for thenability
											( typeof returned === "object" ||
												typeof returned === "function" ) &&
											returned.then;

										// Handle a returned thenable
										if ( jQuery.isFunction( then ) ) {

											// Special processors (notify) just wait for resolution
											if ( special ) {
												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special )
												);

											// Normal processors (resolve) also hook into progress
											} else {

												// ...and disregard older resolution values
												maxDepth++;

												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special ),
													resolve( maxDepth, deferred, Identity,
														deferred.notifyWith )
												);
											}

										// Handle all other returned values
										} else {

											// Only substitute handlers pass on context
											// and multiple values (non-spec behavior)
											if ( handler !== Identity ) {
												that = undefined;
												args = [ returned ];
											}

											// Process the value(s)
											// Default process is resolve
											( special || deferred.resolveWith )( that, args );
										}
									},

									// Only normal processors (resolve) catch and reject exceptions
									process = special ?
										mightThrow :
										function() {
											try {
												mightThrow();
											} catch ( e ) {

												if ( jQuery.Deferred.exceptionHook ) {
													jQuery.Deferred.exceptionHook( e,
														process.stackTrace );
												}

												// Support: Promises/A+ section 2.3.3.3.4.1
												// https://promisesaplus.com/#point-61
												// Ignore post-resolution exceptions
												if ( depth + 1 >= maxDepth ) {

													// Only substitute handlers pass on context
													// and multiple values (non-spec behavior)
													if ( handler !== Thrower ) {
														that = undefined;
														args = [ e ];
													}

													deferred.rejectWith( that, args );
												}
											}
										};

								// Support: Promises/A+ section 2.3.3.3.1
								// https://promisesaplus.com/#point-57
								// Re-resolve promises immediately to dodge false rejection from
								// subsequent errors
								if ( depth ) {
									process();
								} else {

									// Call an optional hook to record the stack, in case of exception
									// since it's otherwise lost when execution goes async
									if ( jQuery.Deferred.getStackHook ) {
										process.stackTrace = jQuery.Deferred.getStackHook();
									}
									window.setTimeout( process );
								}
							};
						}

						return jQuery.Deferred( function( newDefer ) {

							// progress_handlers.add( ... )
							tuples[ 0 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onProgress ) ?
										onProgress :
										Identity,
									newDefer.notifyWith
								)
							);

							// fulfilled_handlers.add( ... )
							tuples[ 1 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onFulfilled ) ?
										onFulfilled :
										Identity
								)
							);

							// rejected_handlers.add( ... )
							tuples[ 2 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onRejected ) ?
										onRejected :
										Thrower
								)
							);
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 5 ];

				// promise.progress = list.add
				// promise.done = list.add
				// promise.fail = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add(
						function() {

							// state = "resolved" (i.e., fulfilled)
							// state = "rejected"
							state = stateString;
						},

						// rejected_callbacks.disable
						// fulfilled_callbacks.disable
						tuples[ 3 - i ][ 2 ].disable,

						// progress_callbacks.lock
						tuples[ 0 ][ 2 ].lock
					);
				}

				// progress_handlers.fire
				// fulfilled_handlers.fire
				// rejected_handlers.fire
				list.add( tuple[ 3 ].fire );

				// deferred.notify = function() { deferred.notifyWith(...) }
				// deferred.resolve = function() { deferred.resolveWith(...) }
				// deferred.reject = function() { deferred.rejectWith(...) }
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
					return this;
				};

				// deferred.notifyWith = list.fireWith
				// deferred.resolveWith = list.fireWith
				// deferred.rejectWith = list.fireWith
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( singleValue ) {
			var

				// count of uncompleted subordinates
				remaining = arguments.length,

				// count of unprocessed arguments
				i = remaining,

				// subordinate fulfillment data
				resolveContexts = Array( i ),
				resolveValues = slice.call( arguments ),

				// the master Deferred
				master = jQuery.Deferred(),

				// subordinate callback factory
				updateFunc = function( i ) {
					return function( value ) {
						resolveContexts[ i ] = this;
						resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( !( --remaining ) ) {
							master.resolveWith( resolveContexts, resolveValues );
						}
					};
				};

			// Single- and empty arguments are adopted like Promise.resolve
			if ( remaining <= 1 ) {
				adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject );

				// Use .then() to unwrap secondary thenables (cf. gh-3000)
				if ( master.state() === "pending" ||
					jQuery.isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

					return master.then();
				}
			}

			// Multiple arguments are aggregated like Promise.all array elements
			while ( i-- ) {
				adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
			}

			return master.promise();
		}
	} );


	// These usually indicate a programmer mistake during development,
	// warn about them ASAP rather than swallowing them by default.
	var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

	jQuery.Deferred.exceptionHook = function( error, stack ) {

		// Support: IE 8 - 9 only
		// Console exists when dev tools are open, which can happen at any time
		if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
			window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
		}
	};




	jQuery.readyException = function( error ) {
		window.setTimeout( function() {
			throw error;
		} );
	};




	// The deferred used on DOM ready
	var readyList = jQuery.Deferred();

	jQuery.fn.ready = function( fn ) {

		readyList
			.then( fn )

			// Wrap jQuery.readyException in a function so that the lookup
			// happens at the time of error handling instead of callback
			// registration.
			.catch( function( error ) {
				jQuery.readyException( error );
			} );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
		}
	} );

	jQuery.ready.then = readyList.then;

	// The ready event handler and self cleanup method
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	// Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE <=9 - 10 only
	// Older IE sometimes signals "interactive" too soon
	if ( document.readyState === "complete" ||
		( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

		// Handle it asynchronously to allow scripts the opportunity to delay ready
		window.setTimeout( jQuery.ready );

	} else {

		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", completed );

		// A fallback to window.onload, that will always work
		window.addEventListener( "load", completed );
	}




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		if ( chainable ) {
			return elems;
		}

		// Gets
		if ( bulk ) {
			return fn.call( elems );
		}

		return len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		cache: function( owner ) {

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			// Always use camelCase key (gh-2257)
			if ( typeof data === "string" ) {
				cache[ jQuery.camelCase( data ) ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ jQuery.camelCase( prop ) ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :

				// Always use camelCase key (gh-2257)
				owner[ this.expando ] && owner[ this.expando ][ jQuery.camelCase( key ) ];
		},
		access: function( owner, key, value ) {

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				return this.get( owner, key );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key !== undefined ) {

				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {

					// If key is an array of keys...
					// We always set camelCase keys, so remove that.
					key = key.map( jQuery.camelCase );
				} else {
					key = jQuery.camelCase( key );

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					key = key in cache ?
						[ key ] :
						( key.match( rnothtmlwhite ) || [] );
				}

				i = key.length;

				while ( i-- ) {
					delete cache[ key[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <=35 - 45
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function getData( data ) {
		if ( data === "true" ) {
			return true;
		}

		if ( data === "false" ) {
			return false;
		}

		if ( data === "null" ) {
			return null;
		}

		// Only convert to a number if it doesn't change the string
		if ( data === +data + "" ) {
			return +data;
		}

		if ( rbrace.test( data ) ) {
			return JSON.parse( data );
		}

		return data;
	}

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = getData( data );
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE 11 only
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// The key will always be camelCased in Data
					data = dataUser.get( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				this.each( function() {

					// We always store the camelCased key
					dataUser.set( this, key, value );
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var isHiddenWithinTree = function( elem, el ) {

			// isHiddenWithinTree might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;

			// Inline style trumps all
			return elem.style.display === "none" ||
				elem.style.display === "" &&

				// Otherwise, check computed style
				// Support: Firefox <=43 - 45
				// Disconnected elements can have computed display: none, so first confirm that elem is
				// in the document.
				jQuery.contains( elem.ownerDocument, elem ) &&

				jQuery.css( elem, "display" ) === "none";
		};

	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};




	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() {
					return tween.cur();
				} :
				function() {
					return jQuery.css( elem, prop, "" );
				},
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			do {

				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";

				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );

			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}


	var defaultDisplayMap = {};

	function getDefaultDisplay( elem ) {
		var temp,
			doc = elem.ownerDocument,
			nodeName = elem.nodeName,
			display = defaultDisplayMap[ nodeName ];

		if ( display ) {
			return display;
		}

		temp = doc.body.appendChild( doc.createElement( nodeName ) );
		display = jQuery.css( temp, "display" );

		temp.parentNode.removeChild( temp );

		if ( display === "none" ) {
			display = "block";
		}
		defaultDisplayMap[ nodeName ] = display;

		return display;
	}

	function showHide( elements, show ) {
		var display, elem,
			values = [],
			index = 0,
			length = elements.length;

		// Determine new display value for elements that need to change
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			display = elem.style.display;
			if ( show ) {

				// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
				// check is required in this first loop unless we have a nonempty display value (either
				// inline or about-to-be-restored)
				if ( display === "none" ) {
					values[ index ] = dataPriv.get( elem, "display" ) || null;
					if ( !values[ index ] ) {
						elem.style.display = "";
					}
				}
				if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
					values[ index ] = getDefaultDisplay( elem );
				}
			} else {
				if ( display !== "none" ) {
					values[ index ] = "none";

					// Remember what we're overwriting
					dataPriv.set( elem, "display", display );
				}
			}
		}

		// Set the display of the elements in a second loop to avoid constant reflow
		for ( index = 0; index < length; index++ ) {
			if ( values[ index ] != null ) {
				elements[ index ].style.display = values[ index ];
			}
		}

		return elements;
	}

	jQuery.fn.extend( {
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHiddenWithinTree( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

	var rscriptType = ( /^$|\/(?:java|ecma)script/i );



	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {

		// Support: IE <=9 only
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	// Support: IE <=9 only
	wrapMap.optgroup = wrapMap.option;

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;


	function getAll( context, tag ) {

		// Support: IE <=9 - 11 only
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret;

		if ( typeof context.getElementsByTagName !== "undefined" ) {
			ret = context.getElementsByTagName( tag || "*" );

		} else if ( typeof context.querySelectorAll !== "undefined" ) {
			ret = context.querySelectorAll( tag || "*" );

		} else {
			ret = [];
		}

		if ( tag === undefined || tag && jQuery.nodeName( context, tag ) ) {
			return jQuery.merge( [ context ], ret );
		}

		return ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0 - 4.3 only
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Android <=4.1 only
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE <=11 only
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();
	var documentElement = document.documentElement;



	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	// Support: IE <=9 only
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Ensure that invalid selectors throw exceptions at attach time
			// Evaluate against documentElement in case elem is a non-element node (e.g., document)
			if ( selector ) {
				jQuery.find.matchesSelector( documentElement, selector );
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( nativeEvent ) {

			// Make a writable jQuery.Event from the native event object
			var event = jQuery.event.fix( nativeEvent );

			var i, j, ret, matched, handleObj, handlerQueue,
				args = new Array( arguments.length ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;

			for ( i = 1; i < arguments.length; i++ ) {
				args[ i ] = arguments[ i ];
			}

			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, handleObj, sel, matchedHandlers, matchedSelectors,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Find delegate handlers
			if ( delegateCount &&

				// Support: IE <=9
				// Black-hole SVG <use> instance trees (trac-13180)
				cur.nodeType &&

				// Support: Firefox <=42
				// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
				// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
				// Support: IE 11 only
				// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
				!( event.type === "click" && event.button >= 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
						matchedHandlers = [];
						matchedSelectors = {};
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matchedSelectors[ sel ] === undefined ) {
								matchedSelectors[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matchedSelectors[ sel ] ) {
								matchedHandlers.push( handleObj );
							}
						}
						if ( matchedHandlers.length ) {
							handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			cur = this;
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		addProp: function( name, hook ) {
			Object.defineProperty( jQuery.Event.prototype, name, {
				enumerable: true,
				configurable: true,

				get: jQuery.isFunction( hook ) ?
					function() {
						if ( this.originalEvent ) {
								return hook( this.originalEvent );
						}
					} :
					function() {
						if ( this.originalEvent ) {
								return this.originalEvent[ name ];
						}
					},

				set: function( value ) {
					Object.defineProperty( this, name, {
						enumerable: true,
						configurable: true,
						writable: true,
						value: value
					} );
				}
			} );
		},

		fix: function( originalEvent ) {
			return originalEvent[ jQuery.expando ] ?
				originalEvent :
				new jQuery.Event( originalEvent );
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {

				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {

				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android <=2.3 only
					src.returnValue === false ?
				returnTrue :
				returnFalse;

			// Create target properties
			// Support: Safari <=6 - 7 only
			// Target should not be a text node (#504, #13143)
			this.target = ( src.target && src.target.nodeType === 3 ) ?
				src.target.parentNode :
				src.target;

			this.currentTarget = src.currentTarget;
			this.relatedTarget = src.relatedTarget;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		isSimulated: false,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e && !this.isSimulated ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Includes all common event props including KeyEvent and MouseEvent specific props
	jQuery.each( {
		altKey: true,
		bubbles: true,
		cancelable: true,
		changedTouches: true,
		ctrlKey: true,
		detail: true,
		eventPhase: true,
		metaKey: true,
		pageX: true,
		pageY: true,
		shiftKey: true,
		view: true,
		"char": true,
		charCode: true,
		key: true,
		keyCode: true,
		button: true,
		buttons: true,
		clientX: true,
		clientY: true,
		offsetX: true,
		offsetY: true,
		pointerId: true,
		pointerType: true,
		screenX: true,
		screenY: true,
		targetTouches: true,
		toElement: true,
		touches: true,

		which: function( event ) {
			var button = event.button;

			// Add which for key events
			if ( event.which == null && rkeyEvent.test( event.type ) ) {
				return event.charCode != null ? event.charCode : event.keyCode;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
				if ( button & 1 ) {
					return 1;
				}

				if ( button & 2 ) {
					return 3;
				}

				if ( button & 4 ) {
					return 2;
				}

				return 0;
			}

			return event.which;
		}
	}, jQuery.event.addProp );

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {

		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var

		/* eslint-disable max-len */

		// See https://github.com/eslint/eslint/issues/3229
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

		/* eslint-enable */

		// Support: IE <=10 - 11, Edge 12 - 13
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

	function manipulationTarget( elem, content ) {
		if ( jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

			return elem.getElementsByTagName( "tbody" )[ 0 ] || elem;
		}

		return elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );

		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;

			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android <=4.0 only, PhantomJS 1 only
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {
		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: Android <=4.0 only, PhantomJS 1 only
				// .get() because push.apply(_, arraylike) throws on ancient WebKit
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );
	var rmargin = ( /^margin/ );

	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var getStyles = function( elem ) {

			// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};



	( function() {

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {

			// This is a singleton, we need to execute it only once
			if ( !div ) {
				return;
			}

			div.style.cssText =
				"box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";

			// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";

			documentElement.removeChild( container );

			// Nullify the div so it wouldn't be stored in the memory and
			// it will also be a sign that checks already performed
			div = null;
		}

		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE <=9 - 11 only
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );

		jQuery.extend( support, {
			pixelPosition: function() {
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				computeStyleTests();
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {
				computeStyleTests();
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {
				computeStyleTests();
				return reliableMarginLeftVal;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// Support: IE <=9 only
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// https://drafts.csswg.org/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE <=9 - 11 only
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},

		cssPrefixes = [ "Webkit", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;

	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {

		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	function setPositiveNumber( elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i,
			val = 0;

		// If we already have the right measurement, avoid augmentation
		if ( extra === ( isBorderBox ? "border" : "content" ) ) {
			i = 4;

		// Otherwise initialize for horizontal or vertical properties
		} else {
			i = name === "width" ? 1 : 0;
		}

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}

			if ( isBorderBox ) {

				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {

				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		return val;
	}

	function getWidthOrHeight( elem, name, extra ) {

		// Start with offset property, which is equivalent to the border-box value
		var val,
			valueIsBorderBox = true,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Support: IE <=11 only
		// Running getBoundingClientRect on a disconnected node
		// in IE throws an error.
		if ( elem.getClientRects().length ) {
			val = elem.getBoundingClientRect()[ name ];
		}

		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {

			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}

		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;

			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					style[ name ] = value;
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );

			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

						// Support: Safari 8+
						// Table columns in Safari have non-zero offsetWidth & zero
						// getBoundingClientRect().width unless display is changed.
						// Support: IE <=11 only
						// Running getBoundingClientRect on a disconnected node
						// in IE throws an error.
						( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE <=9 only
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	function raf() {
		if ( timerId ) {
			window.requestAnimationFrame( raf );
			jQuery.fx.tick();
		}
	}

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
			isBox = "width" in props || "height" in props,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHiddenWithinTree( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Queue-skipping animations hijack the fx hooks
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Detect show/hide animations
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.test( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// Pretend to be hidden if this is a "show" and
					// there is still data from a stopped show/hide
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;

					// Ignore all other no-op show/hide data
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
			}
		}

		// Bail out if this is a no-op like .hide().hide()
		propTween = !jQuery.isEmptyObject( props );
		if ( !propTween && jQuery.isEmptyObject( orig ) ) {
			return;
		}

		// Restrict "overflow" and "display" styles during box animations
		if ( isBox && elem.nodeType === 1 ) {

			// Support: IE <=9 - 11, Edge 12 - 13
			// Record all 3 overflow attributes because IE does not infer the shorthand
			// from identically-valued overflowX and overflowY
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Identify a display type, preferring old show/hide data over the CSS cascade
			restoreDisplay = dataShow && dataShow.display;
			if ( restoreDisplay == null ) {
				restoreDisplay = dataPriv.get( elem, "display" );
			}
			display = jQuery.css( elem, "display" );
			if ( display === "none" ) {
				if ( restoreDisplay ) {
					display = restoreDisplay;
				} else {

					// Get nonempty value(s) by temporarily forcing visibility
					showHide( [ elem ], true );
					restoreDisplay = elem.style.display || restoreDisplay;
					display = jQuery.css( elem, "display" );
					showHide( [ elem ] );
				}
			}

			// Animate inline elements as inline-block
			if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
				if ( jQuery.css( elem, "float" ) === "none" ) {

					// Restore the original display value at the end of pure show/hide animations
					if ( !propTween ) {
						anim.done( function() {
							style.display = restoreDisplay;
						} );
						if ( restoreDisplay == null ) {
							display = style.display;
							restoreDisplay = display === "none" ? "" : display;
						}
					}
					style.display = "inline-block";
				}
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// Implement show/hide animations
		propTween = false;
		for ( prop in orig ) {

			// General show/hide setup for this element animation
			if ( !propTween ) {
				if ( dataShow ) {
					if ( "hidden" in dataShow ) {
						hidden = dataShow.hidden;
					}
				} else {
					dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
				}

				// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
				if ( toggle ) {
					dataShow.hidden = !hidden;
				}

				// Show elements before animating them
				if ( hidden ) {
					showHide( [ elem ], true );
				}

				/* eslint-disable no-loop-func */

				anim.done( function() {

				/* eslint-enable no-loop-func */

					// The final step of a "hide" animation is actually hiding the element
					if ( !hidden ) {
						showHide( [ elem ] );
					}
					dataPriv.remove( elem, "fxshow" );
					for ( prop in orig ) {
						jQuery.style( elem, prop, orig[ prop ] );
					}
				} );
			}

			// Per-property setup
			propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = propTween.start;
				if ( hidden ) {
					propTween.end = propTween.start;
					propTween.start = 0;
				}
			}
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3 only
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}

	jQuery.Animation = jQuery.extend( Animation, {

		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnothtmlwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		// Go to the end state if fx are off or if document is hidden
		if ( jQuery.fx.off || document.hidden ) {
			opt.duration = 0;

		} else {
			if ( typeof opt.duration !== "number" ) {
				if ( opt.duration in jQuery.fx.speeds ) {
					opt.duration = jQuery.fx.speeds[ opt.duration ];

				} else {
					opt.duration = jQuery.fx.speeds._default;
				}
			}
		}

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = jQuery.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.requestAnimationFrame ?
				window.requestAnimationFrame( raf ) :
				window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};

	jQuery.fx.stop = function() {
		if ( window.cancelAnimationFrame ) {
			window.cancelAnimationFrame( timerId );
		} else {
			window.clearInterval( timerId );
		}

		timerId = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: Android <=4.3 only
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE <=11 only
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: IE <=11 only
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// Attribute hooks are determined by the lowercase version
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name,
				i = 0,

				// Attribute names can contain non-HTML whitespace characters
				// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
				attrNames = value && value.match( rnothtmlwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};

	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle,
				lowercaseName = name.toLowerCase();

			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ lowercaseName ];
				attrHandle[ lowercaseName ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					lowercaseName :
					null;
				attrHandle[ lowercaseName ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// Support: IE <=9 - 11 only
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					if ( tabindex ) {
						return parseInt( tabindex, 10 );
					}

					if (
						rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) &&
						elem.href
					) {
						return 0;
					}

					return -1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	// eslint rule "no-unused-expressions" is disabled for this code
	// since it considers such accessions noop
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




		// Strip and collapse whitespace according to HTML spec
		// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
		function stripAndCollapse( value ) {
			var tokens = value.match( rnothtmlwhite ) || [];
			return tokens.join( " " );
		}


	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnothtmlwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnothtmlwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );

					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {

							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value;

			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			return this.each( function() {
				var className, i, self, classNames;

				if ( type === "string" ) {

					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnothtmlwhite ) || [];

					while ( ( className = classNames[ i++ ] ) ) {

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
						return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					// Handle most common string cases
					if ( typeof ret === "string" ) {
						return ret.replace( rreturn, "" );
					}

					// Handle cases where value is null/undef or number
					return ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :

						// Support: IE <=10 - 11 only
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						stripAndCollapse( jQuery.text( elem ) );
				}
			},
			select: {
				get: function( elem ) {
					var value, option, i,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one",
						values = one ? null : [],
						max = one ? index + 1 : options.length;

					if ( index < 0 ) {
						i = max;

					} else {
						i = one ? index : 0;
					}

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// Support: IE <=9 only
						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								!option.disabled &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];

						/* eslint-disable no-cond-assign */

						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}

						/* eslint-enable no-cond-assign */
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		// Used only for `focus(in | out)` events
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
				}
			);

			jQuery.event.trigger( e, null, elem );
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup contextmenu" ).split( " " ),
		function( i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );

	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );




	support.focusin = "onfocusin" in window;


	// Support: Firefox <=44
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};

			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );

					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;

					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );

					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;

	var nonce = jQuery.now();

	var rquery = ( /\?/ );



	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE 9 - 11 only
		// IE throws on parseFromString with invalid input.
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};


	var
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( jQuery.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && jQuery.type( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, valueOrFunction ) {

				// If value is a function, invoke it and use its return value
				var value = jQuery.isFunction( valueOrFunction ) ?
					valueOrFunction() :
					valueOrFunction;

				s[ s.length ] = encodeURIComponent( key ) + "=" +
					encodeURIComponent( value == null ? "" : value );
			};

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();

				if ( val == null ) {
					return null;
				}

				if ( jQuery.isArray( val ) ) {
					return jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} );
				}

				return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	var
		r20 = /%20/g,
		rhash = /#.*$/,
		rantiCache = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

			if ( jQuery.isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

				// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",

			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": JSON.parse,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// Request state (becomes false upon send and true upon completion)
				completed,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// uncached part of the url
				uncached,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( completed ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},

					// Raw string
					getAllResponseHeaders: function() {
						return completed ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						if ( completed == null ) {
							name = requestHeadersNames[ name.toLowerCase() ] =
								requestHeadersNames[ name.toLowerCase() ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( completed == null ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( completed ) {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							} else {

								// Lazy-add the new callbacks in a way that preserves old ones
								for ( code in map ) {
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR );

			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE <=8 - 11, Edge 12 - 13
				// IE throws exception on accessing the href property if url is malformed,
				// e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE <=8 - 11 only
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( completed ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			// Remove hash to simplify url manipulation
			cacheURL = s.url.replace( rhash, "" );

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// Remember the hash so we can put it back
				uncached = s.url.slice( cacheURL.length );

				// If data is available, append data to url
				if ( s.data ) {
					cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add or update anti-cache param if needed
				if ( s.cache === false ) {
					cacheURL = cacheURL.replace( rantiCache, "$1" );
					uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
				}

				// Put hash and anti-cache on the URL that will be requested (gh-1732)
				s.url = cacheURL + uncached;

			// Change '%20' to '+' if this is encoded form body content (gh-2658)
			} else if ( s.data && s.processData &&
				( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
				s.data = s.data.replace( r20, "+" );
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			completeDeferred.add( s.complete );
			jqXHR.done( s.success );
			jqXHR.fail( s.error );

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( completed ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					completed = false;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Rethrow post-completion exceptions
					if ( completed ) {
						throw e;
					}

					// Propagate others as results
					done( -1, e );
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Ignore repeat invocations
				if ( completed ) {
					return;
				}

				completed = true;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );


	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			cache: true,
			async: false,
			global: false,
			"throws": true
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( this[ 0 ] ) {
				if ( jQuery.isFunction( html ) ) {
					html = html.call( this[ 0 ] );
				}

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function( selector ) {
			this.parent( selector ).not( "body" ).each( function() {
				jQuery( this ).replaceWith( this.childNodes );
			} );
			return this;
		}
	} );


	jQuery.expr.pseudos.hidden = function( elem ) {
		return !jQuery.expr.pseudos.visible( elem );
	};
	jQuery.expr.pseudos.visible = function( elem ) {
		return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
	};




	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE <=9 only
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE <=9 only
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE <=9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );

					// Support: IE 9 only
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
	jQuery.ajaxPrefilter( function( s ) {
		if ( s.crossDomain ) {
			s.contents.script = false;
		}
	} );

	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Support: Safari 8 only
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();


	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( typeof data !== "string" ) {
			return [];
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}

		var base, parsed, scripts;

		if ( !context ) {

			// Stop scripts or inline event handlers from being executed immediately
			// by using document.implementation
			if ( support.createHTMLDocument ) {
				context = document.implementation.createHTMLDocument( "" );

				// Set the base href for the created document
				// so any parsed elements with URLs
				// are based on the document's URL (gh-2965)
				base = context.createElement( "base" );
				base.href = document.location.href;
				context.head.appendChild( base );
			} else {
				context = document;
			}
		}

		parsed = rsingleTag.exec( data );
		scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = stripAndCollapse( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( jQuery.isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.expr.pseudos.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}

	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( jQuery.isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {
		offset: function( options ) {

			// Preserve chaining for setter
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var docElem, win, rect, doc,
				elem = this[ 0 ];

			if ( !elem ) {
				return;
			}

			// Support: IE <=11 only
			// Running getBoundingClientRect on a
			// disconnected node in IE throws an error
			if ( !elem.getClientRects().length ) {
				return { top: 0, left: 0 };
			}

			rect = elem.getBoundingClientRect();

			// Make sure element is not hidden (display: none)
			if ( rect.width || rect.height ) {
				doc = elem.ownerDocument;
				win = getWindow( doc );
				docElem = doc.documentElement;

				return {
					top: rect.top + win.pageYOffset - docElem.clientTop,
					left: rect.left + win.pageXOffset - docElem.clientLeft
				};
			}

			// Return zeros for disconnected and hidden elements (gh-2310)
			return rect;
		},

		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();

			} else {

				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset = {
					top: parentOffset.top + jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ),
					left: parentOffset.left + jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true )
				};
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari <=7 - 9.1, Chrome <=37 - 49
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( jQuery.isWindow( elem ) ) {

						// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
						return funcName.indexOf( "outer" ) === 0 ?
							elem[ "inner" + name ] :
							elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable );
			};
		} );
	} );


	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		}
	} );

	jQuery.parseJSON = JSON.parse;




	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}




	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}





	return jQuery;
	} );


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var AlgoliaSearch = __webpack_require__(3);
	var createAlgoliasearch = __webpack_require__(27);

	module.exports = createAlgoliasearch(AlgoliaSearch);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = AlgoliaSearch;

	var Index = __webpack_require__(4);
	var deprecate = __webpack_require__(10);
	var deprecatedMessage = __webpack_require__(11);
	var AlgoliaSearchCore = __webpack_require__(22);
	var inherits = __webpack_require__(5);
	var errors = __webpack_require__(8);

	function AlgoliaSearch() {
	  AlgoliaSearchCore.apply(this, arguments);
	}

	inherits(AlgoliaSearch, AlgoliaSearchCore);

	/*
	 * Delete an index
	 *
	 * @param indexName the name of index to delete
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer that contains the task ID
	 */
	AlgoliaSearch.prototype.deleteIndex = function(indexName, callback) {
	  return this._jsonRequest({
	    method: 'DELETE',
	    url: '/1/indexes/' + encodeURIComponent(indexName),
	    hostType: 'write',
	    callback: callback
	  });
	};

	/**
	 * Move an existing index.
	 * @param srcIndexName the name of index to copy.
	 * @param dstIndexName the new index name that will contains a copy of
	 * srcIndexName (destination will be overriten if it already exist).
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer that contains the task ID
	 */
	AlgoliaSearch.prototype.moveIndex = function(srcIndexName, dstIndexName, callback) {
	  var postObj = {
	    operation: 'move', destination: dstIndexName
	  };
	  return this._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(srcIndexName) + '/operation',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/**
	 * Copy an existing index.
	 * @param srcIndexName the name of index to copy.
	 * @param dstIndexName the new index name that will contains a copy
	 * of srcIndexName (destination will be overriten if it already exist).
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer that contains the task ID
	 */
	AlgoliaSearch.prototype.copyIndex = function(srcIndexName, dstIndexName, callback) {
	  var postObj = {
	    operation: 'copy', destination: dstIndexName
	  };
	  return this._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(srcIndexName) + '/operation',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/**
	 * Return last log entries.
	 * @param offset Specify the first entry to retrieve (0-based, 0 is the most recent log entry).
	 * @param length Specify the maximum number of entries to retrieve starting
	 * at offset. Maximum allowed value: 1000.
	 * @param type Specify the maximum number of entries to retrieve starting
	 * at offset. Maximum allowed value: 1000.
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer that contains the task ID
	 */
	AlgoliaSearch.prototype.getLogs = function(offset, length, callback) {
	  var clone = __webpack_require__(13);
	  var params = {};
	  if (typeof offset === 'object') {
	    // getLogs(params)
	    params = clone(offset);
	    callback = length;
	  } else if (arguments.length === 0 || typeof offset === 'function') {
	    // getLogs([cb])
	    callback = offset;
	  } else if (arguments.length === 1 || typeof length === 'function') {
	    // getLogs(1, [cb)]
	    callback = length;
	    params.offset = offset;
	  } else {
	    // getLogs(1, 2, [cb])
	    params.offset = offset;
	    params.length = length;
	  }

	  if (params.offset === undefined) params.offset = 0;
	  if (params.length === undefined) params.length = 10;

	  return this._jsonRequest({
	    method: 'GET',
	    url: '/1/logs?' + this._getSearchParams(params, ''),
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	 * List all existing indexes (paginated)
	 *
	 * @param page The page to retrieve, starting at 0.
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer with index list
	 */
	AlgoliaSearch.prototype.listIndexes = function(page, callback) {
	  var params = '';

	  if (page === undefined || typeof page === 'function') {
	    callback = page;
	  } else {
	    params = '?page=' + page;
	  }

	  return this._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes' + params,
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	 * Get the index object initialized
	 *
	 * @param indexName the name of index
	 * @param callback the result callback with one argument (the Index instance)
	 */
	AlgoliaSearch.prototype.initIndex = function(indexName) {
	  return new Index(this, indexName);
	};

	/*
	 * List all existing user keys with their associated ACLs
	 *
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer with user keys list
	 */
	AlgoliaSearch.prototype.listUserKeys = function(callback) {
	  return this._jsonRequest({
	    method: 'GET',
	    url: '/1/keys',
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	 * Get ACL of a user key
	 *
	 * @param key
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer with user keys list
	 */
	AlgoliaSearch.prototype.getUserKeyACL = function(key, callback) {
	  return this._jsonRequest({
	    method: 'GET',
	    url: '/1/keys/' + key,
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	 * Delete an existing user key
	 * @param key
	 * @param callback the result callback called with two arguments
	 *  error: null or Error('message')
	 *  content: the server answer with user keys list
	 */
	AlgoliaSearch.prototype.deleteUserKey = function(key, callback) {
	  return this._jsonRequest({
	    method: 'DELETE',
	    url: '/1/keys/' + key,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	 * Add a new global API key
	 *
	 * @param {string[]} acls - The list of ACL for this key. Defined by an array of strings that
	 *   can contains the following values:
	 *     - search: allow to search (https and http)
	 *     - addObject: allows to add/update an object in the index (https only)
	 *     - deleteObject : allows to delete an existing object (https only)
	 *     - deleteIndex : allows to delete index content (https only)
	 *     - settings : allows to get index settings (https only)
	 *     - editSettings : allows to change index settings (https only)
	 * @param {Object} [params] - Optionnal parameters to set for the key
	 * @param {number} params.validity - Number of seconds after which the key will be automatically removed (0 means no time limit for this key)
	 * @param {number} params.maxQueriesPerIPPerHour - Number of API calls allowed from an IP address per hour
	 * @param {number} params.maxHitsPerQuery - Number of hits this API key can retrieve in one call
	 * @param {string[]} params.indexes - Allowed targeted indexes for this key
	 * @param {string} params.description - A description for your key
	 * @param {string[]} params.referers - A list of authorized referers
	 * @param {Object} params.queryParameters - Force the key to use specific query parameters
	 * @param {Function} callback - The result callback called with two arguments
	 *   error: null or Error('message')
	 *   content: the server answer with user keys list
	 * @return {Promise|undefined} Returns a promise if no callback given
	 * @example
	 * client.addUserKey(['search'], {
	 *   validity: 300,
	 *   maxQueriesPerIPPerHour: 2000,
	 *   maxHitsPerQuery: 3,
	 *   indexes: ['fruits'],
	 *   description: 'Eat three fruits',
	 *   referers: ['*.algolia.com'],
	 *   queryParameters: {
	 *     tagFilters: ['public'],
	 *   }
	 * })
	 * @see {@link https://www.algolia.com/doc/rest_api#AddKey|Algolia REST API Documentation}
	 */
	AlgoliaSearch.prototype.addUserKey = function(acls, params, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: client.addUserKey(arrayOfAcls[, params, callback])';

	  if (!isArray(acls)) {
	    throw new Error(usage);
	  }

	  if (arguments.length === 1 || typeof params === 'function') {
	    callback = params;
	    params = null;
	  }

	  var postObj = {
	    acl: acls
	  };

	  if (params) {
	    postObj.validity = params.validity;
	    postObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
	    postObj.maxHitsPerQuery = params.maxHitsPerQuery;
	    postObj.indexes = params.indexes;
	    postObj.description = params.description;

	    if (params.queryParameters) {
	      postObj.queryParameters = this._getSearchParams(params.queryParameters, '');
	    }

	    postObj.referers = params.referers;
	  }

	  return this._jsonRequest({
	    method: 'POST',
	    url: '/1/keys',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/**
	 * Add a new global API key
	 * @deprecated Please use client.addUserKey()
	 */
	AlgoliaSearch.prototype.addUserKeyWithValidity = deprecate(function(acls, params, callback) {
	  return this.addUserKey(acls, params, callback);
	}, deprecatedMessage('client.addUserKeyWithValidity()', 'client.addUserKey()'));

	/**
	 * Update an existing API key
	 * @param {string} key - The key to update
	 * @param {string[]} acls - The list of ACL for this key. Defined by an array of strings that
	 *   can contains the following values:
	 *     - search: allow to search (https and http)
	 *     - addObject: allows to add/update an object in the index (https only)
	 *     - deleteObject : allows to delete an existing object (https only)
	 *     - deleteIndex : allows to delete index content (https only)
	 *     - settings : allows to get index settings (https only)
	 *     - editSettings : allows to change index settings (https only)
	 * @param {Object} [params] - Optionnal parameters to set for the key
	 * @param {number} params.validity - Number of seconds after which the key will be automatically removed (0 means no time limit for this key)
	 * @param {number} params.maxQueriesPerIPPerHour - Number of API calls allowed from an IP address per hour
	 * @param {number} params.maxHitsPerQuery - Number of hits this API key can retrieve in one call
	 * @param {string[]} params.indexes - Allowed targeted indexes for this key
	 * @param {string} params.description - A description for your key
	 * @param {string[]} params.referers - A list of authorized referers
	 * @param {Object} params.queryParameters - Force the key to use specific query parameters
	 * @param {Function} callback - The result callback called with two arguments
	 *   error: null or Error('message')
	 *   content: the server answer with user keys list
	 * @return {Promise|undefined} Returns a promise if no callback given
	 * @example
	 * client.updateUserKey('APIKEY', ['search'], {
	 *   validity: 300,
	 *   maxQueriesPerIPPerHour: 2000,
	 *   maxHitsPerQuery: 3,
	 *   indexes: ['fruits'],
	 *   description: 'Eat three fruits',
	 *   referers: ['*.algolia.com'],
	 *   queryParameters: {
	 *     tagFilters: ['public'],
	 *   }
	 * })
	 * @see {@link https://www.algolia.com/doc/rest_api#UpdateIndexKey|Algolia REST API Documentation}
	 */
	AlgoliaSearch.prototype.updateUserKey = function(key, acls, params, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: client.updateUserKey(key, arrayOfAcls[, params, callback])';

	  if (!isArray(acls)) {
	    throw new Error(usage);
	  }

	  if (arguments.length === 2 || typeof params === 'function') {
	    callback = params;
	    params = null;
	  }

	  var putObj = {
	    acl: acls
	  };

	  if (params) {
	    putObj.validity = params.validity;
	    putObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
	    putObj.maxHitsPerQuery = params.maxHitsPerQuery;
	    putObj.indexes = params.indexes;
	    putObj.description = params.description;

	    if (params.queryParameters) {
	      putObj.queryParameters = this._getSearchParams(params.queryParameters, '');
	    }

	    putObj.referers = params.referers;
	  }

	  return this._jsonRequest({
	    method: 'PUT',
	    url: '/1/keys/' + key,
	    body: putObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/**
	 * Initialize a new batch of search queries
	 * @deprecated use client.search()
	 */
	AlgoliaSearch.prototype.startQueriesBatch = deprecate(function startQueriesBatchDeprecated() {
	  this._batch = [];
	}, deprecatedMessage('client.startQueriesBatch()', 'client.search()'));

	/**
	 * Add a search query in the batch
	 * @deprecated use client.search()
	 */
	AlgoliaSearch.prototype.addQueryInBatch = deprecate(function addQueryInBatchDeprecated(indexName, query, args) {
	  this._batch.push({
	    indexName: indexName,
	    query: query,
	    params: args
	  });
	}, deprecatedMessage('client.addQueryInBatch()', 'client.search()'));

	/**
	 * Launch the batch of queries using XMLHttpRequest.
	 * @deprecated use client.search()
	 */
	AlgoliaSearch.prototype.sendQueriesBatch = deprecate(function sendQueriesBatchDeprecated(callback) {
	  return this.search(this._batch, callback);
	}, deprecatedMessage('client.sendQueriesBatch()', 'client.search()'));

	/**
	 * Perform write operations accross multiple indexes.
	 *
	 * To reduce the amount of time spent on network round trips,
	 * you can create, update, or delete several objects in one call,
	 * using the batch endpoint (all operations are done in the given order).
	 *
	 * Available actions:
	 *   - addObject
	 *   - updateObject
	 *   - partialUpdateObject
	 *   - partialUpdateObjectNoCreate
	 *   - deleteObject
	 *
	 * https://www.algolia.com/doc/rest_api#Indexes
	 * @param  {Object[]} operations An array of operations to perform
	 * @return {Promise|undefined} Returns a promise if no callback given
	 * @example
	 * client.batch([{
	 *   action: 'addObject',
	 *   indexName: 'clients',
	 *   body: {
	 *     name: 'Bill'
	 *   }
	 * }, {
	 *   action: 'udpateObject',
	 *   indexName: 'fruits',
	 *   body: {
	 *     objectID: '29138',
	 *     name: 'banana'
	 *   }
	 * }], cb)
	 */
	AlgoliaSearch.prototype.batch = function(operations, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: client.batch(operations[, callback])';

	  if (!isArray(operations)) {
	    throw new Error(usage);
	  }

	  return this._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/*/batch',
	    body: {
	      requests: operations
	    },
	    hostType: 'write',
	    callback: callback
	  });
	};

	// environment specific methods
	AlgoliaSearch.prototype.destroy = notImplemented;
	AlgoliaSearch.prototype.enableRateLimitForward = notImplemented;
	AlgoliaSearch.prototype.disableRateLimitForward = notImplemented;
	AlgoliaSearch.prototype.useSecuredAPIKey = notImplemented;
	AlgoliaSearch.prototype.disableSecuredAPIKey = notImplemented;
	AlgoliaSearch.prototype.generateSecuredApiKey = notImplemented;

	function notImplemented() {
	  var message = 'Not implemented in this environment.\n' +
	    'If you feel this is a mistake, write to support@algolia.com';

	  throw new errors.AlgoliaSearchError(message);
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(5);
	var IndexCore = __webpack_require__(6);
	var deprecate = __webpack_require__(10);
	var deprecatedMessage = __webpack_require__(11);
	var exitPromise = __webpack_require__(19);
	var errors = __webpack_require__(8);

	module.exports = Index;

	function Index() {
	  IndexCore.apply(this, arguments);
	}

	inherits(Index, IndexCore);

	/*
	* Add an object in this index
	*
	* @param content contains the javascript object to add inside the index
	* @param objectID (optional) an objectID you want to attribute to this object
	* (if the attribute already exist the old object will be overwrite)
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that contains 3 elements: createAt, taskId and objectID
	*/
	Index.prototype.addObject = function(content, objectID, callback) {
	  var indexObj = this;

	  if (arguments.length === 1 || typeof objectID === 'function') {
	    callback = objectID;
	    objectID = undefined;
	  }

	  return this.as._jsonRequest({
	    method: objectID !== undefined ?
	    'PUT' : // update or create
	    'POST', // create (API generates an objectID)
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + // create
	    (objectID !== undefined ? '/' + encodeURIComponent(objectID) : ''), // update or create
	    body: content,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Add several objects
	*
	* @param objects contains an array of objects to add
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that updateAt and taskID
	*/
	Index.prototype.addObjects = function(objects, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: index.addObjects(arrayOfObjects[, callback])';

	  if (!isArray(objects)) {
	    throw new Error(usage);
	  }

	  var indexObj = this;
	  var postObj = {
	    requests: []
	  };
	  for (var i = 0; i < objects.length; ++i) {
	    var request = {
	      action: 'addObject',
	      body: objects[i]
	    };
	    postObj.requests.push(request);
	  }
	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Update partially an object (only update attributes passed in argument)
	*
	* @param partialObject contains the javascript attributes to override, the
	*  object must contains an objectID attribute
	* @param createIfNotExists (optional) if false, avoid an automatic creation of the object
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that contains 3 elements: createAt, taskId and objectID
	*/
	Index.prototype.partialUpdateObject = function(partialObject, createIfNotExists, callback) {
	  if (arguments.length === 1 || typeof createIfNotExists === 'function') {
	    callback = createIfNotExists;
	    createIfNotExists = undefined;
	  }

	  var indexObj = this;
	  var url = '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(partialObject.objectID) + '/partial';
	  if (createIfNotExists === false) {
	    url += '?createIfNotExists=false';
	  }

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: url,
	    body: partialObject,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Partially Override the content of several objects
	*
	* @param objects contains an array of objects to update (each object must contains a objectID attribute)
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that updateAt and taskID
	*/
	Index.prototype.partialUpdateObjects = function(objects, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: index.partialUpdateObjects(arrayOfObjects[, callback])';

	  if (!isArray(objects)) {
	    throw new Error(usage);
	  }

	  var indexObj = this;
	  var postObj = {
	    requests: []
	  };
	  for (var i = 0; i < objects.length; ++i) {
	    var request = {
	      action: 'partialUpdateObject',
	      objectID: objects[i].objectID,
	      body: objects[i]
	    };
	    postObj.requests.push(request);
	  }
	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Override the content of object
	*
	* @param object contains the javascript object to save, the object must contains an objectID attribute
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that updateAt and taskID
	*/
	Index.prototype.saveObject = function(object, callback) {
	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'PUT',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(object.objectID),
	    body: object,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Override the content of several objects
	*
	* @param objects contains an array of objects to update (each object must contains a objectID attribute)
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that updateAt and taskID
	*/
	Index.prototype.saveObjects = function(objects, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: index.saveObjects(arrayOfObjects[, callback])';

	  if (!isArray(objects)) {
	    throw new Error(usage);
	  }

	  var indexObj = this;
	  var postObj = {
	    requests: []
	  };
	  for (var i = 0; i < objects.length; ++i) {
	    var request = {
	      action: 'updateObject',
	      objectID: objects[i].objectID,
	      body: objects[i]
	    };
	    postObj.requests.push(request);
	  }
	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Delete an object from the index
	*
	* @param objectID the unique identifier of object to delete
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that contains 3 elements: createAt, taskId and objectID
	*/
	Index.prototype.deleteObject = function(objectID, callback) {
	  if (typeof objectID === 'function' || typeof objectID !== 'string' && typeof objectID !== 'number') {
	    var err = new errors.AlgoliaSearchError('Cannot delete an object without an objectID');
	    callback = objectID;
	    if (typeof callback === 'function') {
	      return callback(err);
	    }

	    return this.as._promise.reject(err);
	  }

	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'DELETE',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(objectID),
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Delete several objects from an index
	*
	* @param objectIDs contains an array of objectID to delete
	* @param callback (optional) the result callback called with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that contains 3 elements: createAt, taskId and objectID
	*/
	Index.prototype.deleteObjects = function(objectIDs, callback) {
	  var isArray = __webpack_require__(17);
	  var map = __webpack_require__(18);

	  var usage = 'Usage: index.deleteObjects(arrayOfObjectIDs[, callback])';

	  if (!isArray(objectIDs)) {
	    throw new Error(usage);
	  }

	  var indexObj = this;
	  var postObj = {
	    requests: map(objectIDs, function prepareRequest(objectID) {
	      return {
	        action: 'deleteObject',
	        objectID: objectID,
	        body: {
	          objectID: objectID
	        }
	      };
	    })
	  };

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Delete all objects matching a query
	*
	* @param query the query string
	* @param params the optional query parameters
	* @param callback (optional) the result callback called with one argument
	*  error: null or Error('message')
	*/
	Index.prototype.deleteByQuery = function(query, params, callback) {
	  var clone = __webpack_require__(13);
	  var map = __webpack_require__(18);

	  var indexObj = this;
	  var client = indexObj.as;

	  if (arguments.length === 1 || typeof params === 'function') {
	    callback = params;
	    params = {};
	  } else {
	    params = clone(params);
	  }

	  params.attributesToRetrieve = 'objectID';
	  params.hitsPerPage = 1000;
	  params.distinct = false;

	  // when deleting, we should never use cache to get the
	  // search results
	  this.clearCache();

	  // there's a problem in how we use the promise chain,
	  // see how waitTask is done
	  var promise = this
	  .search(query, params)
	  .then(stopOrDelete);

	  function stopOrDelete(searchContent) {
	    // stop here
	    if (searchContent.nbHits === 0) {
	      // return indexObj.as._request.resolve();
	      return searchContent;
	    }

	    // continue and do a recursive call
	    var objectIDs = map(searchContent.hits, function getObjectID(object) {
	      return object.objectID;
	    });

	    return indexObj
	    .deleteObjects(objectIDs)
	    .then(waitTask)
	    .then(doDeleteByQuery);
	  }

	  function waitTask(deleteObjectsContent) {
	    return indexObj.waitTask(deleteObjectsContent.taskID);
	  }

	  function doDeleteByQuery() {
	    return indexObj.deleteByQuery(query, params);
	  }

	  if (!callback) {
	    return promise;
	  }

	  promise.then(success, failure);

	  function success() {
	    exitPromise(function exit() {
	      callback(null);
	    }, client._setTimeout || setTimeout);
	  }

	  function failure(err) {
	    exitPromise(function exit() {
	      callback(err);
	    }, client._setTimeout || setTimeout);
	  }
	};

	/*
	* Browse all content from an index using events. Basically this will do
	* .browse() -> .browseFrom -> .browseFrom -> .. until all the results are returned
	*
	* @param {string} query - The full text query
	* @param {Object} [queryParameters] - Any search query parameter
	* @return {EventEmitter}
	* @example
	* var browser = index.browseAll('cool songs', {
	*   tagFilters: 'public,comments',
	*   hitsPerPage: 500
	* });
	*
	* browser.on('result', function resultCallback(content) {
	*   console.log(content.hits);
	* });
	*
	* // if any error occurs, you get it
	* browser.on('error', function(err) {
	*   throw err;
	* });
	*
	* // when you have browsed the whole index, you get this event
	* browser.on('end', function() {
	*   console.log('finished');
	* });
	*
	* // at any point if you want to stop the browsing process, you can stop it manually
	* // otherwise it will go on and on
	* browser.stop();
	*
	* @see {@link https://www.algolia.com/doc/rest_api#Browse|Algolia REST API Documentation}
	*/
	Index.prototype.browseAll = function(query, queryParameters) {
	  if (typeof query === 'object') {
	    queryParameters = query;
	    query = undefined;
	  }

	  var merge = __webpack_require__(12);

	  var IndexBrowser = __webpack_require__(20);

	  var browser = new IndexBrowser();
	  var client = this.as;
	  var index = this;
	  var params = client._getSearchParams(
	    merge({}, queryParameters || {}, {
	      query: query
	    }), ''
	  );

	  // start browsing
	  browseLoop();

	  function browseLoop(cursor) {
	    if (browser._stopped) {
	      return;
	    }

	    var queryString;

	    if (cursor !== undefined) {
	      queryString = 'cursor=' + encodeURIComponent(cursor);
	    } else {
	      queryString = params;
	    }

	    client._jsonRequest({
	      method: 'GET',
	      url: '/1/indexes/' + encodeURIComponent(index.indexName) + '/browse?' + queryString,
	      hostType: 'read',
	      callback: browseCallback
	    });
	  }

	  function browseCallback(err, content) {
	    if (browser._stopped) {
	      return;
	    }

	    if (err) {
	      browser._error(err);
	      return;
	    }

	    browser._result(content);

	    // no cursor means we are finished browsing
	    if (content.cursor === undefined) {
	      browser._end();
	      return;
	    }

	    browseLoop(content.cursor);
	  }

	  return browser;
	};

	/*
	* Get a Typeahead.js adapter
	* @param searchParams contains an object with query parameters (see search for details)
	*/
	Index.prototype.ttAdapter = function(params) {
	  var self = this;
	  return function ttAdapter(query, syncCb, asyncCb) {
	    var cb;

	    if (typeof asyncCb === 'function') {
	      // typeahead 0.11
	      cb = asyncCb;
	    } else {
	      // pre typeahead 0.11
	      cb = syncCb;
	    }

	    self.search(query, params, function searchDone(err, content) {
	      if (err) {
	        cb(err);
	        return;
	      }

	      cb(content.hits);
	    });
	  };
	};

	/*
	* Wait the publication of a task on the server.
	* All server task are asynchronous and you can check with this method that the task is published.
	*
	* @param taskID the id of the task returned by server
	* @param callback the result callback with with two arguments:
	*  error: null or Error('message')
	*  content: the server answer that contains the list of results
	*/
	Index.prototype.waitTask = function(taskID, callback) {
	  // wait minimum 100ms before retrying
	  var baseDelay = 100;
	  // wait maximum 5s before retrying
	  var maxDelay = 5000;
	  var loop = 0;

	  // waitTask() must be handled differently from other methods,
	  // it's a recursive method using a timeout
	  var indexObj = this;
	  var client = indexObj.as;

	  var promise = retryLoop();

	  function retryLoop() {
	    return client._jsonRequest({
	      method: 'GET',
	      hostType: 'read',
	      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/task/' + taskID
	    }).then(function success(content) {
	      loop++;
	      var delay = baseDelay * loop * loop;
	      if (delay > maxDelay) {
	        delay = maxDelay;
	      }

	      if (content.status !== 'published') {
	        return client._promise.delay(delay).then(retryLoop);
	      }

	      return content;
	    });
	  }

	  if (!callback) {
	    return promise;
	  }

	  promise.then(successCb, failureCb);

	  function successCb(content) {
	    exitPromise(function exit() {
	      callback(null, content);
	    }, client._setTimeout || setTimeout);
	  }

	  function failureCb(err) {
	    exitPromise(function exit() {
	      callback(err);
	    }, client._setTimeout || setTimeout);
	  }
	};

	/*
	* This function deletes the index content. Settings and index specific API keys are kept untouched.
	*
	* @param callback (optional) the result callback called with two arguments
	*  error: null or Error('message')
	*  content: the settings object or the error message if a failure occured
	*/
	Index.prototype.clearIndex = function(callback) {
	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/clear',
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Get settings of this index
	*
	* @param callback (optional) the result callback called with two arguments
	*  error: null or Error('message')
	*  content: the settings object or the error message if a failure occured
	*/
	Index.prototype.getSettings = function(callback) {
	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/settings?getVersion=2',
	    hostType: 'read',
	    callback: callback
	  });
	};

	Index.prototype.searchSynonyms = function(params, callback) {
	  if (typeof params === 'function') {
	    callback = params;
	    params = {};
	  } else if (params === undefined) {
	    params = {};
	  }

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/synonyms/search',
	    body: params,
	    hostType: 'read',
	    callback: callback
	  });
	};

	Index.prototype.saveSynonym = function(synonym, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  } else if (opts === undefined) {
	    opts = {};
	  }

	  return this.as._jsonRequest({
	    method: 'PUT',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/synonyms/' + encodeURIComponent(synonym.objectID) +
	      '?forwardToSlaves=' + (opts.forwardToSlaves ? 'true' : 'false'),
	    body: synonym,
	    hostType: 'write',
	    callback: callback
	  });
	};

	Index.prototype.getSynonym = function(objectID, callback) {
	  return this.as._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/synonyms/' + encodeURIComponent(objectID),
	    hostType: 'read',
	    callback: callback
	  });
	};

	Index.prototype.deleteSynonym = function(objectID, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  } else if (opts === undefined) {
	    opts = {};
	  }

	  return this.as._jsonRequest({
	    method: 'DELETE',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/synonyms/' + encodeURIComponent(objectID) +
	      '?forwardToSlaves=' + (opts.forwardToSlaves ? 'true' : 'false'),
	    hostType: 'write',
	    callback: callback
	  });
	};

	Index.prototype.clearSynonyms = function(opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  } else if (opts === undefined) {
	    opts = {};
	  }

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/synonyms/clear' +
	      '?forwardToSlaves=' + (opts.forwardToSlaves ? 'true' : 'false'),
	    hostType: 'write',
	    callback: callback
	  });
	};

	Index.prototype.batchSynonyms = function(synonyms, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  } else if (opts === undefined) {
	    opts = {};
	  }

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/synonyms/batch' +
	      '?forwardToSlaves=' + (opts.forwardToSlaves ? 'true' : 'false') +
	      '&replaceExistingSynonyms=' + (opts.replaceExistingSynonyms ? 'true' : 'false'),
	    hostType: 'write',
	    body: synonyms,
	    callback: callback
	  });
	};

	/*
	* Set settings for this index
	*
	* @param settigns the settings object that can contains :
	* - minWordSizefor1Typo: (integer) the minimum number of characters to accept one typo (default = 3).
	* - minWordSizefor2Typos: (integer) the minimum number of characters to accept two typos (default = 7).
	* - hitsPerPage: (integer) the number of hits per page (default = 10).
	* - attributesToRetrieve: (array of strings) default list of attributes to retrieve in objects.
	*   If set to null, all attributes are retrieved.
	* - attributesToHighlight: (array of strings) default list of attributes to highlight.
	*   If set to null, all indexed attributes are highlighted.
	* - attributesToSnippet**: (array of strings) default list of attributes to snippet alongside the number
	* of words to return (syntax is attributeName:nbWords).
	*   By default no snippet is computed. If set to null, no snippet is computed.
	* - attributesToIndex: (array of strings) the list of fields you want to index.
	*   If set to null, all textual and numerical attributes of your objects are indexed,
	*   but you should update it to get optimal results.
	*   This parameter has two important uses:
	*     - Limit the attributes to index: For example if you store a binary image in base64,
	*     you want to store it and be able to
	*       retrieve it but you don't want to search in the base64 string.
	*     - Control part of the ranking*: (see the ranking parameter for full explanation)
	*     Matches in attributes at the beginning of
	*       the list will be considered more important than matches in attributes further down the list.
	*       In one attribute, matching text at the beginning of the attribute will be
	*       considered more important than text after, you can disable
	*       this behavior if you add your attribute inside `unordered(AttributeName)`,
	*       for example attributesToIndex: ["title", "unordered(text)"].
	* - attributesForFaceting: (array of strings) The list of fields you want to use for faceting.
	*   All strings in the attribute selected for faceting are extracted and added as a facet.
	*   If set to null, no attribute is used for faceting.
	* - attributeForDistinct: (string) The attribute name used for the Distinct feature.
	* This feature is similar to the SQL "distinct" keyword: when enabled
	*   in query with the distinct=1 parameter, all hits containing a duplicate
	*   value for this attribute are removed from results.
	*   For example, if the chosen attribute is show_name and several hits have
	*   the same value for show_name, then only the best one is kept and others are removed.
	* - ranking: (array of strings) controls the way results are sorted.
	*   We have six available criteria:
	*    - typo: sort according to number of typos,
	*    - geo: sort according to decreassing distance when performing a geo-location based search,
	*    - proximity: sort according to the proximity of query words in hits,
	*    - attribute: sort according to the order of attributes defined by attributesToIndex,
	*    - exact:
	*        - if the user query contains one word: sort objects having an attribute
	*        that is exactly the query word before others.
	*          For example if you search for the "V" TV show, you want to find it
	*          with the "V" query and avoid to have all popular TV
	*          show starting by the v letter before it.
	*        - if the user query contains multiple words: sort according to the
	*        number of words that matched exactly (and not as a prefix).
	*    - custom: sort according to a user defined formula set in **customRanking** attribute.
	*   The standard order is ["typo", "geo", "proximity", "attribute", "exact", "custom"]
	* - customRanking: (array of strings) lets you specify part of the ranking.
	*   The syntax of this condition is an array of strings containing attributes
	*   prefixed by asc (ascending order) or desc (descending order) operator.
	*   For example `"customRanking" => ["desc(population)", "asc(name)"]`
	* - queryType: Select how the query words are interpreted, it can be one of the following value:
	*   - prefixAll: all query words are interpreted as prefixes,
	*   - prefixLast: only the last word is interpreted as a prefix (default behavior),
	*   - prefixNone: no query word is interpreted as a prefix. This option is not recommended.
	* - highlightPreTag: (string) Specify the string that is inserted before
	* the highlighted parts in the query result (default to "<em>").
	* - highlightPostTag: (string) Specify the string that is inserted after
	* the highlighted parts in the query result (default to "</em>").
	* - optionalWords: (array of strings) Specify a list of words that should
	* be considered as optional when found in the query.
	* @param callback (optional) the result callback called with two arguments
	*  error: null or Error('message')
	*  content: the server answer or the error message if a failure occured
	*/
	Index.prototype.setSettings = function(settings, opts, callback) {
	  if (arguments.length === 1 || typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }

	  var forwardToSlaves = opts.forwardToSlaves || false;

	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'PUT',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/settings?forwardToSlaves='
	      + (forwardToSlaves ? 'true' : 'false'),
	    hostType: 'write',
	    body: settings,
	    callback: callback
	  });
	};

	/*
	* List all existing user keys associated to this index
	*
	* @param callback the result callback called with two arguments
	*  error: null or Error('message')
	*  content: the server answer with user keys list
	*/
	Index.prototype.listUserKeys = function(callback) {
	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/keys',
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	* Get ACL of a user key associated to this index
	*
	* @param key
	* @param callback the result callback called with two arguments
	*  error: null or Error('message')
	*  content: the server answer with user keys list
	*/
	Index.prototype.getUserKeyACL = function(key, callback) {
	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/keys/' + key,
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	* Delete an existing user key associated to this index
	*
	* @param key
	* @param callback the result callback called with two arguments
	*  error: null or Error('message')
	*  content: the server answer with user keys list
	*/
	Index.prototype.deleteUserKey = function(key, callback) {
	  var indexObj = this;
	  return this.as._jsonRequest({
	    method: 'DELETE',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/keys/' + key,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/*
	* Add a new API key to this index
	*
	* @param {string[]} acls - The list of ACL for this key. Defined by an array of strings that
	*   can contains the following values:
	*     - search: allow to search (https and http)
	*     - addObject: allows to add/update an object in the index (https only)
	*     - deleteObject : allows to delete an existing object (https only)
	*     - deleteIndex : allows to delete index content (https only)
	*     - settings : allows to get index settings (https only)
	*     - editSettings : allows to change index settings (https only)
	* @param {Object} [params] - Optionnal parameters to set for the key
	* @param {number} params.validity - Number of seconds after which the key will
	* be automatically removed (0 means no time limit for this key)
	* @param {number} params.maxQueriesPerIPPerHour - Number of API calls allowed from an IP address per hour
	* @param {number} params.maxHitsPerQuery - Number of hits this API key can retrieve in one call
	* @param {string} params.description - A description for your key
	* @param {string[]} params.referers - A list of authorized referers
	* @param {Object} params.queryParameters - Force the key to use specific query parameters
	* @param {Function} callback - The result callback called with two arguments
	*   error: null or Error('message')
	*   content: the server answer with user keys list
	* @return {Promise|undefined} Returns a promise if no callback given
	* @example
	* index.addUserKey(['search'], {
	*   validity: 300,
	*   maxQueriesPerIPPerHour: 2000,
	*   maxHitsPerQuery: 3,
	*   description: 'Eat three fruits',
	*   referers: ['*.algolia.com'],
	*   queryParameters: {
	*     tagFilters: ['public'],
	*   }
	* })
	* @see {@link https://www.algolia.com/doc/rest_api#AddIndexKey|Algolia REST API Documentation}
	*/
	Index.prototype.addUserKey = function(acls, params, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: index.addUserKey(arrayOfAcls[, params, callback])';

	  if (!isArray(acls)) {
	    throw new Error(usage);
	  }

	  if (arguments.length === 1 || typeof params === 'function') {
	    callback = params;
	    params = null;
	  }

	  var postObj = {
	    acl: acls
	  };

	  if (params) {
	    postObj.validity = params.validity;
	    postObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
	    postObj.maxHitsPerQuery = params.maxHitsPerQuery;
	    postObj.description = params.description;

	    if (params.queryParameters) {
	      postObj.queryParameters = this.as._getSearchParams(params.queryParameters, '');
	    }

	    postObj.referers = params.referers;
	  }

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/keys',
	    body: postObj,
	    hostType: 'write',
	    callback: callback
	  });
	};

	/**
	* Add an existing user key associated to this index
	* @deprecated use index.addUserKey()
	*/
	Index.prototype.addUserKeyWithValidity = deprecate(function deprecatedAddUserKeyWithValidity(acls, params, callback) {
	  return this.addUserKey(acls, params, callback);
	}, deprecatedMessage('index.addUserKeyWithValidity()', 'index.addUserKey()'));

	/**
	* Update an existing API key of this index
	* @param {string} key - The key to update
	* @param {string[]} acls - The list of ACL for this key. Defined by an array of strings that
	*   can contains the following values:
	*     - search: allow to search (https and http)
	*     - addObject: allows to add/update an object in the index (https only)
	*     - deleteObject : allows to delete an existing object (https only)
	*     - deleteIndex : allows to delete index content (https only)
	*     - settings : allows to get index settings (https only)
	*     - editSettings : allows to change index settings (https only)
	* @param {Object} [params] - Optionnal parameters to set for the key
	* @param {number} params.validity - Number of seconds after which the key will
	* be automatically removed (0 means no time limit for this key)
	* @param {number} params.maxQueriesPerIPPerHour - Number of API calls allowed from an IP address per hour
	* @param {number} params.maxHitsPerQuery - Number of hits this API key can retrieve in one call
	* @param {string} params.description - A description for your key
	* @param {string[]} params.referers - A list of authorized referers
	* @param {Object} params.queryParameters - Force the key to use specific query parameters
	* @param {Function} callback - The result callback called with two arguments
	*   error: null or Error('message')
	*   content: the server answer with user keys list
	* @return {Promise|undefined} Returns a promise if no callback given
	* @example
	* index.updateUserKey('APIKEY', ['search'], {
	*   validity: 300,
	*   maxQueriesPerIPPerHour: 2000,
	*   maxHitsPerQuery: 3,
	*   description: 'Eat three fruits',
	*   referers: ['*.algolia.com'],
	*   queryParameters: {
	*     tagFilters: ['public'],
	*   }
	* })
	* @see {@link https://www.algolia.com/doc/rest_api#UpdateIndexKey|Algolia REST API Documentation}
	*/
	Index.prototype.updateUserKey = function(key, acls, params, callback) {
	  var isArray = __webpack_require__(17);
	  var usage = 'Usage: index.updateUserKey(key, arrayOfAcls[, params, callback])';

	  if (!isArray(acls)) {
	    throw new Error(usage);
	  }

	  if (arguments.length === 2 || typeof params === 'function') {
	    callback = params;
	    params = null;
	  }

	  var putObj = {
	    acl: acls
	  };

	  if (params) {
	    putObj.validity = params.validity;
	    putObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
	    putObj.maxHitsPerQuery = params.maxHitsPerQuery;
	    putObj.description = params.description;

	    if (params.queryParameters) {
	      putObj.queryParameters = this.as._getSearchParams(params.queryParameters, '');
	    }

	    putObj.referers = params.referers;
	  }

	  return this.as._jsonRequest({
	    method: 'PUT',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/keys/' + key,
	    body: putObj,
	    hostType: 'write',
	    callback: callback
	  });
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var buildSearchMethod = __webpack_require__(7);
	var deprecate = __webpack_require__(10);
	var deprecatedMessage = __webpack_require__(11);

	module.exports = IndexCore;

	/*
	* Index class constructor.
	* You should not use this method directly but use initIndex() function
	*/
	function IndexCore(algoliasearch, indexName) {
	  this.indexName = indexName;
	  this.as = algoliasearch;
	  this.typeAheadArgs = null;
	  this.typeAheadValueOption = null;

	  // make sure every index instance has it's own cache
	  this.cache = {};
	}

	/*
	* Clear all queries in cache
	*/
	IndexCore.prototype.clearCache = function() {
	  this.cache = {};
	};

	/*
	* Search inside the index using XMLHttpRequest request (Using a POST query to
	* minimize number of OPTIONS queries: Cross-Origin Resource Sharing).
	*
	* @param query the full text query
	* @param args (optional) if set, contains an object with query parameters:
	* - page: (integer) Pagination parameter used to select the page to retrieve.
	*                   Page is zero-based and defaults to 0. Thus,
	*                   to retrieve the 10th page you need to set page=9
	* - hitsPerPage: (integer) Pagination parameter used to select the number of hits per page. Defaults to 20.
	* - attributesToRetrieve: a string that contains the list of object attributes
	* you want to retrieve (let you minimize the answer size).
	*   Attributes are separated with a comma (for example "name,address").
	*   You can also use an array (for example ["name","address"]).
	*   By default, all attributes are retrieved. You can also use '*' to retrieve all
	*   values when an attributesToRetrieve setting is specified for your index.
	* - attributesToHighlight: a string that contains the list of attributes you
	*   want to highlight according to the query.
	*   Attributes are separated by a comma. You can also use an array (for example ["name","address"]).
	*   If an attribute has no match for the query, the raw value is returned.
	*   By default all indexed text attributes are highlighted.
	*   You can use `*` if you want to highlight all textual attributes.
	*   Numerical attributes are not highlighted.
	*   A matchLevel is returned for each highlighted attribute and can contain:
	*      - full: if all the query terms were found in the attribute,
	*      - partial: if only some of the query terms were found,
	*      - none: if none of the query terms were found.
	* - attributesToSnippet: a string that contains the list of attributes to snippet alongside
	* the number of words to return (syntax is `attributeName:nbWords`).
	*    Attributes are separated by a comma (Example: attributesToSnippet=name:10,content:10).
	*    You can also use an array (Example: attributesToSnippet: ['name:10','content:10']).
	*    By default no snippet is computed.
	* - minWordSizefor1Typo: the minimum number of characters in a query word to accept one typo in this word.
	* Defaults to 3.
	* - minWordSizefor2Typos: the minimum number of characters in a query word
	* to accept two typos in this word. Defaults to 7.
	* - getRankingInfo: if set to 1, the result hits will contain ranking
	* information in _rankingInfo attribute.
	* - aroundLatLng: search for entries around a given
	* latitude/longitude (specified as two floats separated by a comma).
	*   For example aroundLatLng=47.316669,5.016670).
	*   You can specify the maximum distance in meters with the aroundRadius parameter (in meters)
	*   and the precision for ranking with aroundPrecision
	*   (for example if you set aroundPrecision=100, two objects that are distant of
	*   less than 100m will be considered as identical for "geo" ranking parameter).
	*   At indexing, you should specify geoloc of an object with the _geoloc attribute
	*   (in the form {"_geoloc":{"lat":48.853409, "lng":2.348800}})
	* - insideBoundingBox: search entries inside a given area defined by the two extreme points
	* of a rectangle (defined by 4 floats: p1Lat,p1Lng,p2Lat,p2Lng).
	*   For example insideBoundingBox=47.3165,4.9665,47.3424,5.0201).
	*   At indexing, you should specify geoloc of an object with the _geoloc attribute
	*   (in the form {"_geoloc":{"lat":48.853409, "lng":2.348800}})
	* - numericFilters: a string that contains the list of numeric filters you want to
	* apply separated by a comma.
	*   The syntax of one filter is `attributeName` followed by `operand` followed by `value`.
	*   Supported operands are `<`, `<=`, `=`, `>` and `>=`.
	*   You can have multiple conditions on one attribute like for example numericFilters=price>100,price<1000.
	*   You can also use an array (for example numericFilters: ["price>100","price<1000"]).
	* - tagFilters: filter the query by a set of tags. You can AND tags by separating them by commas.
	*   To OR tags, you must add parentheses. For example, tags=tag1,(tag2,tag3) means tag1 AND (tag2 OR tag3).
	*   You can also use an array, for example tagFilters: ["tag1",["tag2","tag3"]]
	*   means tag1 AND (tag2 OR tag3).
	*   At indexing, tags should be added in the _tags** attribute
	*   of objects (for example {"_tags":["tag1","tag2"]}).
	* - facetFilters: filter the query by a list of facets.
	*   Facets are separated by commas and each facet is encoded as `attributeName:value`.
	*   For example: `facetFilters=category:Book,author:John%20Doe`.
	*   You can also use an array (for example `["category:Book","author:John%20Doe"]`).
	* - facets: List of object attributes that you want to use for faceting.
	*   Comma separated list: `"category,author"` or array `['category','author']`
	*   Only attributes that have been added in **attributesForFaceting** index setting
	*   can be used in this parameter.
	*   You can also use `*` to perform faceting on all attributes specified in **attributesForFaceting**.
	* - queryType: select how the query words are interpreted, it can be one of the following value:
	*    - prefixAll: all query words are interpreted as prefixes,
	*    - prefixLast: only the last word is interpreted as a prefix (default behavior),
	*    - prefixNone: no query word is interpreted as a prefix. This option is not recommended.
	* - optionalWords: a string that contains the list of words that should
	* be considered as optional when found in the query.
	*   Comma separated and array are accepted.
	* - distinct: If set to 1, enable the distinct feature (disabled by default)
	* if the attributeForDistinct index setting is set.
	*   This feature is similar to the SQL "distinct" keyword: when enabled
	*   in a query with the distinct=1 parameter,
	*   all hits containing a duplicate value for the attributeForDistinct attribute are removed from results.
	*   For example, if the chosen attribute is show_name and several hits have
	*   the same value for show_name, then only the best
	*   one is kept and others are removed.
	* - restrictSearchableAttributes: List of attributes you want to use for
	* textual search (must be a subset of the attributesToIndex index setting)
	* either comma separated or as an array
	* @param callback the result callback called with two arguments:
	*  error: null or Error('message'). If false, the content contains the error.
	*  content: the server answer that contains the list of results.
	*/
	IndexCore.prototype.search = buildSearchMethod('query');

	/*
	* -- BETA --
	* Search a record similar to the query inside the index using XMLHttpRequest request (Using a POST query to
	* minimize number of OPTIONS queries: Cross-Origin Resource Sharing).
	*
	* @param query the similar query
	* @param args (optional) if set, contains an object with query parameters.
	*   All search parameters are supported (see search function), restrictSearchableAttributes and facetFilters
	*   are the two most useful to restrict the similar results and get more relevant content
	*/
	IndexCore.prototype.similarSearch = buildSearchMethod('similarQuery');

	/*
	* Browse index content. The response content will have a `cursor` property that you can use
	* to browse subsequent pages for this query. Use `index.browseFrom(cursor)` when you want.
	*
	* @param {string} query - The full text query
	* @param {Object} [queryParameters] - Any search query parameter
	* @param {Function} [callback] - The result callback called with two arguments
	*   error: null or Error('message')
	*   content: the server answer with the browse result
	* @return {Promise|undefined} Returns a promise if no callback given
	* @example
	* index.browse('cool songs', {
	*   tagFilters: 'public,comments',
	*   hitsPerPage: 500
	* }, callback);
	* @see {@link https://www.algolia.com/doc/rest_api#Browse|Algolia REST API Documentation}
	*/
	IndexCore.prototype.browse = function(query, queryParameters, callback) {
	  var merge = __webpack_require__(12);

	  var indexObj = this;

	  var page;
	  var hitsPerPage;

	  // we check variadic calls that are not the one defined
	  // .browse()/.browse(fn)
	  // => page = 0
	  if (arguments.length === 0 || arguments.length === 1 && typeof arguments[0] === 'function') {
	    page = 0;
	    callback = arguments[0];
	    query = undefined;
	  } else if (typeof arguments[0] === 'number') {
	    // .browse(2)/.browse(2, 10)/.browse(2, fn)/.browse(2, 10, fn)
	    page = arguments[0];
	    if (typeof arguments[1] === 'number') {
	      hitsPerPage = arguments[1];
	    } else if (typeof arguments[1] === 'function') {
	      callback = arguments[1];
	      hitsPerPage = undefined;
	    }
	    query = undefined;
	    queryParameters = undefined;
	  } else if (typeof arguments[0] === 'object') {
	    // .browse(queryParameters)/.browse(queryParameters, cb)
	    if (typeof arguments[1] === 'function') {
	      callback = arguments[1];
	    }
	    queryParameters = arguments[0];
	    query = undefined;
	  } else if (typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
	    // .browse(query, cb)
	    callback = arguments[1];
	    queryParameters = undefined;
	  }

	  // otherwise it's a .browse(query)/.browse(query, queryParameters)/.browse(query, queryParameters, cb)

	  // get search query parameters combining various possible calls
	  // to .browse();
	  queryParameters = merge({}, queryParameters || {}, {
	    page: page,
	    hitsPerPage: hitsPerPage,
	    query: query
	  });

	  var params = this.as._getSearchParams(queryParameters, '');

	  return this.as._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/browse?' + params,
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	* Continue browsing from a previous position (cursor), obtained via a call to `.browse()`.
	*
	* @param {string} query - The full text query
	* @param {Object} [queryParameters] - Any search query parameter
	* @param {Function} [callback] - The result callback called with two arguments
	*   error: null or Error('message')
	*   content: the server answer with the browse result
	* @return {Promise|undefined} Returns a promise if no callback given
	* @example
	* index.browseFrom('14lkfsakl32', callback);
	* @see {@link https://www.algolia.com/doc/rest_api#Browse|Algolia REST API Documentation}
	*/
	IndexCore.prototype.browseFrom = function(cursor, callback) {
	  return this.as._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/browse?cursor=' + encodeURIComponent(cursor),
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	* Search for facet values
	* https://www.algolia.com/doc/rest-api/search#search-for-facet-values
	*
	* @param {string} params.facetName Facet name, name of the attribute to search for values in.
	* Must be declared as a facet
	* @param {string} params.facetQuery Query for the facet search
	* @param {string} [params.*] Any search parameter of Algolia,
	* see https://www.algolia.com/doc/api-client/javascript/search#search-parameters
	* Pagination is not supported. The page and hitsPerPage parameters will be ignored.
	* @param callback (optional)
	*/
	IndexCore.prototype.searchForFacetValues = function(params, callback) {
	  var clone = __webpack_require__(13);
	  var omit = __webpack_require__(14);
	  var usage = 'Usage: index.searchForFacetValues({facetName, facetQuery, ...params}[, callback])';

	  if (params.facetName === undefined || params.facetQuery === undefined) {
	    throw new Error(usage);
	  }

	  var facetName = params.facetName;
	  var filteredParams = omit(clone(params), function(keyName) {
	    return keyName === 'facetName';
	  });
	  var searchParameters = this.as._getSearchParams(filteredParams, '');

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/' +
	      encodeURIComponent(this.indexName) + '/facets/' + encodeURIComponent(facetName) + '/query',
	    hostType: 'read',
	    body: {params: searchParameters},
	    callback: callback
	  });
	};

	IndexCore.prototype.searchFacet = deprecate(function(params, callback) {
	  return this.searchForFacetValues(params, callback);
	}, deprecatedMessage(
	  'index.searchFacet(params[, callback])',
	  'index.searchForFacetValues(params[, callback])'
	));

	IndexCore.prototype._search = function(params, url, callback) {
	  return this.as._jsonRequest({
	    cache: this.cache,
	    method: 'POST',
	    url: url || '/1/indexes/' + encodeURIComponent(this.indexName) + '/query',
	    body: {params: params},
	    hostType: 'read',
	    fallback: {
	      method: 'GET',
	      url: '/1/indexes/' + encodeURIComponent(this.indexName),
	      body: {params: params}
	    },
	    callback: callback
	  });
	};

	/*
	* Get an object from this index
	*
	* @param objectID the unique identifier of the object to retrieve
	* @param attrs (optional) if set, contains the array of attribute names to retrieve
	* @param callback (optional) the result callback called with two arguments
	*  error: null or Error('message')
	*  content: the object to retrieve or the error message if a failure occured
	*/
	IndexCore.prototype.getObject = function(objectID, attrs, callback) {
	  var indexObj = this;

	  if (arguments.length === 1 || typeof attrs === 'function') {
	    callback = attrs;
	    attrs = undefined;
	  }

	  var params = '';
	  if (attrs !== undefined) {
	    params = '?attributes=';
	    for (var i = 0; i < attrs.length; ++i) {
	      if (i !== 0) {
	        params += ',';
	      }
	      params += attrs[i];
	    }
	  }

	  return this.as._jsonRequest({
	    method: 'GET',
	    url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(objectID) + params,
	    hostType: 'read',
	    callback: callback
	  });
	};

	/*
	* Get several objects from this index
	*
	* @param objectIDs the array of unique identifier of objects to retrieve
	*/
	IndexCore.prototype.getObjects = function(objectIDs, attributesToRetrieve, callback) {
	  var isArray = __webpack_require__(17);
	  var map = __webpack_require__(18);

	  var usage = 'Usage: index.getObjects(arrayOfObjectIDs[, callback])';

	  if (!isArray(objectIDs)) {
	    throw new Error(usage);
	  }

	  var indexObj = this;

	  if (arguments.length === 1 || typeof attributesToRetrieve === 'function') {
	    callback = attributesToRetrieve;
	    attributesToRetrieve = undefined;
	  }

	  var body = {
	    requests: map(objectIDs, function prepareRequest(objectID) {
	      var request = {
	        indexName: indexObj.indexName,
	        objectID: objectID
	      };

	      if (attributesToRetrieve) {
	        request.attributesToRetrieve = attributesToRetrieve.join(',');
	      }

	      return request;
	    })
	  };

	  return this.as._jsonRequest({
	    method: 'POST',
	    url: '/1/indexes/*/objects',
	    hostType: 'read',
	    body: body,
	    callback: callback
	  });
	};

	IndexCore.prototype.as = null;
	IndexCore.prototype.indexName = null;
	IndexCore.prototype.typeAheadArgs = null;
	IndexCore.prototype.typeAheadValueOption = null;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = buildSearchMethod;

	var errors = __webpack_require__(8);

	function buildSearchMethod(queryParam, url) {
	  return function search(query, args, callback) {
	    // warn V2 users on how to search
	    if (typeof query === 'function' && typeof args === 'object' ||
	      typeof callback === 'object') {
	      // .search(query, params, cb)
	      // .search(cb, params)
	      throw new errors.AlgoliaSearchError('index.search usage is index.search(query, params, cb)');
	    }

	    if (arguments.length === 0 || typeof query === 'function') {
	      // .search(), .search(cb)
	      callback = query;
	      query = '';
	    } else if (arguments.length === 1 || typeof args === 'function') {
	      // .search(query/args), .search(query, cb)
	      callback = args;
	      args = undefined;
	    }

	    // .search(args), careful: typeof null === 'object'
	    if (typeof query === 'object' && query !== null) {
	      args = query;
	      query = undefined;
	    } else if (query === undefined || query === null) { // .search(undefined/null)
	      query = '';
	    }

	    var params = '';

	    if (query !== undefined) {
	      params += queryParam + '=' + encodeURIComponent(query);
	    }

	    if (args !== undefined) {
	      // `_getSearchParams` will augment params, do not be fooled by the = versus += from previous if
	      params = this.as._getSearchParams(args, params);
	    }

	    return this._search(params, url, callback);
	  };
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// This file hosts our error definitions
	// We use custom error "types" so that we can act on them when we need it
	// e.g.: if error instanceof errors.UnparsableJSON then..

	var inherits = __webpack_require__(5);

	function AlgoliaSearchError(message, extraProperties) {
	  var forEach = __webpack_require__(9);

	  var error = this;

	  // try to get a stacktrace
	  if (typeof Error.captureStackTrace === 'function') {
	    Error.captureStackTrace(this, this.constructor);
	  } else {
	    error.stack = (new Error()).stack || 'Cannot get a stacktrace, browser is too old';
	  }

	  this.name = 'AlgoliaSearchError';
	  this.message = message || 'Unknown error';

	  if (extraProperties) {
	    forEach(extraProperties, function addToErrorObject(value, key) {
	      error[key] = value;
	    });
	  }
	}

	inherits(AlgoliaSearchError, Error);

	function createCustomError(name, message) {
	  function AlgoliaSearchCustomError() {
	    var args = Array.prototype.slice.call(arguments, 0);

	    // custom message not set, use default
	    if (typeof args[0] !== 'string') {
	      args.unshift(message);
	    }

	    AlgoliaSearchError.apply(this, args);
	    this.name = 'AlgoliaSearch' + name + 'Error';
	  }

	  inherits(AlgoliaSearchCustomError, AlgoliaSearchError);

	  return AlgoliaSearchCustomError;
	}

	// late exports to let various fn defs and inherits take place
	module.exports = {
	  AlgoliaSearchError: AlgoliaSearchError,
	  UnparsableJSON: createCustomError(
	    'UnparsableJSON',
	    'Could not parse the incoming response as JSON, see err.more for details'
	  ),
	  RequestTimeout: createCustomError(
	    'RequestTimeout',
	    'Request timedout before getting a response'
	  ),
	  Network: createCustomError(
	    'Network',
	    'Network issue, see err.more for details'
	  ),
	  JSONPScriptFail: createCustomError(
	    'JSONPScriptFail',
	    '<script> was loaded but did not call our provided callback'
	  ),
	  JSONPScriptError: createCustomError(
	    'JSONPScriptError',
	    '<script> unable to load due to an `error` event on it'
	  ),
	  Unknown: createCustomError(
	    'Unknown',
	    'Unknown error occured'
	  )
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	
	var hasOwn = Object.prototype.hasOwnProperty;
	var toString = Object.prototype.toString;

	module.exports = function forEach (obj, fn, ctx) {
	    if (toString.call(fn) !== '[object Function]') {
	        throw new TypeError('iterator must be a function');
	    }
	    var l = obj.length;
	    if (l === +l) {
	        for (var i = 0; i < l; i++) {
	            fn.call(ctx, obj[i], i, obj);
	        }
	    } else {
	        for (var k in obj) {
	            if (hasOwn.call(obj, k)) {
	                fn.call(ctx, obj[k], k, obj);
	            }
	        }
	    }
	};



/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function deprecate(fn, message) {
	  var warned = false;

	  function deprecated() {
	    if (!warned) {
	      /* eslint no-console:0 */
	      console.log(message);
	      warned = true;
	    }

	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function deprecatedMessage(previousUsage, newUsage) {
	  var githubAnchorLink = previousUsage.toLowerCase()
	    .replace('.', '')
	    .replace('()', '');

	  return 'algoliasearch: `' + previousUsage + '` was replaced by `' + newUsage +
	    '`. Please see https://github.com/algolia/algoliasearch-client-js/wiki/Deprecated#' + githubAnchorLink;
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var foreach = __webpack_require__(9);

	module.exports = function merge(destination/* , sources */) {
	  var sources = Array.prototype.slice.call(arguments);

	  foreach(sources, function(source) {
	    for (var keyName in source) {
	      if (source.hasOwnProperty(keyName)) {
	        if (typeof destination[keyName] === 'object' && typeof source[keyName] === 'object') {
	          destination[keyName] = merge({}, destination[keyName], source[keyName]);
	        } else if (source[keyName] !== undefined) {
	          destination[keyName] = source[keyName];
	        }
	      }
	    }
	  });

	  return destination;
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function clone(obj) {
	  return JSON.parse(JSON.stringify(obj));
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function omit(obj, test) {
	  var keys = __webpack_require__(15);
	  var foreach = __webpack_require__(9);

	  var filtered = {};

	  foreach(keys(obj), function doFilter(keyName) {
	    if (test(keyName) !== true) {
	      filtered[keyName] = obj[keyName];
	    }
	  });

	  return filtered;
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var isArgs = __webpack_require__(16);
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	var keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};

	keysShim.shim = function shimObjectKeys() {
		if (Object.keys) {
			var keysWorksWithArguments = (function () {
				// Safari 5.0 bug
				return (Object.keys(arguments) || '').length === 2;
			}(1, 2));
			if (!keysWorksWithArguments) {
				var originalKeys = Object.keys;
				Object.keys = function keys(object) {
					if (isArgs(object)) {
						return originalKeys(slice.call(object));
					} else {
						return originalKeys(object);
					}
				};
			}
		} else {
			Object.keys = keysShim;
		}
		return Object.keys || keysShim;
	};

	module.exports = keysShim;


/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	var toStr = Object.prototype.toString;

	module.exports = function isArguments(value) {
		var str = toStr.call(value);
		var isArgs = str === '[object Arguments]';
		if (!isArgs) {
			isArgs = str !== '[object Array]' &&
				value !== null &&
				typeof value === 'object' &&
				typeof value.length === 'number' &&
				value.length >= 0 &&
				toStr.call(value.callee) === '[object Function]';
		}
		return isArgs;
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var foreach = __webpack_require__(9);

	module.exports = function map(arr, fn) {
	  var newArr = [];
	  foreach(arr, function(item, itemIndex) {
	    newArr.push(fn(item, itemIndex, arr));
	  });
	  return newArr;
	};


/***/ },
/* 19 */
/***/ function(module, exports) {

	// Parse cloud does not supports setTimeout
	// We do not store a setTimeout reference in the client everytime
	// We only fallback to a fake setTimeout when not available
	// setTimeout cannot be override globally sadly
	module.exports = function exitPromise(fn, _setTimeout) {
	  _setTimeout(fn, 0);
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// This is the object returned by the `index.browseAll()` method

	module.exports = IndexBrowser;

	var inherits = __webpack_require__(5);
	var EventEmitter = __webpack_require__(21).EventEmitter;

	function IndexBrowser() {
	}

	inherits(IndexBrowser, EventEmitter);

	IndexBrowser.prototype.stop = function() {
	  this._stopped = true;
	  this._clean();
	};

	IndexBrowser.prototype._end = function() {
	  this.emit('end');
	  this._clean();
	};

	IndexBrowser.prototype._error = function(err) {
	  this.emit('error', err);
	  this._clean();
	};

	IndexBrowser.prototype._result = function(content) {
	  this.emit('result', content);
	};

	IndexBrowser.prototype._clean = function() {
	  this.removeAllListeners('stop');
	  this.removeAllListeners('end');
	  this.removeAllListeners('error');
	  this.removeAllListeners('result');
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = AlgoliaSearchCore;

	var errors = __webpack_require__(8);
	var exitPromise = __webpack_require__(19);
	var IndexCore = __webpack_require__(6);

	// We will always put the API KEY in the JSON body in case of too long API KEY
	var MAX_API_KEY_LENGTH = 500;

	/*
	 * Algolia Search library initialization
	 * https://www.algolia.com/
	 *
	 * @param {string} applicationID - Your applicationID, found in your dashboard
	 * @param {string} apiKey - Your API key, found in your dashboard
	 * @param {Object} [opts]
	 * @param {number} [opts.timeout=2000] - The request timeout set in milliseconds,
	 * another request will be issued after this timeout
	 * @param {string} [opts.protocol='http:'] - The protocol used to query Algolia Search API.
	 *                                        Set to 'https:' to force using https.
	 *                                        Default to document.location.protocol in browsers
	 * @param {Object|Array} [opts.hosts={
	 *           read: [this.applicationID + '-dsn.algolia.net'].concat([
	 *             this.applicationID + '-1.algolianet.com',
	 *             this.applicationID + '-2.algolianet.com',
	 *             this.applicationID + '-3.algolianet.com']
	 *           ]),
	 *           write: [this.applicationID + '.algolia.net'].concat([
	 *             this.applicationID + '-1.algolianet.com',
	 *             this.applicationID + '-2.algolianet.com',
	 *             this.applicationID + '-3.algolianet.com']
	 *           ]) - The hosts to use for Algolia Search API.
	 *           If you provide them, you will less benefit from our HA implementation
	 */
	function AlgoliaSearchCore(applicationID, apiKey, opts) {
	  var debug = __webpack_require__(23)('algoliasearch');

	  var clone = __webpack_require__(13);
	  var isArray = __webpack_require__(17);
	  var map = __webpack_require__(18);

	  var usage = 'Usage: algoliasearch(applicationID, apiKey, opts)';

	  if (opts._allowEmptyCredentials !== true && !applicationID) {
	    throw new errors.AlgoliaSearchError('Please provide an application ID. ' + usage);
	  }

	  if (opts._allowEmptyCredentials !== true && !apiKey) {
	    throw new errors.AlgoliaSearchError('Please provide an API key. ' + usage);
	  }

	  this.applicationID = applicationID;
	  this.apiKey = apiKey;

	  var defaultHosts = shuffle([
	    this.applicationID + '-1.algolianet.com',
	    this.applicationID + '-2.algolianet.com',
	    this.applicationID + '-3.algolianet.com'
	  ]);
	  this.hosts = {
	    read: [],
	    write: []
	  };

	  this.hostIndex = {
	    read: 0,
	    write: 0
	  };

	  opts = opts || {};

	  var protocol = opts.protocol || 'https:';
	  var timeout = opts.timeout === undefined ? 2000 : opts.timeout;

	  // while we advocate for colon-at-the-end values: 'http:' for `opts.protocol`
	  // we also accept `http` and `https`. It's a common error.
	  if (!/:$/.test(protocol)) {
	    protocol = protocol + ':';
	  }

	  if (opts.protocol !== 'http:' && opts.protocol !== 'https:') {
	    throw new errors.AlgoliaSearchError('protocol must be `http:` or `https:` (was `' + opts.protocol + '`)');
	  }

	  // no hosts given, add defaults
	  if (!opts.hosts) {
	    this.hosts.read = [this.applicationID + '-dsn.algolia.net'].concat(defaultHosts);
	    this.hosts.write = [this.applicationID + '.algolia.net'].concat(defaultHosts);
	  } else if (isArray(opts.hosts)) {
	    this.hosts.read = clone(opts.hosts);
	    this.hosts.write = clone(opts.hosts);
	  } else {
	    this.hosts.read = clone(opts.hosts.read);
	    this.hosts.write = clone(opts.hosts.write);
	  }

	  // add protocol and lowercase hosts
	  this.hosts.read = map(this.hosts.read, prepareHost(protocol));
	  this.hosts.write = map(this.hosts.write, prepareHost(protocol));
	  this.requestTimeout = timeout;

	  this.extraHeaders = [];

	  // In some situations you might want to warm the cache
	  this.cache = opts._cache || {};

	  this._ua = opts._ua;
	  this._useCache = opts._useCache === undefined || opts._cache ? true : opts._useCache;
	  this._useFallback = opts.useFallback === undefined ? true : opts.useFallback;

	  this._setTimeout = opts._setTimeout;

	  debug('init done, %j', this);
	}

	/*
	 * Get the index object initialized
	 *
	 * @param indexName the name of index
	 * @param callback the result callback with one argument (the Index instance)
	 */
	AlgoliaSearchCore.prototype.initIndex = function(indexName) {
	  return new IndexCore(this, indexName);
	};

	/**
	* Add an extra field to the HTTP request
	*
	* @param name the header field name
	* @param value the header field value
	*/
	AlgoliaSearchCore.prototype.setExtraHeader = function(name, value) {
	  this.extraHeaders.push({
	    name: name.toLowerCase(), value: value
	  });
	};

	/**
	* Augment sent x-algolia-agent with more data, each agent part
	* is automatically separated from the others by a semicolon;
	*
	* @param algoliaAgent the agent to add
	*/
	AlgoliaSearchCore.prototype.addAlgoliaAgent = function(algoliaAgent) {
	  this._ua += ';' + algoliaAgent;
	};

	/*
	 * Wrapper that try all hosts to maximize the quality of service
	 */
	AlgoliaSearchCore.prototype._jsonRequest = function(initialOpts) {
	  var requestDebug = __webpack_require__(23)('algoliasearch:' + initialOpts.url);

	  var body;
	  var cache = initialOpts.cache;
	  var client = this;
	  var tries = 0;
	  var usingFallback = false;
	  var hasFallback = client._useFallback && client._request.fallback && initialOpts.fallback;
	  var headers;

	  if (
	    this.apiKey.length > MAX_API_KEY_LENGTH &&
	    initialOpts.body !== undefined &&
	    (initialOpts.body.params !== undefined || // index.search()
	    initialOpts.body.requests !== undefined) // client.search()
	  ) {
	    initialOpts.body.apiKey = this.apiKey;
	    headers = this._computeRequestHeaders(false);
	  } else {
	    headers = this._computeRequestHeaders();
	  }

	  if (initialOpts.body !== undefined) {
	    body = safeJSONStringify(initialOpts.body);
	  }

	  requestDebug('request start');
	  var debugData = [];

	  function doRequest(requester, reqOpts) {
	    var startTime = new Date();
	    var cacheID;

	    if (client._useCache) {
	      cacheID = initialOpts.url;
	    }

	    // as we sometime use POST requests to pass parameters (like query='aa'),
	    // the cacheID must also include the body to be different between calls
	    if (client._useCache && body) {
	      cacheID += '_body_' + reqOpts.body;
	    }

	    // handle cache existence
	    if (client._useCache && cache && cache[cacheID] !== undefined) {
	      requestDebug('serving response from cache');
	      return client._promise.resolve(JSON.parse(cache[cacheID]));
	    }

	    // if we reached max tries
	    if (tries >= client.hosts[initialOpts.hostType].length) {
	      if (!hasFallback || usingFallback) {
	        requestDebug('could not get any response');
	        // then stop
	        return client._promise.reject(new errors.AlgoliaSearchError(
	          'Cannot connect to the AlgoliaSearch API.' +
	          ' Send an email to support@algolia.com to report and resolve the issue.' +
	          ' Application id was: ' + client.applicationID, {debugData: debugData}
	        ));
	      }

	      requestDebug('switching to fallback');

	      // let's try the fallback starting from here
	      tries = 0;

	      // method, url and body are fallback dependent
	      reqOpts.method = initialOpts.fallback.method;
	      reqOpts.url = initialOpts.fallback.url;
	      reqOpts.jsonBody = initialOpts.fallback.body;
	      if (reqOpts.jsonBody) {
	        reqOpts.body = safeJSONStringify(reqOpts.jsonBody);
	      }
	      // re-compute headers, they could be omitting the API KEY
	      headers = client._computeRequestHeaders();

	      reqOpts.timeout = client.requestTimeout * (tries + 1);
	      client.hostIndex[initialOpts.hostType] = 0;
	      usingFallback = true; // the current request is now using fallback
	      return doRequest(client._request.fallback, reqOpts);
	    }

	    var currentHost = client.hosts[initialOpts.hostType][client.hostIndex[initialOpts.hostType]];

	    var url = currentHost + reqOpts.url;
	    var options = {
	      body: reqOpts.body,
	      jsonBody: reqOpts.jsonBody,
	      method: reqOpts.method,
	      headers: headers,
	      timeout: reqOpts.timeout,
	      debug: requestDebug
	    };

	    requestDebug('method: %s, url: %s, headers: %j, timeout: %d',
	      options.method, url, options.headers, options.timeout);

	    if (requester === client._request.fallback) {
	      requestDebug('using fallback');
	    }

	    // `requester` is any of this._request or this._request.fallback
	    // thus it needs to be called using the client as context
	    return requester.call(client, url, options).then(success, tryFallback);

	    function success(httpResponse) {
	      // compute the status of the response,
	      //
	      // When in browser mode, using XDR or JSONP, we have no statusCode available
	      // So we rely on our API response `status` property.
	      // But `waitTask` can set a `status` property which is not the statusCode (it's the task status)
	      // So we check if there's a `message` along `status` and it means it's an error
	      //
	      // That's the only case where we have a response.status that's not the http statusCode
	      var status = httpResponse && httpResponse.body && httpResponse.body.message && httpResponse.body.status ||

	        // this is important to check the request statusCode AFTER the body eventual
	        // statusCode because some implementations (jQuery XDomainRequest transport) may
	        // send statusCode 200 while we had an error
	        httpResponse.statusCode ||

	        // When in browser mode, using XDR or JSONP
	        // we default to success when no error (no response.status && response.message)
	        // If there was a JSON.parse() error then body is null and it fails
	        httpResponse && httpResponse.body && 200;

	      requestDebug('received response: statusCode: %s, computed statusCode: %d, headers: %j',
	        httpResponse.statusCode, status, httpResponse.headers);

	      var httpResponseOk = Math.floor(status / 100) === 2;

	      var endTime = new Date();
	      debugData.push({
	        currentHost: currentHost,
	        headers: removeCredentials(headers),
	        content: body || null,
	        contentLength: body !== undefined ? body.length : null,
	        method: reqOpts.method,
	        timeout: reqOpts.timeout,
	        url: reqOpts.url,
	        startTime: startTime,
	        endTime: endTime,
	        duration: endTime - startTime,
	        statusCode: status
	      });

	      if (httpResponseOk) {
	        if (client._useCache && cache) {
	          cache[cacheID] = httpResponse.responseText;
	        }

	        return httpResponse.body;
	      }

	      var shouldRetry = Math.floor(status / 100) !== 4;

	      if (shouldRetry) {
	        tries += 1;
	        return retryRequest();
	      }

	      requestDebug('unrecoverable error');

	      // no success and no retry => fail
	      var unrecoverableError = new errors.AlgoliaSearchError(
	        httpResponse.body && httpResponse.body.message, {debugData: debugData, statusCode: status}
	      );

	      return client._promise.reject(unrecoverableError);
	    }

	    function tryFallback(err) {
	      // error cases:
	      //  While not in fallback mode:
	      //    - CORS not supported
	      //    - network error
	      //  While in fallback mode:
	      //    - timeout
	      //    - network error
	      //    - badly formatted JSONP (script loaded, did not call our callback)
	      //  In both cases:
	      //    - uncaught exception occurs (TypeError)
	      requestDebug('error: %s, stack: %s', err.message, err.stack);

	      var endTime = new Date();
	      debugData.push({
	        currentHost: currentHost,
	        headers: removeCredentials(headers),
	        content: body || null,
	        contentLength: body !== undefined ? body.length : null,
	        method: reqOpts.method,
	        timeout: reqOpts.timeout,
	        url: reqOpts.url,
	        startTime: startTime,
	        endTime: endTime,
	        duration: endTime - startTime
	      });

	      if (!(err instanceof errors.AlgoliaSearchError)) {
	        err = new errors.Unknown(err && err.message, err);
	      }

	      tries += 1;

	      // stop the request implementation when:
	      if (
	        // we did not generate this error,
	        // it comes from a throw in some other piece of code
	        err instanceof errors.Unknown ||

	        // server sent unparsable JSON
	        err instanceof errors.UnparsableJSON ||

	        // max tries and already using fallback or no fallback
	        tries >= client.hosts[initialOpts.hostType].length &&
	        (usingFallback || !hasFallback)) {
	        // stop request implementation for this command
	        err.debugData = debugData;
	        return client._promise.reject(err);
	      }

	      // When a timeout occured, retry by raising timeout
	      if (err instanceof errors.RequestTimeout) {
	        return retryRequestWithHigherTimeout();
	      }

	      return retryRequest();
	    }

	    function retryRequest() {
	      requestDebug('retrying request');
	      client.hostIndex[initialOpts.hostType] = (client.hostIndex[initialOpts.hostType] + 1) % client.hosts[initialOpts.hostType].length;
	      return doRequest(requester, reqOpts);
	    }

	    function retryRequestWithHigherTimeout() {
	      requestDebug('retrying request with higher timeout');
	      client.hostIndex[initialOpts.hostType] = (client.hostIndex[initialOpts.hostType] + 1) % client.hosts[initialOpts.hostType].length;
	      reqOpts.timeout = client.requestTimeout * (tries + 1);
	      return doRequest(requester, reqOpts);
	    }
	  }

	  var promise = doRequest(
	    client._request, {
	      url: initialOpts.url,
	      method: initialOpts.method,
	      body: body,
	      jsonBody: initialOpts.body,
	      timeout: client.requestTimeout * (tries + 1)
	    }
	  );

	  // either we have a callback
	  // either we are using promises
	  if (initialOpts.callback) {
	    promise.then(function okCb(content) {
	      exitPromise(function() {
	        initialOpts.callback(null, content);
	      }, client._setTimeout || setTimeout);
	    }, function nookCb(err) {
	      exitPromise(function() {
	        initialOpts.callback(err);
	      }, client._setTimeout || setTimeout);
	    });
	  } else {
	    return promise;
	  }
	};

	/*
	* Transform search param object in query string
	*/
	AlgoliaSearchCore.prototype._getSearchParams = function(args, params) {
	  if (args === undefined || args === null) {
	    return params;
	  }
	  for (var key in args) {
	    if (key !== null && args[key] !== undefined && args.hasOwnProperty(key)) {
	      params += params === '' ? '' : '&';
	      params += key + '=' + encodeURIComponent(Object.prototype.toString.call(args[key]) === '[object Array]' ? safeJSONStringify(args[key]) : args[key]);
	    }
	  }
	  return params;
	};

	AlgoliaSearchCore.prototype._computeRequestHeaders = function(withAPIKey) {
	  var forEach = __webpack_require__(9);

	  var requestHeaders = {
	    'x-algolia-agent': this._ua,
	    'x-algolia-application-id': this.applicationID
	  };

	  // browser will inline headers in the url, node.js will use http headers
	  // but in some situations, the API KEY will be too long (big secured API keys)
	  // so if the request is a POST and the KEY is very long, we will be asked to not put
	  // it into headers but in the JSON body
	  if (withAPIKey !== false) {
	    requestHeaders['x-algolia-api-key'] = this.apiKey;
	  }

	  if (this.userToken) {
	    requestHeaders['x-algolia-usertoken'] = this.userToken;
	  }

	  if (this.securityTags) {
	    requestHeaders['x-algolia-tagfilters'] = this.securityTags;
	  }

	  if (this.extraHeaders) {
	    forEach(this.extraHeaders, function addToRequestHeaders(header) {
	      requestHeaders[header.name] = header.value;
	    });
	  }

	  return requestHeaders;
	};

	/**
	 * Search through multiple indices at the same time
	 * @param  {Object[]}   queries  An array of queries you want to run.
	 * @param {string} queries[].indexName The index name you want to target
	 * @param {string} [queries[].query] The query to issue on this index. Can also be passed into `params`
	 * @param {Object} queries[].params Any search param like hitsPerPage, ..
	 * @param  {Function} callback Callback to be called
	 * @return {Promise|undefined} Returns a promise if no callback given
	 */
	AlgoliaSearchCore.prototype.search = function(queries, opts, callback) {
	  var isArray = __webpack_require__(17);
	  var map = __webpack_require__(18);

	  var usage = 'Usage: client.search(arrayOfQueries[, callback])';

	  if (!isArray(queries)) {
	    throw new Error(usage);
	  }

	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  } else if (opts === undefined) {
	    opts = {};
	  }

	  var client = this;

	  var postObj = {
	    requests: map(queries, function prepareRequest(query) {
	      var params = '';

	      // allow query.query
	      // so we are mimicing the index.search(query, params) method
	      // {indexName:, query:, params:}
	      if (query.query !== undefined) {
	        params += 'query=' + encodeURIComponent(query.query);
	      }

	      return {
	        indexName: query.indexName,
	        params: client._getSearchParams(query.params, params)
	      };
	    })
	  };

	  var JSONPParams = map(postObj.requests, function prepareJSONPParams(request, requestId) {
	    return requestId + '=' +
	      encodeURIComponent(
	        '/1/indexes/' + encodeURIComponent(request.indexName) + '?' +
	        request.params
	      );
	  }).join('&');

	  var url = '/1/indexes/*/queries';

	  if (opts.strategy !== undefined) {
	    url += '?strategy=' + opts.strategy;
	  }

	  return this._jsonRequest({
	    cache: this.cache,
	    method: 'POST',
	    url: url,
	    body: postObj,
	    hostType: 'read',
	    fallback: {
	      method: 'GET',
	      url: '/1/indexes/*',
	      body: {
	        params: JSONPParams
	      }
	    },
	    callback: callback
	  });
	};

	/**
	 * Set the extra security tagFilters header
	 * @param {string|array} tags The list of tags defining the current security filters
	 */
	AlgoliaSearchCore.prototype.setSecurityTags = function(tags) {
	  if (Object.prototype.toString.call(tags) === '[object Array]') {
	    var strTags = [];
	    for (var i = 0; i < tags.length; ++i) {
	      if (Object.prototype.toString.call(tags[i]) === '[object Array]') {
	        var oredTags = [];
	        for (var j = 0; j < tags[i].length; ++j) {
	          oredTags.push(tags[i][j]);
	        }
	        strTags.push('(' + oredTags.join(',') + ')');
	      } else {
	        strTags.push(tags[i]);
	      }
	    }
	    tags = strTags.join(',');
	  }

	  this.securityTags = tags;
	};

	/**
	 * Set the extra user token header
	 * @param {string} userToken The token identifying a uniq user (used to apply rate limits)
	 */
	AlgoliaSearchCore.prototype.setUserToken = function(userToken) {
	  this.userToken = userToken;
	};

	/**
	 * Clear all queries in client's cache
	 * @return undefined
	 */
	AlgoliaSearchCore.prototype.clearCache = function() {
	  this.cache = {};
	};

	/**
	* Set the number of milliseconds a request can take before automatically being terminated.
	*
	* @param {Number} milliseconds
	*/
	AlgoliaSearchCore.prototype.setRequestTimeout = function(milliseconds) {
	  if (milliseconds) {
	    this.requestTimeout = parseInt(milliseconds, 10);
	  }
	};

	function prepareHost(protocol) {
	  return function prepare(host) {
	    return protocol + '//' + host.toLowerCase();
	  };
	}

	// Prototype.js < 1.7, a widely used library, defines a weird
	// Array.prototype.toJSON function that will fail to stringify our content
	// appropriately
	// refs:
	//   - https://groups.google.com/forum/#!topic/prototype-core/E-SAVvV_V9Q
	//   - https://github.com/sstephenson/prototype/commit/038a2985a70593c1a86c230fadbdfe2e4898a48c
	//   - http://stackoverflow.com/a/3148441/147079
	function safeJSONStringify(obj) {
	  /* eslint no-extend-native:0 */

	  if (Array.prototype.toJSON === undefined) {
	    return JSON.stringify(obj);
	  }

	  var toJSON = Array.prototype.toJSON;
	  delete Array.prototype.toJSON;
	  var out = JSON.stringify(obj);
	  Array.prototype.toJSON = toJSON;

	  return out;
	}

	function shuffle(array) {
	  var currentIndex = array.length;
	  var temporaryValue;
	  var randomIndex;

	  // While there remain elements to shuffle...
	  while (currentIndex !== 0) {
	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
	}

	function removeCredentials(headers) {
	  var newHeaders = {};

	  for (var headerName in headers) {
	    if (Object.prototype.hasOwnProperty.call(headers, headerName)) {
	      var value;

	      if (headerName === 'x-algolia-api-key' || headerName === 'x-algolia-application-id') {
	        value = '**hidden for security purposes**';
	      } else {
	        value = headers[headerName];
	      }

	      newHeaders[headerName] = value;
	    }
	  }

	  return newHeaders;
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(25);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	  return (typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  try {
	    return JSON.stringify(v);
	  } catch (err) {
	    return '[UnexpectedJSONParseError]: ' + err.message;
	  }
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    return exports.storage.debug;
	  } catch(e) {}

	  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	  if (typeof process !== 'undefined' && 'env' in process) {
	    return process.env.DEBUG;
	  }
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)))

/***/ },
/* 24 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug.debug = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(26);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    // apply env-specific formatting
	    args = exports.formatArgs.apply(self, args);

	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/[\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 26 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000
	var m = s * 60
	var h = m * 60
	var d = h * 24
	var y = d * 365.25

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function (val, options) {
	  options = options || {}
	  var type = typeof val
	  if (type === 'string' && val.length > 0) {
	    return parse(val)
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ?
				fmtLong(val) :
				fmtShort(val)
	  }
	  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
	}

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str)
	  if (str.length > 10000) {
	    return
	  }
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
	  if (!match) {
	    return
	  }
	  var n = parseFloat(match[1])
	  var type = (match[2] || 'ms').toLowerCase()
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n
	    default:
	      return undefined
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  if (ms >= d) {
	    return Math.round(ms / d) + 'd'
	  }
	  if (ms >= h) {
	    return Math.round(ms / h) + 'h'
	  }
	  if (ms >= m) {
	    return Math.round(ms / m) + 'm'
	  }
	  if (ms >= s) {
	    return Math.round(ms / s) + 's'
	  }
	  return ms + 'ms'
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  return plural(ms, d, 'day') ||
	    plural(ms, h, 'hour') ||
	    plural(ms, m, 'minute') ||
	    plural(ms, s, 'second') ||
	    ms + ' ms'
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) {
	    return
	  }
	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name
	  }
	  return Math.ceil(ms / n) + ' ' + name + 's'
	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var global = __webpack_require__(28);
	var Promise = global.Promise || __webpack_require__(29).Promise;

	// This is the standalone browser build entry point
	// Browser implementation of the Algolia Search JavaScript client,
	// using XMLHttpRequest, XDomainRequest and JSONP as fallback
	module.exports = function createAlgoliasearch(AlgoliaSearch, uaSuffix) {
	  var inherits = __webpack_require__(5);
	  var errors = __webpack_require__(8);
	  var inlineHeaders = __webpack_require__(31);
	  var jsonpRequest = __webpack_require__(33);
	  var places = __webpack_require__(34);
	  uaSuffix = uaSuffix || '';

	  if (process.env.NODE_ENV === 'debug') {
	    __webpack_require__(23).enable('algoliasearch*');
	  }

	  function algoliasearch(applicationID, apiKey, opts) {
	    var cloneDeep = __webpack_require__(13);

	    var getDocumentProtocol = __webpack_require__(35);

	    opts = cloneDeep(opts || {});

	    if (opts.protocol === undefined) {
	      opts.protocol = getDocumentProtocol();
	    }

	    opts._ua = opts._ua || algoliasearch.ua;

	    return new AlgoliaSearchBrowser(applicationID, apiKey, opts);
	  }

	  algoliasearch.version = __webpack_require__(36);
	  algoliasearch.ua = 'Algolia for vanilla JavaScript ' + uaSuffix + algoliasearch.version;
	  algoliasearch.initPlaces = places(algoliasearch);

	  // we expose into window no matter how we are used, this will allow
	  // us to easily debug any website running algolia
	  global.__algolia = {
	    debug: __webpack_require__(23),
	    algoliasearch: algoliasearch
	  };

	  var support = {
	    hasXMLHttpRequest: 'XMLHttpRequest' in global,
	    hasXDomainRequest: 'XDomainRequest' in global
	  };

	  if (support.hasXMLHttpRequest) {
	    support.cors = 'withCredentials' in new XMLHttpRequest();
	    support.timeout = 'timeout' in new XMLHttpRequest();
	  }

	  function AlgoliaSearchBrowser() {
	    // call AlgoliaSearch constructor
	    AlgoliaSearch.apply(this, arguments);
	  }

	  inherits(AlgoliaSearchBrowser, AlgoliaSearch);

	  AlgoliaSearchBrowser.prototype._request = function request(url, opts) {
	    return new Promise(function wrapRequest(resolve, reject) {
	      // no cors or XDomainRequest, no request
	      if (!support.cors && !support.hasXDomainRequest) {
	        // very old browser, not supported
	        reject(new errors.Network('CORS not supported'));
	        return;
	      }

	      url = inlineHeaders(url, opts.headers);

	      var body = opts.body;
	      var req = support.cors ? new XMLHttpRequest() : new XDomainRequest();
	      var ontimeout;
	      var timedOut;

	      // do not rely on default XHR async flag, as some analytics code like hotjar
	      // breaks it and set it to false by default
	      if (req instanceof XMLHttpRequest) {
	        req.open(opts.method, url, true);
	      } else {
	        req.open(opts.method, url);
	      }

	      if (support.cors) {
	        if (body) {
	          if (opts.method === 'POST') {
	            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests
	            req.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
	          } else {
	            req.setRequestHeader('content-type', 'application/json');
	          }
	        }
	        req.setRequestHeader('accept', 'application/json');
	      }

	      // we set an empty onprogress listener
	      // so that XDomainRequest on IE9 is not aborted
	      // refs:
	      //  - https://github.com/algolia/algoliasearch-client-js/issues/76
	      //  - https://social.msdn.microsoft.com/Forums/ie/en-US/30ef3add-767c-4436-b8a9-f1ca19b4812e/ie9-rtm-xdomainrequest-issued-requests-may-abort-if-all-event-handlers-not-specified?forum=iewebdevelopment
	      req.onprogress = function noop() {};

	      req.onload = load;
	      req.onerror = error;

	      if (support.timeout) {
	        // .timeout supported by both XHR and XDR,
	        // we do receive timeout event, tested
	        req.timeout = opts.timeout;

	        req.ontimeout = timeout;
	      } else {
	        ontimeout = setTimeout(timeout, opts.timeout);
	      }

	      req.send(body);

	      // event object not received in IE8, at least
	      // but we do not use it, still important to note
	      function load(/* event */) {
	        // When browser does not supports req.timeout, we can
	        // have both a load and timeout event, since handled by a dumb setTimeout
	        if (timedOut) {
	          return;
	        }

	        if (!support.timeout) {
	          clearTimeout(ontimeout);
	        }

	        var out;

	        try {
	          out = {
	            body: JSON.parse(req.responseText),
	            responseText: req.responseText,
	            statusCode: req.status,
	            // XDomainRequest does not have any response headers
	            headers: req.getAllResponseHeaders && req.getAllResponseHeaders() || {}
	          };
	        } catch (e) {
	          out = new errors.UnparsableJSON({
	            more: req.responseText
	          });
	        }

	        if (out instanceof errors.UnparsableJSON) {
	          reject(out);
	        } else {
	          resolve(out);
	        }
	      }

	      function error(event) {
	        if (timedOut) {
	          return;
	        }

	        if (!support.timeout) {
	          clearTimeout(ontimeout);
	        }

	        // error event is trigerred both with XDR/XHR on:
	        //   - DNS error
	        //   - unallowed cross domain request
	        reject(
	          new errors.Network({
	            more: event
	          })
	        );
	      }

	      function timeout() {
	        if (!support.timeout) {
	          timedOut = true;
	          req.abort();
	        }

	        reject(new errors.RequestTimeout());
	      }
	    });
	  };

	  AlgoliaSearchBrowser.prototype._request.fallback = function requestFallback(url, opts) {
	    url = inlineHeaders(url, opts.headers);

	    return new Promise(function wrapJsonpRequest(resolve, reject) {
	      jsonpRequest(url, opts, function jsonpRequestDone(err, content) {
	        if (err) {
	          reject(err);
	          return;
	        }

	        resolve(content);
	      });
	    });
	  };

	  AlgoliaSearchBrowser.prototype._promise = {
	    reject: function rejectPromise(val) {
	      return Promise.reject(val);
	    },
	    resolve: function resolvePromise(val) {
	      return Promise.resolve(val);
	    },
	    delay: function delayPromise(ms) {
	      return new Promise(function resolveOnTimeout(resolve/* , reject*/) {
	        setTimeout(resolve, ms);
	      });
	    }
	  };

	  return algoliasearch;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)))

/***/ },
/* 28 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {if (typeof window !== "undefined") {
	    module.exports = window;
	} else if (typeof global !== "undefined") {
	    module.exports = global;
	} else if (typeof self !== "undefined"){
	    module.exports = self;
	} else {
	    module.exports = {};
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var require;/* WEBPACK VAR INJECTION */(function(process, global) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   3.3.1
	 */

	(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    (global.ES6Promise = factory());
	}(this, (function () { 'use strict';

	function objectOrFunction(x) {
	  return typeof x === 'function' || typeof x === 'object' && x !== null;
	}

	function isFunction(x) {
	  return typeof x === 'function';
	}

	var _isArray = undefined;
	if (!Array.isArray) {
	  _isArray = function (x) {
	    return Object.prototype.toString.call(x) === '[object Array]';
	  };
	} else {
	  _isArray = Array.isArray;
	}

	var isArray = _isArray;

	var len = 0;
	var vertxNext = undefined;
	var customSchedulerFn = undefined;

	var asap = function asap(callback, arg) {
	  queue[len] = callback;
	  queue[len + 1] = arg;
	  len += 2;
	  if (len === 2) {
	    // If len is 2, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    if (customSchedulerFn) {
	      customSchedulerFn(flush);
	    } else {
	      scheduleFlush();
	    }
	  }
	};

	function setScheduler(scheduleFn) {
	  customSchedulerFn = scheduleFn;
	}

	function setAsap(asapFn) {
	  asap = asapFn;
	}

	var browserWindow = typeof window !== 'undefined' ? window : undefined;
	var browserGlobal = browserWindow || {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

	// test for web worker but not in IE10
	var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

	// node
	function useNextTick() {
	  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	  // see https://github.com/cujojs/when/issues/410 for details
	  return function () {
	    return process.nextTick(flush);
	  };
	}

	// vertx
	function useVertxTimer() {
	  return function () {
	    vertxNext(flush);
	  };
	}

	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });

	  return function () {
	    node.data = iterations = ++iterations % 2;
	  };
	}

	// web worker
	function useMessageChannel() {
	  var channel = new MessageChannel();
	  channel.port1.onmessage = flush;
	  return function () {
	    return channel.port2.postMessage(0);
	  };
	}

	function useSetTimeout() {
	  // Store setTimeout reference so es6-promise will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var globalSetTimeout = setTimeout;
	  return function () {
	    return globalSetTimeout(flush, 1);
	  };
	}

	var queue = new Array(1000);
	function flush() {
	  for (var i = 0; i < len; i += 2) {
	    var callback = queue[i];
	    var arg = queue[i + 1];

	    callback(arg);

	    queue[i] = undefined;
	    queue[i + 1] = undefined;
	  }

	  len = 0;
	}

	function attemptVertx() {
	  try {
	    var r = require;
	    var vertx = __webpack_require__(30);
	    vertxNext = vertx.runOnLoop || vertx.runOnContext;
	    return useVertxTimer();
	  } catch (e) {
	    return useSetTimeout();
	  }
	}

	var scheduleFlush = undefined;
	// Decide what async method to use to triggering processing of queued callbacks:
	if (isNode) {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else if (isWorker) {
	  scheduleFlush = useMessageChannel();
	} else if (browserWindow === undefined && "function" === 'function') {
	  scheduleFlush = attemptVertx();
	} else {
	  scheduleFlush = useSetTimeout();
	}

	function then(onFulfillment, onRejection) {
	  var _arguments = arguments;

	  var parent = this;

	  var child = new this.constructor(noop);

	  if (child[PROMISE_ID] === undefined) {
	    makePromise(child);
	  }

	  var _state = parent._state;

	  if (_state) {
	    (function () {
	      var callback = _arguments[_state - 1];
	      asap(function () {
	        return invokeCallback(_state, child, callback, parent._result);
	      });
	    })();
	  } else {
	    subscribe(parent, child, onFulfillment, onRejection);
	  }

	  return child;
	}

	/**
	  `Promise.resolve` returns a promise that will become resolved with the
	  passed `value`. It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    resolve(1);
	  });

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.resolve(1);

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  @method resolve
	  @static
	  @param {Any} value value that the returned promise will be resolved with
	  Useful for tooling.
	  @return {Promise} a promise that will become fulfilled with the given
	  `value`
	*/
	function resolve(object) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (object && typeof object === 'object' && object.constructor === Constructor) {
	    return object;
	  }

	  var promise = new Constructor(noop);
	  _resolve(promise, object);
	  return promise;
	}

	var PROMISE_ID = Math.random().toString(36).substring(16);

	function noop() {}

	var PENDING = void 0;
	var FULFILLED = 1;
	var REJECTED = 2;

	var GET_THEN_ERROR = new ErrorObject();

	function selfFulfillment() {
	  return new TypeError("You cannot resolve a promise with itself");
	}

	function cannotReturnOwn() {
	  return new TypeError('A promises callback cannot return that same promise.');
	}

	function getThen(promise) {
	  try {
	    return promise.then;
	  } catch (error) {
	    GET_THEN_ERROR.error = error;
	    return GET_THEN_ERROR;
	  }
	}

	function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	  try {
	    then.call(value, fulfillmentHandler, rejectionHandler);
	  } catch (e) {
	    return e;
	  }
	}

	function handleForeignThenable(promise, thenable, then) {
	  asap(function (promise) {
	    var sealed = false;
	    var error = tryThen(then, thenable, function (value) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	      if (thenable !== value) {
	        _resolve(promise, value);
	      } else {
	        fulfill(promise, value);
	      }
	    }, function (reason) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;

	      _reject(promise, reason);
	    }, 'Settle: ' + (promise._label || ' unknown promise'));

	    if (!sealed && error) {
	      sealed = true;
	      _reject(promise, error);
	    }
	  }, promise);
	}

	function handleOwnThenable(promise, thenable) {
	  if (thenable._state === FULFILLED) {
	    fulfill(promise, thenable._result);
	  } else if (thenable._state === REJECTED) {
	    _reject(promise, thenable._result);
	  } else {
	    subscribe(thenable, undefined, function (value) {
	      return _resolve(promise, value);
	    }, function (reason) {
	      return _reject(promise, reason);
	    });
	  }
	}

	function handleMaybeThenable(promise, maybeThenable, then$$) {
	  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
	    handleOwnThenable(promise, maybeThenable);
	  } else {
	    if (then$$ === GET_THEN_ERROR) {
	      _reject(promise, GET_THEN_ERROR.error);
	    } else if (then$$ === undefined) {
	      fulfill(promise, maybeThenable);
	    } else if (isFunction(then$$)) {
	      handleForeignThenable(promise, maybeThenable, then$$);
	    } else {
	      fulfill(promise, maybeThenable);
	    }
	  }
	}

	function _resolve(promise, value) {
	  if (promise === value) {
	    _reject(promise, selfFulfillment());
	  } else if (objectOrFunction(value)) {
	    handleMaybeThenable(promise, value, getThen(value));
	  } else {
	    fulfill(promise, value);
	  }
	}

	function publishRejection(promise) {
	  if (promise._onerror) {
	    promise._onerror(promise._result);
	  }

	  publish(promise);
	}

	function fulfill(promise, value) {
	  if (promise._state !== PENDING) {
	    return;
	  }

	  promise._result = value;
	  promise._state = FULFILLED;

	  if (promise._subscribers.length !== 0) {
	    asap(publish, promise);
	  }
	}

	function _reject(promise, reason) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	  promise._state = REJECTED;
	  promise._result = reason;

	  asap(publishRejection, promise);
	}

	function subscribe(parent, child, onFulfillment, onRejection) {
	  var _subscribers = parent._subscribers;
	  var length = _subscribers.length;

	  parent._onerror = null;

	  _subscribers[length] = child;
	  _subscribers[length + FULFILLED] = onFulfillment;
	  _subscribers[length + REJECTED] = onRejection;

	  if (length === 0 && parent._state) {
	    asap(publish, parent);
	  }
	}

	function publish(promise) {
	  var subscribers = promise._subscribers;
	  var settled = promise._state;

	  if (subscribers.length === 0) {
	    return;
	  }

	  var child = undefined,
	      callback = undefined,
	      detail = promise._result;

	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];

	    if (child) {
	      invokeCallback(settled, child, callback, detail);
	    } else {
	      callback(detail);
	    }
	  }

	  promise._subscribers.length = 0;
	}

	function ErrorObject() {
	  this.error = null;
	}

	var TRY_CATCH_ERROR = new ErrorObject();

	function tryCatch(callback, detail) {
	  try {
	    return callback(detail);
	  } catch (e) {
	    TRY_CATCH_ERROR.error = e;
	    return TRY_CATCH_ERROR;
	  }
	}

	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value = undefined,
	      error = undefined,
	      succeeded = undefined,
	      failed = undefined;

	  if (hasCallback) {
	    value = tryCatch(callback, detail);

	    if (value === TRY_CATCH_ERROR) {
	      failed = true;
	      error = value.error;
	      value = null;
	    } else {
	      succeeded = true;
	    }

	    if (promise === value) {
	      _reject(promise, cannotReturnOwn());
	      return;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }

	  if (promise._state !== PENDING) {
	    // noop
	  } else if (hasCallback && succeeded) {
	      _resolve(promise, value);
	    } else if (failed) {
	      _reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      _reject(promise, value);
	    }
	}

	function initializePromise(promise, resolver) {
	  try {
	    resolver(function resolvePromise(value) {
	      _resolve(promise, value);
	    }, function rejectPromise(reason) {
	      _reject(promise, reason);
	    });
	  } catch (e) {
	    _reject(promise, e);
	  }
	}

	var id = 0;
	function nextId() {
	  return id++;
	}

	function makePromise(promise) {
	  promise[PROMISE_ID] = id++;
	  promise._state = undefined;
	  promise._result = undefined;
	  promise._subscribers = [];
	}

	function Enumerator(Constructor, input) {
	  this._instanceConstructor = Constructor;
	  this.promise = new Constructor(noop);

	  if (!this.promise[PROMISE_ID]) {
	    makePromise(this.promise);
	  }

	  if (isArray(input)) {
	    this._input = input;
	    this.length = input.length;
	    this._remaining = input.length;

	    this._result = new Array(this.length);

	    if (this.length === 0) {
	      fulfill(this.promise, this._result);
	    } else {
	      this.length = this.length || 0;
	      this._enumerate();
	      if (this._remaining === 0) {
	        fulfill(this.promise, this._result);
	      }
	    }
	  } else {
	    _reject(this.promise, validationError());
	  }
	}

	function validationError() {
	  return new Error('Array Methods must be provided an Array');
	};

	Enumerator.prototype._enumerate = function () {
	  var length = this.length;
	  var _input = this._input;

	  for (var i = 0; this._state === PENDING && i < length; i++) {
	    this._eachEntry(_input[i], i);
	  }
	};

	Enumerator.prototype._eachEntry = function (entry, i) {
	  var c = this._instanceConstructor;
	  var resolve$$ = c.resolve;

	  if (resolve$$ === resolve) {
	    var _then = getThen(entry);

	    if (_then === then && entry._state !== PENDING) {
	      this._settledAt(entry._state, i, entry._result);
	    } else if (typeof _then !== 'function') {
	      this._remaining--;
	      this._result[i] = entry;
	    } else if (c === Promise) {
	      var promise = new c(noop);
	      handleMaybeThenable(promise, entry, _then);
	      this._willSettleAt(promise, i);
	    } else {
	      this._willSettleAt(new c(function (resolve$$) {
	        return resolve$$(entry);
	      }), i);
	    }
	  } else {
	    this._willSettleAt(resolve$$(entry), i);
	  }
	};

	Enumerator.prototype._settledAt = function (state, i, value) {
	  var promise = this.promise;

	  if (promise._state === PENDING) {
	    this._remaining--;

	    if (state === REJECTED) {
	      _reject(promise, value);
	    } else {
	      this._result[i] = value;
	    }
	  }

	  if (this._remaining === 0) {
	    fulfill(promise, this._result);
	  }
	};

	Enumerator.prototype._willSettleAt = function (promise, i) {
	  var enumerator = this;

	  subscribe(promise, undefined, function (value) {
	    return enumerator._settledAt(FULFILLED, i, value);
	  }, function (reason) {
	    return enumerator._settledAt(REJECTED, i, reason);
	  });
	};

	/**
	  `Promise.all` accepts an array of promises, and returns a new promise which
	  is fulfilled with an array of fulfillment values for the passed promises, or
	  rejected with the reason of the first passed promise to be rejected. It casts all
	  elements of the passed iterable to promises as it runs this algorithm.

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = resolve(2);
	  let promise3 = resolve(3);
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```

	  If any of the `promises` given to `all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = reject(new Error("2"));
	  let promise3 = reject(new Error("3"));
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```

	  @method all
	  @static
	  @param {Array} entries array of promises
	  @param {String} label optional string for labeling the promise.
	  Useful for tooling.
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	  @static
	*/
	function all(entries) {
	  return new Enumerator(this, entries).promise;
	}

	/**
	  `Promise.race` returns a new promise which is settled in the same way as the
	  first passed promise to settle.

	  Example:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 2');
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // result === 'promise 2' because it was resolved before promise1
	    // was resolved.
	  });
	  ```

	  `Promise.race` is deterministic in that only the state of the first
	  settled promise matters. For example, even if other promises given to the
	  `promises` array argument are resolved, but the first settled promise has
	  become rejected before the other promises became fulfilled, the returned
	  promise will become rejected:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error('promise 2'));
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // Code here never runs
	  }, function(reason){
	    // reason.message === 'promise 2' because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```

	  An example real-world use case is implementing timeouts:

	  ```javascript
	  Promise.race([ajax('foo.json'), timeout(5000)])
	  ```

	  @method race
	  @static
	  @param {Array} promises array of promises to observe
	  Useful for tooling.
	  @return {Promise} a promise which settles in the same way as the first passed
	  promise to settle.
	*/
	function race(entries) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (!isArray(entries)) {
	    return new Constructor(function (_, reject) {
	      return reject(new TypeError('You must pass an array to race.'));
	    });
	  } else {
	    return new Constructor(function (resolve, reject) {
	      var length = entries.length;
	      for (var i = 0; i < length; i++) {
	        Constructor.resolve(entries[i]).then(resolve, reject);
	      }
	    });
	  }
	}

	/**
	  `Promise.reject` returns a promise rejected with the passed `reason`.
	  It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.reject(new Error('WHOOPS'));

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  @method reject
	  @static
	  @param {Any} reason value that the returned promise will be rejected with.
	  Useful for tooling.
	  @return {Promise} a promise rejected with the given `reason`.
	*/
	function reject(reason) {
	  /*jshint validthis:true */
	  var Constructor = this;
	  var promise = new Constructor(noop);
	  _reject(promise, reason);
	  return promise;
	}

	function needsResolver() {
	  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	}

	function needsNew() {
	  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	}

	/**
	  Promise objects represent the eventual result of an asynchronous operation. The
	  primary way of interacting with a promise is through its `then` method, which
	  registers callbacks to receive either a promise's eventual value or the reason
	  why the promise cannot be fulfilled.

	  Terminology
	  -----------

	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	  - `thenable` is an object or function that defines a `then` method.
	  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	  - `exception` is a value that is thrown using the throw statement.
	  - `reason` is a value that indicates why a promise was rejected.
	  - `settled` the final resting state of a promise, fulfilled or rejected.

	  A promise can be in one of three states: pending, fulfilled, or rejected.

	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	  state.  Promises that are rejected have a rejection reason and are in the
	  rejected state.  A fulfillment value is never a thenable.

	  Promises can also be said to *resolve* a value.  If this value is also a
	  promise, then the original promise's settled state will match the value's
	  settled state.  So a promise that *resolves* a promise that rejects will
	  itself reject, and a promise that *resolves* a promise that fulfills will
	  itself fulfill.


	  Basic Usage:
	  ------------

	  ```js
	  let promise = new Promise(function(resolve, reject) {
	    // on success
	    resolve(value);

	    // on failure
	    reject(reason);
	  });

	  promise.then(function(value) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Advanced Usage:
	  ---------------

	  Promises shine when abstracting away asynchronous interactions such as
	  `XMLHttpRequest`s.

	  ```js
	  function getJSON(url) {
	    return new Promise(function(resolve, reject){
	      let xhr = new XMLHttpRequest();

	      xhr.open('GET', url);
	      xhr.onreadystatechange = handler;
	      xhr.responseType = 'json';
	      xhr.setRequestHeader('Accept', 'application/json');
	      xhr.send();

	      function handler() {
	        if (this.readyState === this.DONE) {
	          if (this.status === 200) {
	            resolve(this.response);
	          } else {
	            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	          }
	        }
	      };
	    });
	  }

	  getJSON('/posts.json').then(function(json) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Unlike callbacks, promises are great composable primitives.

	  ```js
	  Promise.all([
	    getJSON('/posts'),
	    getJSON('/comments')
	  ]).then(function(values){
	    values[0] // => postsJSON
	    values[1] // => commentsJSON

	    return values;
	  });
	  ```

	  @class Promise
	  @param {function} resolver
	  Useful for tooling.
	  @constructor
	*/
	function Promise(resolver) {
	  this[PROMISE_ID] = nextId();
	  this._result = this._state = undefined;
	  this._subscribers = [];

	  if (noop !== resolver) {
	    typeof resolver !== 'function' && needsResolver();
	    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	  }
	}

	Promise.all = all;
	Promise.race = race;
	Promise.resolve = resolve;
	Promise.reject = reject;
	Promise._setScheduler = setScheduler;
	Promise._setAsap = setAsap;
	Promise._asap = asap;

	Promise.prototype = {
	  constructor: Promise,

	  /**
	    The primary way of interacting with a promise is through its `then` method,
	    which registers callbacks to receive either a promise's eventual value or the
	    reason why the promise cannot be fulfilled.
	  
	    ```js
	    findUser().then(function(user){
	      // user is available
	    }, function(reason){
	      // user is unavailable, and you are given the reason why
	    });
	    ```
	  
	    Chaining
	    --------
	  
	    The return value of `then` is itself a promise.  This second, 'downstream'
	    promise is resolved with the return value of the first promise's fulfillment
	    or rejection handler, or rejected if the handler throws an exception.
	  
	    ```js
	    findUser().then(function (user) {
	      return user.name;
	    }, function (reason) {
	      return 'default name';
	    }).then(function (userName) {
	      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	      // will be `'default name'`
	    });
	  
	    findUser().then(function (user) {
	      throw new Error('Found user, but still unhappy');
	    }, function (reason) {
	      throw new Error('`findUser` rejected and we're unhappy');
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	    });
	    ```
	    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	  
	    ```js
	    findUser().then(function (user) {
	      throw new PedagogicalException('Upstream error');
	    }).then(function (value) {
	      // never reached
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // The `PedgagocialException` is propagated all the way down to here
	    });
	    ```
	  
	    Assimilation
	    ------------
	  
	    Sometimes the value you want to propagate to a downstream promise can only be
	    retrieved asynchronously. This can be achieved by returning a promise in the
	    fulfillment or rejection handler. The downstream promise will then be pending
	    until the returned promise is settled. This is called *assimilation*.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // The user's comments are now available
	    });
	    ```
	  
	    If the assimliated promise rejects, then the downstream promise will also reject.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // If `findCommentsByAuthor` fulfills, we'll have the value here
	    }, function (reason) {
	      // If `findCommentsByAuthor` rejects, we'll have the reason here
	    });
	    ```
	  
	    Simple Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let result;
	  
	    try {
	      result = findResult();
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	    findResult(function(result, err){
	      if (err) {
	        // failure
	      } else {
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findResult().then(function(result){
	      // success
	    }, function(reason){
	      // failure
	    });
	    ```
	  
	    Advanced Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let author, books;
	  
	    try {
	      author = findAuthor();
	      books  = findBooksByAuthor(author);
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	  
	    function foundBooks(books) {
	  
	    }
	  
	    function failure(reason) {
	  
	    }
	  
	    findAuthor(function(author, err){
	      if (err) {
	        failure(err);
	        // failure
	      } else {
	        try {
	          findBoooksByAuthor(author, function(books, err) {
	            if (err) {
	              failure(err);
	            } else {
	              try {
	                foundBooks(books);
	              } catch(reason) {
	                failure(reason);
	              }
	            }
	          });
	        } catch(error) {
	          failure(err);
	        }
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findAuthor().
	      then(findBooksByAuthor).
	      then(function(books){
	        // found books
	    }).catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method then
	    @param {Function} onFulfilled
	    @param {Function} onRejected
	    Useful for tooling.
	    @return {Promise}
	  */
	  then: then,

	  /**
	    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	    as the catch block of a try/catch statement.
	  
	    ```js
	    function findAuthor(){
	      throw new Error('couldn't find that author');
	    }
	  
	    // synchronous
	    try {
	      findAuthor();
	    } catch(reason) {
	      // something went wrong
	    }
	  
	    // async with promises
	    findAuthor().catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method catch
	    @param {Function} onRejection
	    Useful for tooling.
	    @return {Promise}
	  */
	  'catch': function _catch(onRejection) {
	    return this.then(null, onRejection);
	  }
	};

	function polyfill() {
	    var local = undefined;

	    if (typeof global !== 'undefined') {
	        local = global;
	    } else if (typeof self !== 'undefined') {
	        local = self;
	    } else {
	        try {
	            local = Function('return this')();
	        } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	        }
	    }

	    var P = local.Promise;

	    if (P) {
	        var promiseToString = null;
	        try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	        } catch (e) {
	            // silently ignored
	        }

	        if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	        }
	    }

	    local.Promise = Promise;
	}

	polyfill();
	// Strange compat..
	Promise.polyfill = polyfill;
	Promise.Promise = Promise;

	return Promise;

	})));
	//# sourceMappingURL=es6-promise.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24), (function() { return this; }())))

/***/ },
/* 30 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = inlineHeaders;

	var encode = __webpack_require__(32);

	function inlineHeaders(url, headers) {
	  if (/\?/.test(url)) {
	    url += '&';
	  } else {
	    url += '?';
	  }

	  return url + encode(headers);
	}


/***/ },
/* 32 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	};

	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return map(objectKeys(obj), function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (isArray(obj[k])) {
	        return map(obj[k], function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};

	var isArray = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};

	function map (xs, f) {
	  if (xs.map) return xs.map(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    res.push(f(xs[i], i));
	  }
	  return res;
	}

	var objectKeys = Object.keys || function (obj) {
	  var res = [];
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
	  }
	  return res;
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = jsonpRequest;

	var errors = __webpack_require__(8);

	var JSONPCounter = 0;

	function jsonpRequest(url, opts, cb) {
	  if (opts.method !== 'GET') {
	    cb(new Error('Method ' + opts.method + ' ' + url + ' is not supported by JSONP.'));
	    return;
	  }

	  opts.debug('JSONP: start');

	  var cbCalled = false;
	  var timedOut = false;

	  JSONPCounter += 1;
	  var head = document.getElementsByTagName('head')[0];
	  var script = document.createElement('script');
	  var cbName = 'algoliaJSONP_' + JSONPCounter;
	  var done = false;

	  window[cbName] = function(data) {
	    removeGlobals();

	    if (timedOut) {
	      opts.debug('JSONP: Late answer, ignoring');
	      return;
	    }

	    cbCalled = true;

	    clean();

	    cb(null, {
	      body: data/* ,
	      // We do not send the statusCode, there's no statusCode in JSONP, it will be
	      // computed using data.status && data.message like with XDR
	      statusCode*/
	    });
	  };

	  // add callback by hand
	  url += '&callback=' + cbName;

	  // add body params manually
	  if (opts.jsonBody && opts.jsonBody.params) {
	    url += '&' + opts.jsonBody.params;
	  }

	  var ontimeout = setTimeout(timeout, opts.timeout);

	  // script onreadystatechange needed only for
	  // <= IE8
	  // https://github.com/angular/angular.js/issues/4523
	  script.onreadystatechange = readystatechange;
	  script.onload = success;
	  script.onerror = error;

	  script.async = true;
	  script.defer = true;
	  script.src = url;
	  head.appendChild(script);

	  function success() {
	    opts.debug('JSONP: success');

	    if (done || timedOut) {
	      return;
	    }

	    done = true;

	    // script loaded but did not call the fn => script loading error
	    if (!cbCalled) {
	      opts.debug('JSONP: Fail. Script loaded but did not call the callback');
	      clean();
	      cb(new errors.JSONPScriptFail());
	    }
	  }

	  function readystatechange() {
	    if (this.readyState === 'loaded' || this.readyState === 'complete') {
	      success();
	    }
	  }

	  function clean() {
	    clearTimeout(ontimeout);
	    script.onload = null;
	    script.onreadystatechange = null;
	    script.onerror = null;
	    head.removeChild(script);
	  }

	  function removeGlobals() {
	    try {
	      delete window[cbName];
	      delete window[cbName + '_loaded'];
	    } catch (e) {
	      window[cbName] = window[cbName + '_loaded'] = undefined;
	    }
	  }

	  function timeout() {
	    opts.debug('JSONP: Script timeout');
	    timedOut = true;
	    clean();
	    cb(new errors.RequestTimeout());
	  }

	  function error() {
	    opts.debug('JSONP: Script error');

	    if (done || timedOut) {
	      return;
	    }

	    clean();
	    cb(new errors.JSONPScriptError());
	  }
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = createPlacesClient;

	var buildSearchMethod = __webpack_require__(7);

	function createPlacesClient(algoliasearch) {
	  return function places(appID, apiKey, opts) {
	    var cloneDeep = __webpack_require__(13);

	    opts = opts && cloneDeep(opts) || {};
	    opts.hosts = opts.hosts || [
	      'places-dsn.algolia.net',
	      'places-1.algolianet.com',
	      'places-2.algolianet.com',
	      'places-3.algolianet.com'
	    ];

	    // allow initPlaces() no arguments => community rate limited
	    if (arguments.length === 0 || typeof appID === 'object' || appID === undefined) {
	      appID = '';
	      apiKey = '';
	      opts._allowEmptyCredentials = true;
	    }

	    var client = algoliasearch(appID, apiKey, opts);
	    var index = client.initIndex('places');
	    index.search = buildSearchMethod('query', '/1/places/query');
	    return index;
	  };
	}


/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';

	module.exports = getDocumentProtocol;

	function getDocumentProtocol() {
	  var protocol = window.document.location.protocol;

	  // when in `file:` mode (local html file), default to `http:`
	  if (protocol !== 'http:' && protocol !== 'https:') {
	    protocol = 'http:';
	  }

	  return protocol;
	}


/***/ },
/* 36 */
/***/ function(module, exports) {

	'use strict';

	module.exports = '3.19.2';


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var AlgoliaSearchHelper = __webpack_require__(38);

	var SearchParameters = __webpack_require__(39);
	var SearchResults = __webpack_require__(262);

	/**
	 * The algoliasearchHelper module is the function that will let its
	 * contains everything needed to use the Algoliasearch
	 * Helper. It is a also a function that instanciate the helper.
	 * To use the helper, you also need the Algolia JS client v3.
	 * @example
	 * //using the UMD build
	 * var client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
	 * var helper = algoliasearchHelper(client, 'bestbuy', {
	 *   facets: ['shipping'],
	 *   disjunctiveFacets: ['category']
	 * });
	 * helper.on('result', function(result) {
	 *   console.log(result);
	 * });
	 * helper.toggleRefine('Movies & TV Shows')
	 *       .toggleRefine('Free shipping')
	 *       .search();
	 * @example
	 * // The helper is an event emitter using the node API
	 * helper.on('result', updateTheResults);
	 * helper.once('result', updateTheResults);
	 * helper.removeListener('result', updateTheResults);
	 * helper.removeAllListeners('result');
	 * @module algoliasearchHelper
	 * @param  {AlgoliaSearch} client an AlgoliaSearch client
	 * @param  {string} index the name of the index to query
	 * @param  {SearchParameters|object} opts an object defining the initial config of the search. It doesn't have to be a {SearchParameters}, just an object containing the properties you need from it.
	 * @return {AlgoliaSearchHelper}
	 */
	function algoliasearchHelper(client, index, opts) {
	  return new AlgoliaSearchHelper(client, index, opts);
	}

	/**
	 * The version currently used
	 * @member module:algoliasearchHelper.version
	 * @type {number}
	 */
	algoliasearchHelper.version = __webpack_require__(332);

	/**
	 * Constructor for the Helper.
	 * @member module:algoliasearchHelper.AlgoliaSearchHelper
	 * @type {AlgoliaSearchHelper}
	 */
	algoliasearchHelper.AlgoliaSearchHelper = AlgoliaSearchHelper;

	/**
	 * Constructor for the object containing all the parameters of the search.
	 * @member module:algoliasearchHelper.SearchParameters
	 * @type {SearchParameters}
	 */
	algoliasearchHelper.SearchParameters = SearchParameters;

	/**
	 * Constructor for the object containing the results of the search.
	 * @member module:algoliasearchHelper.SearchResults
	 * @type {SearchResults}
	 */
	algoliasearchHelper.SearchResults = SearchResults;

	/**
	 * URL tools to generate query string and parse them from/into
	 * SearchParameters
	 * @member module:algoliasearchHelper.url
	 * @type {object} {@link url}
	 *
	 */
	algoliasearchHelper.url = __webpack_require__(319);

	module.exports = algoliasearchHelper;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var SearchParameters = __webpack_require__(39);
	var SearchResults = __webpack_require__(262);
	var requestBuilder = __webpack_require__(314);

	var util = __webpack_require__(315);
	var events = __webpack_require__(21);

	var forEach = __webpack_require__(128);
	var bind = __webpack_require__(318);
	var isEmpty = __webpack_require__(233);

	var url = __webpack_require__(319);

	/**
	 * Event triggered when a parameter is set or updated
	 * @event AlgoliaSearchHelper#event:change
	 * @property {SearchParameters} state the current parameters with the latest changes applied
	 * @property {SearchResults} lastResults the previous results received from Algolia. `null` before
	 * the first request
	 * @example
	 * helper.on('change', function(state, lastResults) {
	 *   console.log('The parameters have changed');
	 * });
	 */

	/**
	 * Event triggered when the search is sent to Algolia
	 * @event AlgoliaSearchHelper#event:search
	 * @property {SearchParameters} state the parameters used for this search
	 * @property {SearchResults} lastResults the results from the previous search. `null` if
	 * it is the first search.
	 * @example
	 * helper.on('search', function(state, lastResults) {
	 *   console.log('Search sent');
	 * });
	 */

	/**
	 * Event triggered when the results are retrieved from Algolia
	 * @event AlgoliaSearchHelper#event:result
	 * @property {SearchResults} results the results received from Algolia
	 * @property {SearchParameters} state the parameters used to query Algolia. Those might
	 * be different from the one in the helper instance (for example if the network is unreliable).
	 * @example
	 * helper.on('result', function(results, state) {
	 *   console.log('Search results received');
	 * });
	 */

	/**
	 * Event triggered when Algolia sends back an error. For example, if an unknown parameter is
	 * used, the error can be caught using this event.
	 * @event AlgoliaSearchHelper#event:error
	 * @property {Error} error the error returned by the Algolia.
	 * @example
	 * helper.on('error', function(error) {
	 *   console.log('Houston we got a problem.');
	 * });
	 */

	/**
	 * Initialize a new AlgoliaSearchHelper
	 * @class
	 * @classdesc The AlgoliaSearchHelper is a class that ease the management of the
	 * search. It provides an event based interface for search callbacks:
	 *  - change: when the internal search state is changed.
	 *    This event contains a {@link SearchParameters} object and the
	 *    {@link SearchResults} of the last result if any.
	 *  - search: when a search is triggered using the `search()` method.
	 *  - result: when the response is retrieved from Algolia and is processed.
	 *    This event contains a {@link SearchResults} object and the
	 *    {@link SearchParameters} corresponding to this answer.
	 *  - error: when the response is an error. This event contains the error returned by the server.
	 * @param  {AlgoliaSearch} client an AlgoliaSearch client
	 * @param  {string} index the index name to query
	 * @param  {SearchParameters | object} options an object defining the initial
	 * config of the search. It doesn't have to be a {SearchParameters},
	 * just an object containing the properties you need from it.
	 */
	function AlgoliaSearchHelper(client, index, options) {
	  this.client = client;
	  var opts = options || {};
	  opts.index = index;
	  this.state = SearchParameters.make(opts);
	  this.lastResults = null;
	  this._queryId = 0;
	  this._lastQueryIdReceived = -1;
	}

	util.inherits(AlgoliaSearchHelper, events.EventEmitter);

	/**
	 * Start the search with the parameters set in the state. When the
	 * method is called, it triggers a `search` event. The results will
	 * be available through the `result` event. If an error occcurs, an
	 * `error` will be fired instead.
	 * @return {AlgoliaSearchHelper}
	 * @fires search
	 * @fires result
	 * @fires error
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.search = function() {
	  this._search();
	  return this;
	};

	/**
	 * Gets the search query parameters that would be sent to the Algolia Client
	 * for the hits
	 * @return {object} Query Parameters
	 */
	AlgoliaSearchHelper.prototype.getQuery = function() {
	  var state = this.state;
	  return requestBuilder._getHitsSearchParams(state);
	};

	/**
	 * Start a search using a modified version of the current state. This method does
	 * not trigger the helper lifecycle and does not modify the state kept internally
	 * by the helper. This second aspect means that the next search call will be the
	 * same as a search call before calling searchOnce.
	 * @param {object} options can contain all the parameters that can be set to SearchParameters
	 * plus the index
	 * @param {function} [callback] optional callback executed when the response from the
	 * server is back.
	 * @return {promise|undefined} if a callback is passed the method returns undefined
	 * otherwise it returns a promise containing an object with two keys :
	 *  - content with a SearchResults
	 *  - state with the state used for the query as a SearchParameters
	 * @example
	 * // Changing the number of records returned per page to 1
	 * // This example uses the callback API
	 * var state = helper.searchOnce({hitsPerPage: 1},
	 *   function(error, content, state) {
	 *     // if an error occured it will be passed in error, otherwise its value is null
	 *     // content contains the results formatted as a SearchResults
	 *     // state is the instance of SearchParameters used for this search
	 *   });
	 * @example
	 * // Changing the number of records returned per page to 1
	 * // This example uses the promise API
	 * var state1 = helper.searchOnce({hitsPerPage: 1})
	 *                 .then(promiseHandler);
	 *
	 * function promiseHandler(res) {
	 *   // res contains
	 *   // {
	 *   //   content : SearchResults
	 *   //   state   : SearchParameters (the one used for this specific search)
	 *   // }
	 * }
	 */
	AlgoliaSearchHelper.prototype.searchOnce = function(options, cb) {
	  var tempState = !options ? this.state : this.state.setQueryParameters(options);
	  var queries = requestBuilder._getQueries(tempState.index, tempState);
	  if (cb) {
	    return this.client.search(
	      queries,
	      function(err, content) {
	        if (err) cb(err, null, tempState);
	        else cb(null, new SearchResults(tempState, content), tempState);
	      });
	  }

	  return this.client.search(queries).then(
	    function(content) {
	      return {
	        content: new SearchResults(tempState, content),
	        state: tempState,
	        _originalResponse: content
	      };
	    });
	};

	/**
	 * Search for facet values based on an query and the name of a facetted attribute. This
	 * triggers a search and will retrun a promise. On top of using the query, it also sends
	 * the parameters from the state so that the search is narrowed to only the possible values.
	 * @param {string} query the string query for the search
	 * @param {string} facet the name of the facetted attribute
	 * @return {promise<FacetSearchResult>} the results of the search
	 */
	AlgoliaSearchHelper.prototype.searchForFacetValues = function(facet, query) {
	  var state = this.state;
	  var index = this.client.initIndex(this.state.index);
	  var isDisjunctive = state.isDisjunctiveFacet(facet);
	  var algoliaQuery = requestBuilder.getSearchForFacetQuery(facet, query, this.state);
	  return index.searchForFacetValues(algoliaQuery).then(function addIsRefined(content) {
	    content.facetHits = forEach(content.facetHits, function(f) {
	      f.isRefined = isDisjunctive ?
	        state.isDisjunctiveFacetRefined(facet, f.value) :
	        state.isFacetRefined(facet, f.value);
	    });

	    return content;
	  });
	};

	/**
	 * Sets the text query used for the search.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} q the user query
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.setQuery = function(q) {
	  this.state = this.state.setPage(0).setQuery(q);
	  this._change();
	  return this;
	};

	/**
	 * Remove all the types of refinements except tags. A string can be provided to remove
	 * only the refinements of a specific attribute. For more advanced use case, you can
	 * provide a function instead. This function should follow the
	 * [clearCallback definition](#SearchParameters.clearCallback).
	 *
	 * This method resets the current page to 0.
	 * @param {string} [name] optional name of the facet / attribute on which we want to remove all refinements
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 * @example
	 * // Removing all the refinements
	 * helper.clearRefinements().search();
	 * @example
	 * // Removing all the filters on a the category attribute.
	 * helper.clearRefinements('category').search();
	 * @example
	 * // Removing only the exclude filters on the category facet.
	 * helper.clearRefinements(function(value, attribute, type) {
	 *   return type === 'exclude' && attribute === 'category';
	 * }).search();
	 */
	AlgoliaSearchHelper.prototype.clearRefinements = function(name) {
	  this.state = this.state.setPage(0).clearRefinements(name);
	  this._change();
	  return this;
	};

	/**
	 * Remove all the tag filters.
	 *
	 * This method resets the current page to 0.
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.clearTags = function() {
	  this.state = this.state.setPage(0).clearTags();
	  this._change();
	  return this;
	};

	/**
	 * Adds a disjunctive filter to a facetted attribute with the `value` provided. If the
	 * filter is already set, it doesn't change the filters.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} value the associated value (will be converted to string)
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.addDisjunctiveFacetRefinement = function(facet, value) {
	  this.state = this.state.setPage(0).addDisjunctiveFacetRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#addDisjunctiveFacetRefinement}
	 */
	AlgoliaSearchHelper.prototype.addDisjunctiveRefine = function() {
	  return this.addDisjunctiveFacetRefinement.apply(this, arguments);
	};

	/**
	 * Adds a refinement on a hierarchical facet. It will throw
	 * an exception if the facet is not defined or if the facet
	 * is already refined.
	 *
	 * This method resets the current page to 0.
	 * @param {string} facet the facet name
	 * @param {string} path the hierarchical facet path
	 * @return {AlgoliaSearchHelper}
	 * @throws Error if the facet is not defined or if the facet is refined
	 * @chainable
	 * @fires change
	 */
	AlgoliaSearchHelper.prototype.addHierarchicalFacetRefinement = function(facet, value) {
	  this.state = this.state.setPage(0).addHierarchicalFacetRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * Adds a an numeric filter to an attribute with the `operator` and `value` provided. If the
	 * filter is already set, it doesn't change the filters.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} attribute the attribute on which the numeric filter applies
	 * @param  {string} operator the operator of the filter
	 * @param  {number} value the value of the filter
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.addNumericRefinement = function(attribute, operator, value) {
	  this.state = this.state.setPage(0).addNumericRefinement(attribute, operator, value);
	  this._change();
	  return this;
	};

	/**
	 * Adds a filter to a facetted attribute with the `value` provided. If the
	 * filter is already set, it doesn't change the filters.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} value the associated value (will be converted to string)
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.addFacetRefinement = function(facet, value) {
	  this.state = this.state.setPage(0).addFacetRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#addFacetRefinement}
	 */
	AlgoliaSearchHelper.prototype.addRefine = function() {
	  return this.addFacetRefinement.apply(this, arguments);
	};


	/**
	 * Adds a an exclusion filter to a facetted attribute with the `value` provided. If the
	 * filter is already set, it doesn't change the filters.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} value the associated value (will be converted to string)
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.addFacetExclusion = function(facet, value) {
	  this.state = this.state.setPage(0).addExcludeRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#addFacetExclusion}
	 */
	AlgoliaSearchHelper.prototype.addExclude = function() {
	  return this.addFacetExclusion.apply(this, arguments);
	};

	/**
	 * Adds a tag filter with the `tag` provided. If the
	 * filter is already set, it doesn't change the filters.
	 *
	 * This method resets the current page to 0.
	 * @param {string} tag the tag to add to the filter
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.addTag = function(tag) {
	  this.state = this.state.setPage(0).addTagRefinement(tag);
	  this._change();
	  return this;
	};

	/**
	 * Removes an numeric filter to an attribute with the `operator` and `value` provided. If the
	 * filter is not set, it doesn't change the filters.
	 *
	 * Some parameters are optionnals, triggering different behaviors:
	 *  - if the value is not provided, then all the numeric value will be removed for the
	 *  specified attribute/operator couple.
	 *  - if the operator is not provided either, then all the numeric filter on this attribute
	 *  will be removed.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} attribute the attribute on which the numeric filter applies
	 * @param  {string} [operator] the operator of the filter
	 * @param  {number} [value] the value of the filter
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.removeNumericRefinement = function(attribute, operator, value) {
	  this.state = this.state.setPage(0).removeNumericRefinement(attribute, operator, value);
	  this._change();
	  return this;
	};

	/**
	 * Removes a disjunctive filter to a facetted attribute with the `value` provided. If the
	 * filter is not set, it doesn't change the filters.
	 *
	 * If the value is omitted, then this method will remove all the filters for the
	 * attribute.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} [value] the associated value
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.removeDisjunctiveFacetRefinement = function(facet, value) {
	  this.state = this.state.setPage(0).removeDisjunctiveFacetRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#removeDisjunctiveFacetRefinement}
	 */
	AlgoliaSearchHelper.prototype.removeDisjunctiveRefine = function() {
	  return this.removeDisjunctiveFacetRefinement.apply(this, arguments);
	};

	/**
	 * Removes the refinement set on a hierarchical facet.
	 * @param {string} facet the facet name
	 * @return {AlgoliaSearchHelper}
	 * @throws Error if the facet is not defined or if the facet is not refined
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.removeHierarchicalFacetRefinement = function(facet) {
	  this.state = this.state.setPage(0).removeHierarchicalFacetRefinement(facet);
	  this._change();

	  return this;
	};

	/**
	 * Removes a filter to a facetted attribute with the `value` provided. If the
	 * filter is not set, it doesn't change the filters.
	 *
	 * If the value is omitted, then this method will remove all the filters for the
	 * attribute.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} [value] the associated value
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.removeFacetRefinement = function(facet, value) {
	  this.state = this.state.setPage(0).removeFacetRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#removeFacetRefinement}
	 */
	AlgoliaSearchHelper.prototype.removeRefine = function() {
	  return this.removeFacetRefinement.apply(this, arguments);
	};

	/**
	 * Removes an exclusion filter to a facetted attribute with the `value` provided. If the
	 * filter is not set, it doesn't change the filters.
	 *
	 * If the value is omitted, then this method will remove all the filters for the
	 * attribute.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} [value] the associated value
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.removeFacetExclusion = function(facet, value) {
	  this.state = this.state.setPage(0).removeExcludeRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#removeFacetExclusion}
	 */
	AlgoliaSearchHelper.prototype.removeExclude = function() {
	  return this.removeFacetExclusion.apply(this, arguments);
	};

	/**
	 * Removes a tag filter with the `tag` provided. If the
	 * filter is not set, it doesn't change the filters.
	 *
	 * This method resets the current page to 0.
	 * @param {string} tag tag to remove from the filter
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.removeTag = function(tag) {
	  this.state = this.state.setPage(0).removeTagRefinement(tag);
	  this._change();
	  return this;
	};

	/**
	 * Adds or removes an exclusion filter to a facetted attribute with the `value` provided. If
	 * the value is set then it removes it, otherwise it adds the filter.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} value the associated value
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.toggleFacetExclusion = function(facet, value) {
	  this.state = this.state.setPage(0).toggleExcludeFacetRefinement(facet, value);
	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#toggleFacetExclusion}
	 */
	AlgoliaSearchHelper.prototype.toggleExclude = function() {
	  return this.toggleFacetExclusion.apply(this, arguments);
	};

	/**
	 * Adds or removes a filter to a facetted attribute with the `value` provided. If
	 * the value is set then it removes it, otherwise it adds the filter.
	 *
	 * This method can be used for conjunctive, disjunctive and hierarchical filters.
	 *
	 * This method resets the current page to 0.
	 * @param  {string} facet the facet to refine
	 * @param  {string} value the associated value
	 * @return {AlgoliaSearchHelper}
	 * @throws Error will throw an error if the facet is not declared in the settings of the helper
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.toggleRefinement = function(facet, value) {
	  this.state = this.state.setPage(0).toggleRefinement(facet, value);

	  this._change();
	  return this;
	};

	/**
	 * @deprecated since version 2.4.0, see {@link AlgoliaSearchHelper#toggleRefinement}
	 */
	AlgoliaSearchHelper.prototype.toggleRefine = function() {
	  return this.toggleRefinement.apply(this, arguments);
	};

	/**
	 * Adds or removes a tag filter with the `value` provided. If
	 * the value is set then it removes it, otherwise it adds the filter.
	 *
	 * This method resets the current page to 0.
	 * @param {string} tag tag to remove or add
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.toggleTag = function(tag) {
	  this.state = this.state.setPage(0).toggleTagRefinement(tag);
	  this._change();
	  return this;
	};

	/**
	 * Increments the page number by one.
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 * @example
	 * helper.setPage(0).nextPage().getPage();
	 * // returns 1
	 */
	AlgoliaSearchHelper.prototype.nextPage = function() {
	  return this.setPage(this.state.page + 1);
	};

	/**
	 * Decrements the page number by one.
	 * @fires change
	 * @return {AlgoliaSearchHelper}
	 * @chainable
	 * @example
	 * helper.setPage(1).previousPage().getPage();
	 * // returns 0
	 */
	AlgoliaSearchHelper.prototype.previousPage = function() {
	  return this.setPage(this.state.page - 1);
	};

	/**
	 * @private
	 */
	function setCurrentPage(page) {
	  if (page < 0) throw new Error('Page requested below 0.');

	  this.state = this.state.setPage(page);
	  this._change();
	  return this;
	}

	/**
	 * Change the current page
	 * @deprecated
	 * @param  {number} page The page number
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.setCurrentPage = setCurrentPage;

	/**
	 * Updates the current page.
	 * @function
	 * @param  {number} page The page number
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.setPage = setCurrentPage;

	/**
	 * Updates the name of the index that will be targeted by the query.
	 *
	 * This method resets the current page to 0.
	 * @param {string} name the index name
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.setIndex = function(name) {
	  this.state = this.state.setPage(0).setIndex(name);
	  this._change();
	  return this;
	};

	/**
	 * Update a parameter of the search. This method reset the page
	 *
	 * The complete list of parameters is available on the
	 * [Algolia website](https://www.algolia.com/doc/rest#query-an-index).
	 * The most commonly used parameters have their own [shortcuts](#query-parameters-shortcuts)
	 * or benefit from higher-level APIs (all the kind of filters and facets have their own API)
	 *
	 * This method resets the current page to 0.
	 * @param {string} parameter name of the parameter to update
	 * @param {any} value new value of the parameter
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 * @example
	 * helper.setQueryParameter('hitsPerPage', 20).search();
	 */
	AlgoliaSearchHelper.prototype.setQueryParameter = function(parameter, value) {
	  var newState = this.state.setPage(0).setQueryParameter(parameter, value);

	  if (this.state === newState) return this;

	  this.state = newState;
	  this._change();
	  return this;
	};

	/**
	 * Set the whole state (warning: will erase previous state)
	 * @param {SearchParameters} newState the whole new state
	 * @return {AlgoliaSearchHelper}
	 * @fires change
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.setState = function(newState) {
	  this.state = new SearchParameters(newState);
	  this._change();
	  return this;
	};

	/**
	 * Get the current search state stored in the helper. This object is immutable.
	 * @param {string[]} [filters] optionnal filters to retrieve only a subset of the state
	 * @return {SearchParameters|object} if filters is specified a plain object is
	 * returned containing only the requested fields, otherwise return the unfiltered
	 * state
	 * @example
	 * // Get the complete state as stored in the helper
	 * helper.getState();
	 * @example
	 * // Get a part of the state with all the refinements on attributes and the query
	 * helper.getState(['query', 'attribute:category']);
	 */
	AlgoliaSearchHelper.prototype.getState = function(filters) {
	  if (filters === undefined) return this.state;
	  return this.state.filter(filters);
	};

	/**
	 * DEPRECATED Get part of the state as a query string. By default, the output keys will not
	 * be prefixed and will only take the applied refinements and the query.
	 * @deprecated
	 * @param {object} [options] May contain the following parameters :
	 *
	 * **filters** : possible values are all the keys of the [SearchParameters](#searchparameters), `index` for
	 * the index, all the refinements with `attribute:*` or for some specific attributes with
	 * `attribute:theAttribute`
	 *
	 * **prefix** : prefix in front of the keys
	 *
	 * **moreAttributes** : more values to be added in the query string. Those values
	 *    won't be prefixed.
	 * @return {string} the query string
	 */
	AlgoliaSearchHelper.prototype.getStateAsQueryString = function getStateAsQueryString(options) {
	  var filters = options && options.filters || ['query', 'attribute:*'];
	  var partialState = this.getState(filters);

	  return url.getQueryStringFromState(partialState, options);
	};

	/**
	 * DEPRECATED Read a query string and return an object containing the state. Use
	 * url module.
	 * @deprecated
	 * @static
	 * @param {string} queryString the query string that will be decoded
	 * @param {object} options accepted options :
	 *   - prefix : the prefix used for the saved attributes, you have to provide the
	 *     same that was used for serialization
	 * @return {object} partial search parameters object (same properties than in the
	 * SearchParameters but not exhaustive)
	 * @see {@link url#getStateFromQueryString}
	 */
	AlgoliaSearchHelper.getConfigurationFromQueryString = url.getStateFromQueryString;

	/**
	 * DEPRECATED Retrieve an object of all the properties that are not understandable as helper
	 * parameters. Use url module.
	 * @deprecated
	 * @static
	 * @param {string} queryString the query string to read
	 * @param {object} options the options
	 *   - prefixForParameters : prefix used for the helper configuration keys
	 * @return {object} the object containing the parsed configuration that doesn't
	 * to the helper
	 */
	AlgoliaSearchHelper.getForeignConfigurationInQueryString = url.getUnrecognizedParametersInQueryString;

	/**
	 * DEPRECATED Overrides part of the state with the properties stored in the provided query
	 * string.
	 * @deprecated
	 * @param {string} queryString the query string containing the informations to url the state
	 * @param {object} options optionnal parameters :
	 *  - prefix : prefix used for the algolia parameters
	 *  - triggerChange : if set to true the state update will trigger a change event
	 */
	AlgoliaSearchHelper.prototype.setStateFromQueryString = function(queryString, options) {
	  var triggerChange = options && options.triggerChange || false;
	  var configuration = url.getStateFromQueryString(queryString, options);
	  var updatedState = this.state.setQueryParameters(configuration);

	  if (triggerChange) this.setState(updatedState);
	  else this.overrideStateWithoutTriggeringChangeEvent(updatedState);
	};

	/**
	 * Override the current state without triggering a change event.
	 * Do not use this method unless you know what you are doing. (see the example
	 * for a legit use case)
	 * @param {SearchParameters} newState the whole new state
	 * @return {AlgoliaSearchHelper}
	 * @example
	 *  helper.on('change', function(state){
	 *    // In this function you might want to find a way to store the state in the url/history
	 *    updateYourURL(state)
	 *  })
	 *  window.onpopstate = function(event){
	 *    // This is naive though as you should check if the state is really defined etc.
	 *    helper.overrideStateWithoutTriggeringChangeEvent(event.state).search()
	 *  }
	 * @chainable
	 */
	AlgoliaSearchHelper.prototype.overrideStateWithoutTriggeringChangeEvent = function(newState) {
	  this.state = new SearchParameters(newState);
	  return this;
	};

	/**
	 * @deprecated since 2.4.0, see {@link AlgoliaSearchHelper#hasRefinements}
	 */
	AlgoliaSearchHelper.prototype.isRefined = function(facet, value) {
	  if (this.state.isConjunctiveFacet(facet)) {
	    return this.state.isFacetRefined(facet, value);
	  } else if (this.state.isDisjunctiveFacet(facet)) {
	    return this.state.isDisjunctiveFacetRefined(facet, value);
	  }

	  throw new Error(facet +
	    ' is not properly defined in this helper configuration' +
	    '(use the facets or disjunctiveFacets keys to configure it)');
	};

	/**
	 * Check if an attribute has any numeric, conjunctive, disjunctive or hierarchical filters.
	 * @param {string} attribute the name of the attribute
	 * @return {boolean} true if the attribute is filtered by at least one value
	 * @example
	 * // hasRefinements works with numeric, conjunctive, disjunctive and hierarchical filters
	 * helper.hasRefinements('price'); // false
	 * helper.addNumericRefinement('price', '>', 100);
	 * helper.hasRefinements('price'); // true
	 *
	 * helper.hasRefinements('color'); // false
	 * helper.addFacetRefinement('color', 'blue');
	 * helper.hasRefinements('color'); // true
	 *
	 * helper.hasRefinements('material'); // false
	 * helper.addDisjunctiveFacetRefinement('material', 'plastic');
	 * helper.hasRefinements('material'); // true
	 *
	 * helper.hasRefinements('categories'); // false
	 * helper.toggleRefinement('categories', 'kitchen > knife');
	 * helper.hasRefinements('categories'); // true
	 *
	 */
	AlgoliaSearchHelper.prototype.hasRefinements = function(attribute) {
	  if (!isEmpty(this.state.getNumericRefinements(attribute))) {
	    return true;
	  } else if (this.state.isConjunctiveFacet(attribute)) {
	    return this.state.isFacetRefined(attribute);
	  } else if (this.state.isDisjunctiveFacet(attribute)) {
	    return this.state.isDisjunctiveFacetRefined(attribute);
	  } else if (this.state.isHierarchicalFacet(attribute)) {
	    return this.state.isHierarchicalFacetRefined(attribute);
	  }

	  // there's currently no way to know that the user did call `addNumericRefinement` at some point
	  // thus we cannot distinguish if there once was a numeric refinement that was cleared
	  // so we will return false in every other situations to be consistent
	  // while what we should do here is throw because we did not find the attribute in any type
	  // of refinement
	  return false;
	};

	/**
	 * Check if a value is excluded for a specific facetted attribute. If the value
	 * is omitted then the function checks if there is any excluding refinements.
	 *
	 * @param  {string}  facet name of the attribute for used for facetting
	 * @param  {string}  [value] optionnal value. If passed will test that this value
	   * is filtering the given facet.
	 * @return {boolean} true if refined
	 * @example
	 * helper.isExcludeRefined('color'); // false
	 * helper.isExcludeRefined('color', 'blue') // false
	 * helper.isExcludeRefined('color', 'red') // false
	 *
	 * helper.addFacetExclusion('color', 'red');
	 *
	 * helper.isExcludeRefined('color'); // true
	 * helper.isExcludeRefined('color', 'blue') // false
	 * helper.isExcludeRefined('color', 'red') // true
	 */
	AlgoliaSearchHelper.prototype.isExcluded = function(facet, value) {
	  return this.state.isExcludeRefined(facet, value);
	};

	/**
	 * @deprecated since 2.4.0, see {@link AlgoliaSearchHelper#hasRefinements}
	 */
	AlgoliaSearchHelper.prototype.isDisjunctiveRefined = function(facet, value) {
	  return this.state.isDisjunctiveFacetRefined(facet, value);
	};

	/**
	 * Check if the string is a currently filtering tag.
	 * @param {string} tag tag to check
	 * @return {boolean}
	 */
	AlgoliaSearchHelper.prototype.hasTag = function(tag) {
	  return this.state.isTagRefined(tag);
	};

	/**
	 * @deprecated since 2.4.0, see {@link AlgoliaSearchHelper#hasTag}
	 */
	AlgoliaSearchHelper.prototype.isTagRefined = function() {
	  return this.hasTagRefinements.apply(this, arguments);
	};


	/**
	 * Get the name of the currently used index.
	 * @return {string}
	 * @example
	 * helper.setIndex('highestPrice_products').getIndex();
	 * // returns 'highestPrice_products'
	 */
	AlgoliaSearchHelper.prototype.getIndex = function() {
	  return this.state.index;
	};

	function getCurrentPage() {
	  return this.state.page;
	}

	/**
	 * Get the currently selected page
	 * @deprecated
	 * @return {number} the current page
	 */
	AlgoliaSearchHelper.prototype.getCurrentPage = getCurrentPage;
	/**
	 * Get the currently selected page
	 * @function
	 * @return {number} the current page
	 */
	AlgoliaSearchHelper.prototype.getPage = getCurrentPage;

	/**
	 * Get all the tags currently set to filters the results.
	 *
	 * @return {string[]} The list of tags currently set.
	 */
	AlgoliaSearchHelper.prototype.getTags = function() {
	  return this.state.tagRefinements;
	};

	/**
	 * Get a parameter of the search by its name. It is possible that a parameter is directly
	 * defined in the index dashboard, but it will be undefined using this method.
	 *
	 * The complete list of parameters is
	 * available on the
	 * [Algolia website](https://www.algolia.com/doc/rest#query-an-index).
	 * The most commonly used parameters have their own [shortcuts](#query-parameters-shortcuts)
	 * or benefit from higher-level APIs (all the kind of filters have their own API)
	 * @param {string} parameterName the parameter name
	 * @return {any} the parameter value
	 * @example
	 * var hitsPerPage = helper.getQueryParameter('hitsPerPage');
	 */
	AlgoliaSearchHelper.prototype.getQueryParameter = function(parameterName) {
	  return this.state.getQueryParameter(parameterName);
	};

	/**
	 * Get the list of refinements for a given attribute. This method works with
	 * conjunctive, disjunctive, excluding and numerical filters.
	 *
	 * See also SearchResults#getRefinements
	 *
	 * @param {string} facetName attribute name used for facetting
	 * @return {Array.<FacetRefinement|NumericRefinement>} All Refinement are objects that contain a value, and
	 * a type. Numeric also contains an operator.
	 * @example
	 * helper.addNumericRefinement('price', '>', 100);
	 * helper.getRefinements('price');
	 * // [
	 * //   {
	 * //     "value": [
	 * //       100
	 * //     ],
	 * //     "operator": ">",
	 * //     "type": "numeric"
	 * //   }
	 * // ]
	 * @example
	 * helper.addFacetRefinement('color', 'blue');
	 * helper.addFacetExclusion('color', 'red');
	 * helper.getRefinements('color');
	 * // [
	 * //   {
	 * //     "value": "blue",
	 * //     "type": "conjunctive"
	 * //   },
	 * //   {
	 * //     "value": "red",
	 * //     "type": "exclude"
	 * //   }
	 * // ]
	 * @example
	 * helper.addDisjunctiveFacetRefinement('material', 'plastic');
	 * // [
	 * //   {
	 * //     "value": "plastic",
	 * //     "type": "disjunctive"
	 * //   }
	 * // ]
	 */
	AlgoliaSearchHelper.prototype.getRefinements = function(facetName) {
	  var refinements = [];

	  if (this.state.isConjunctiveFacet(facetName)) {
	    var conjRefinements = this.state.getConjunctiveRefinements(facetName);

	    forEach(conjRefinements, function(r) {
	      refinements.push({
	        value: r,
	        type: 'conjunctive'
	      });
	    });

	    var excludeRefinements = this.state.getExcludeRefinements(facetName);

	    forEach(excludeRefinements, function(r) {
	      refinements.push({
	        value: r,
	        type: 'exclude'
	      });
	    });
	  } else if (this.state.isDisjunctiveFacet(facetName)) {
	    var disjRefinements = this.state.getDisjunctiveRefinements(facetName);

	    forEach(disjRefinements, function(r) {
	      refinements.push({
	        value: r,
	        type: 'disjunctive'
	      });
	    });
	  }

	  var numericRefinements = this.state.getNumericRefinements(facetName);

	  forEach(numericRefinements, function(value, operator) {
	    refinements.push({
	      value: value,
	      operator: operator,
	      type: 'numeric'
	    });
	  });

	  return refinements;
	};

	/**
	 * Return the current refinement for the (attribute, operator)
	 * @param {string} attribute of the record
	 * @param {string} operator applied
	 * @return {number} value of the refinement
	 */
	AlgoliaSearchHelper.prototype.getNumericRefinement = function(attribute, operator) {
	  return this.state.getNumericRefinement(attribute, operator);
	};

	/**
	 * Get the current breadcrumb for a hierarchical facet, as an array
	 * @param  {string} facetName Hierarchical facet name
	 * @return {array.<string>} the path as an array of string
	 */
	AlgoliaSearchHelper.prototype.getHierarchicalFacetBreadcrumb = function(facetName) {
	  return this.state.getHierarchicalFacetBreadcrumb(facetName);
	};

	// /////////// PRIVATE

	/**
	 * Perform the underlying queries
	 * @private
	 * @return {undefined}
	 * @fires search
	 * @fires result
	 * @fires error
	 */
	AlgoliaSearchHelper.prototype._search = function() {
	  var state = this.state;
	  var queries = requestBuilder._getQueries(state.index, state);

	  this.emit('search', state, this.lastResults);
	  this.client.search(queries,
	    bind(this._handleResponse,
	      this,
	      state,
	      this._queryId++));
	};

	/**
	 * Transform the response as sent by the server and transform it into a user
	 * usable objet that merge the results of all the batch requests.
	 * @private
	 * @param {SearchParameters} state state used for to generate the request
	 * @param {number} queryId id of the current request
	 * @param {Error} err error if any, null otherwise
	 * @param {object} content content of the response
	 * @return {undefined}
	 */
	AlgoliaSearchHelper.prototype._handleResponse = function(state, queryId, err, content) {
	  if (queryId < this._lastQueryIdReceived) {
	    // Outdated answer
	    return;
	  }

	  this._lastQueryIdReceived = queryId;

	  if (err) {
	    this.emit('error', err);
	    return;
	  }

	  var formattedResponse = this.lastResults = new SearchResults(state, content);

	  this.emit('result', formattedResponse, state);
	};

	AlgoliaSearchHelper.prototype.containsRefinement = function(query, facetFilters, numericFilters, tagFilters) {
	  return query ||
	    facetFilters.length !== 0 ||
	    numericFilters.length !== 0 ||
	    tagFilters.length !== 0;
	};

	/**
	 * Test if there are some disjunctive refinements on the facet
	 * @private
	 * @param {string} facet the attribute to test
	 * @return {boolean}
	 */
	AlgoliaSearchHelper.prototype._hasDisjunctiveRefinements = function(facet) {
	  return this.state.disjunctiveRefinements[facet] &&
	    this.state.disjunctiveRefinements[facet].length > 0;
	};

	AlgoliaSearchHelper.prototype._change = function() {
	  this.emit('change', this.state, this.lastResults);
	};

	/**
	 * Clears the cache of the underlying Algolia client.
	 */
	AlgoliaSearchHelper.prototype.clearCache = function() {
	  this.client.clearCache();
	};

	/**
	 * @typedef AlgoliaSearchHelper.NumericRefinement
	 * @type {object}
	 * @property {number[]} value the numbers that are used for filtering this attribute with
	 * the operator specified.
	 * @property {string} operator the facetting data: value, number of entries
	 * @property {string} type will be 'numeric'
	 */

	/**
	 * @typedef AlgoliaSearchHelper.FacetRefinement
	 * @type {object}
	 * @property {string} value the string use to filter the attribute
	 * @property {string} type the type of filter: 'conjunctive', 'disjunctive', 'exclude'
	 */

	module.exports = AlgoliaSearchHelper;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys = __webpack_require__(40);
	var intersection = __webpack_require__(69);
	var forOwn = __webpack_require__(123);
	var forEach = __webpack_require__(128);
	var filter = __webpack_require__(132);
	var map = __webpack_require__(179);
	var reduce = __webpack_require__(181);
	var omit = __webpack_require__(184);
	var indexOf = __webpack_require__(227);
	var isNaN = __webpack_require__(231);
	var isArray = __webpack_require__(52);
	var isEmpty = __webpack_require__(233);
	var isEqual = __webpack_require__(234);
	var isUndefined = __webpack_require__(235);
	var isString = __webpack_require__(236);
	var isFunction = __webpack_require__(67);
	var find = __webpack_require__(237);
	var trim = __webpack_require__(240);

	var defaults = __webpack_require__(248);
	var merge = __webpack_require__(253);

	var valToNumber = __webpack_require__(259);

	var filterState = __webpack_require__(260);

	var RefinementList = __webpack_require__(261);

	/**
	 * like _.find but using _.isEqual to be able to use it
	 * to find arrays.
	 * @private
	 * @param {any[]} array array to search into
	 * @param {any} searchedValue the value we're looking for
	 * @return {any} the searched value or undefined
	 */
	function findArray(array, searchedValue) {
	  return find(array, function(currentValue) {
	    return isEqual(currentValue, searchedValue);
	  });
	}

	/**
	 * The facet list is the structure used to store the list of values used to
	 * filter a single attribute.
	 * @typedef {string[]} SearchParameters.FacetList
	 */

	/**
	 * Structure to store numeric filters with the operator as the key. The supported operators
	 * are `=`, `>`, `<`, `>=`, `<=` and `!=`.
	 * @typedef {Object.<string, Array.<number|number[]>>} SearchParameters.OperatorList
	 */

	/**
	 * SearchParameters is the data structure that contains all the information
	 * usable for making a search to Algolia API. It doesn't do the search itself,
	 * nor does it contains logic about the parameters.
	 * It is an immutable object, therefore it has been created in a way that each
	 * changes does not change the object itself but returns a copy with the
	 * modification.
	 * This object should probably not be instantiated outside of the helper. It will
	 * be provided when needed. This object is documented for reference as you'll
	 * get it from events generated by the {@link AlgoliaSearchHelper}.
	 * If need be, instantiate the Helper from the factory function {@link SearchParameters.make}
	 * @constructor
	 * @classdesc contains all the parameters of a search
	 * @param {object|SearchParameters} newParameters existing parameters or partial object
	 * for the properties of a new SearchParameters
	 * @see SearchParameters.make
	 * @example <caption>SearchParameters of the first query in
	 *   <a href="http://demos.algolia.com/instant-search-demo/">the instant search demo</a></caption>
	{
	   "query": "",
	   "disjunctiveFacets": [
	      "customerReviewCount",
	      "category",
	      "salePrice_range",
	      "manufacturer"
	  ],
	   "maxValuesPerFacet": 30,
	   "page": 0,
	   "hitsPerPage": 10,
	   "facets": [
	      "type",
	      "shipping"
	  ]
	}
	 */
	function SearchParameters(newParameters) {
	  var params = newParameters ? SearchParameters._parseNumbers(newParameters) : {};

	  /**
	   * Targeted index. This parameter is mandatory.
	   * @member {string}
	   */
	  this.index = params.index || '';

	  // Query
	  /**
	   * Query string of the instant search. The empty string is a valid query.
	   * @member {string}
	   * @see https://www.algolia.com/doc/rest#param-query
	   */
	  this.query = params.query || '';

	  // Facets
	  /**
	   * This attribute contains the list of all the conjunctive facets
	   * used. This list will be added to requested facets in the
	   * [facets attribute](https://www.algolia.com/doc/rest-api/search#param-facets) sent to algolia.
	   * @member {string[]}
	   */
	  this.facets = params.facets || [];
	  /**
	   * This attribute contains the list of all the disjunctive facets
	   * used. This list will be added to requested facets in the
	   * [facets attribute](https://www.algolia.com/doc/rest-api/search#param-facets) sent to algolia.
	   * @member {string[]}
	   */
	  this.disjunctiveFacets = params.disjunctiveFacets || [];
	  /**
	   * This attribute contains the list of all the hierarchical facets
	   * used. This list will be added to requested facets in the
	   * [facets attribute](https://www.algolia.com/doc/rest-api/search#param-facets) sent to algolia.
	   * Hierarchical facets are a sub type of disjunctive facets that
	   * let you filter faceted attributes hierarchically.
	   * @member {string[]|object[]}
	   */
	  this.hierarchicalFacets = params.hierarchicalFacets || [];

	  // Refinements
	  /**
	   * This attribute contains all the filters that need to be
	   * applied on the conjunctive facets. Each facet must be properly
	   * defined in the `facets` attribute.
	   *
	   * The key is the name of the facet, and the `FacetList` contains all
	   * filters selected for the associated facet name.
	   *
	   * When querying algolia, the values stored in this attribute will
	   * be translated into the `facetFiters` attribute.
	   * @member {Object.<string, SearchParameters.FacetList>}
	   */
	  this.facetsRefinements = params.facetsRefinements || {};
	  /**
	   * This attribute contains all the filters that need to be
	   * excluded from the conjunctive facets. Each facet must be properly
	   * defined in the `facets` attribute.
	   *
	   * The key is the name of the facet, and the `FacetList` contains all
	   * filters excluded for the associated facet name.
	   *
	   * When querying algolia, the values stored in this attribute will
	   * be translated into the `facetFiters` attribute.
	   * @member {Object.<string, SearchParameters.FacetList>}
	   */
	  this.facetsExcludes = params.facetsExcludes || {};
	  /**
	   * This attribute contains all the filters that need to be
	   * applied on the disjunctive facets. Each facet must be properly
	   * defined in the `disjunctiveFacets` attribute.
	   *
	   * The key is the name of the facet, and the `FacetList` contains all
	   * filters selected for the associated facet name.
	   *
	   * When querying algolia, the values stored in this attribute will
	   * be translated into the `facetFiters` attribute.
	   * @member {Object.<string, SearchParameters.FacetList>}
	   */
	  this.disjunctiveFacetsRefinements = params.disjunctiveFacetsRefinements || {};
	  /**
	   * This attribute contains all the filters that need to be
	   * applied on the numeric attributes.
	   *
	   * The key is the name of the attribute, and the value is the
	   * filters to apply to this attribute.
	   *
	   * When querying algolia, the values stored in this attribute will
	   * be translated into the `numericFilters` attribute.
	   * @member {Object.<string, SearchParameters.OperatorList>}
	   */
	  this.numericRefinements = params.numericRefinements || {};
	  /**
	   * This attribute contains all the tags used to refine the query.
	   *
	   * When querying algolia, the values stored in this attribute will
	   * be translated into the `tagFilters` attribute.
	   * @member {string[]}
	   */
	  this.tagRefinements = params.tagRefinements || [];
	  /**
	   * This attribute contains all the filters that need to be
	   * applied on the hierarchical facets. Each facet must be properly
	   * defined in the `hierarchicalFacets` attribute.
	   *
	   * The key is the name of the facet, and the `FacetList` contains all
	   * filters selected for the associated facet name. The FacetList values
	   * are structured as a string that contain the values for each level
	   * seperated by the configured separator.
	   *
	   * When querying algolia, the values stored in this attribute will
	   * be translated into the `facetFiters` attribute.
	   * @member {Object.<string, SearchParameters.FacetList>}
	   */
	  this.hierarchicalFacetsRefinements = params.hierarchicalFacetsRefinements || {};

	  /**
	   * Contains the numeric filters in the raw format of the Algolia API. Setting
	   * this parameter is not compatible with the usage of numeric filters methods.
	   * @see https://www.algolia.com/doc/javascript#numericFilters
	   * @member {string}
	   */
	  this.numericFilters = params.numericFilters;

	  /**
	   * Contains the tag filters in the raw format of the Algolia API. Setting this
	   * parameter is not compatible with the of the add/remove/toggle methods of the
	   * tag api.
	   * @see https://www.algolia.com/doc/rest#param-tagFilters
	   * @member {string}
	   */
	  this.tagFilters = params.tagFilters;

	  /**
	   * Contains the optional tag filters in the raw format of the Algolia API.
	   * @see https://www.algolia.com/doc/rest#param-tagFilters
	   * @member {string}
	   */
	  this.optionalTagFilters = params.optionalTagFilters;

	  /**
	   * Contains the optional facet filters in the raw format of the Algolia API.
	   * @see https://www.algolia.com/doc/rest#param-tagFilters
	   * @member {string}
	   */
	  this.optionalFacetFilters = params.optionalFacetFilters;


	  // Misc. parameters
	  /**
	   * Number of hits to be returned by the search API
	   * @member {number}
	   * @see https://www.algolia.com/doc/rest#param-hitsPerPage
	   */
	  this.hitsPerPage = params.hitsPerPage;
	  /**
	   * Number of values for each facetted attribute
	   * @member {number}
	   * @see https://www.algolia.com/doc/rest#param-maxValuesPerFacet
	   */
	  this.maxValuesPerFacet = params.maxValuesPerFacet;
	  /**
	   * The current page number
	   * @member {number}
	   * @see https://www.algolia.com/doc/rest#param-page
	   */
	  this.page = params.page || 0;
	  /**
	   * How the query should be treated by the search engine.
	   * Possible values: prefixAll, prefixLast, prefixNone
	   * @see https://www.algolia.com/doc/rest#param-queryType
	   * @member {string}
	   */
	  this.queryType = params.queryType;
	  /**
	   * How the typo tolerance behave in the search engine.
	   * Possible values: true, false, min, strict
	   * @see https://www.algolia.com/doc/rest#param-typoTolerance
	   * @member {string}
	   */
	  this.typoTolerance = params.typoTolerance;

	  /**
	   * Number of characters to wait before doing one character replacement.
	   * @see https://www.algolia.com/doc/rest#param-minWordSizefor1Typo
	   * @member {number}
	   */
	  this.minWordSizefor1Typo = params.minWordSizefor1Typo;
	  /**
	   * Number of characters to wait before doing a second character replacement.
	   * @see https://www.algolia.com/doc/rest#param-minWordSizefor2Typos
	   * @member {number}
	   */
	  this.minWordSizefor2Typos = params.minWordSizefor2Typos;
	  /**
	   * Configure the precision of the proximity ranking criterion
	   * @see https://www.algolia.com/doc/rest#param-minProximity
	   */
	  this.minProximity = params.minProximity;
	  /**
	   * Should the engine allow typos on numerics.
	   * @see https://www.algolia.com/doc/rest#param-allowTyposOnNumericTokens
	   * @member {boolean}
	   */
	  this.allowTyposOnNumericTokens = params.allowTyposOnNumericTokens;
	  /**
	   * Should the plurals be ignored
	   * @see https://www.algolia.com/doc/rest#param-ignorePlurals
	   * @member {boolean}
	   */
	  this.ignorePlurals = params.ignorePlurals;
	  /**
	   * Restrict which attribute is searched.
	   * @see https://www.algolia.com/doc/rest#param-restrictSearchableAttributes
	   * @member {string}
	   */
	  this.restrictSearchableAttributes = params.restrictSearchableAttributes;
	  /**
	   * Enable the advanced syntax.
	   * @see https://www.algolia.com/doc/rest#param-advancedSyntax
	   * @member {boolean}
	   */
	  this.advancedSyntax = params.advancedSyntax;
	  /**
	   * Enable the analytics
	   * @see https://www.algolia.com/doc/rest#param-analytics
	   * @member {boolean}
	   */
	  this.analytics = params.analytics;
	  /**
	   * Tag of the query in the analytics.
	   * @see https://www.algolia.com/doc/rest#param-analyticsTags
	   * @member {string}
	   */
	  this.analyticsTags = params.analyticsTags;
	  /**
	   * Enable the synonyms
	   * @see https://www.algolia.com/doc/rest#param-synonyms
	   * @member {boolean}
	   */
	  this.synonyms = params.synonyms;
	  /**
	   * Should the engine replace the synonyms in the highlighted results.
	   * @see https://www.algolia.com/doc/rest#param-replaceSynonymsInHighlight
	   * @member {boolean}
	   */
	  this.replaceSynonymsInHighlight = params.replaceSynonymsInHighlight;
	  /**
	   * Add some optional words to those defined in the dashboard
	   * @see https://www.algolia.com/doc/rest#param-optionalWords
	   * @member {string}
	   */
	  this.optionalWords = params.optionalWords;
	  /**
	   * Possible values are "lastWords" "firstWords" "allOptional" "none" (default)
	   * @see https://www.algolia.com/doc/rest#param-removeWordsIfNoResults
	   * @member {string}
	   */
	  this.removeWordsIfNoResults = params.removeWordsIfNoResults;
	  /**
	   * List of attributes to retrieve
	   * @see https://www.algolia.com/doc/rest#param-attributesToRetrieve
	   * @member {string}
	   */
	  this.attributesToRetrieve = params.attributesToRetrieve;
	  /**
	   * List of attributes to highlight
	   * @see https://www.algolia.com/doc/rest#param-attributesToHighlight
	   * @member {string}
	   */
	  this.attributesToHighlight = params.attributesToHighlight;
	  /**
	   * Code to be embedded on the left part of the highlighted results
	   * @see https://www.algolia.com/doc/rest#param-highlightPreTag
	   * @member {string}
	   */
	  this.highlightPreTag = params.highlightPreTag;
	  /**
	   * Code to be embedded on the right part of the highlighted results
	   * @see https://www.algolia.com/doc/rest#param-highlightPostTag
	   * @member {string}
	   */
	  this.highlightPostTag = params.highlightPostTag;
	  /**
	   * List of attributes to snippet
	   * @see https://www.algolia.com/doc/rest#param-attributesToSnippet
	   * @member {string}
	   */
	  this.attributesToSnippet = params.attributesToSnippet;
	  /**
	   * Enable the ranking informations in the response, set to 1 to activate
	   * @see https://www.algolia.com/doc/rest#param-getRankingInfo
	   * @member {number}
	   */
	  this.getRankingInfo = params.getRankingInfo;
	  /**
	   * Remove duplicates based on the index setting attributeForDistinct
	   * @see https://www.algolia.com/doc/rest#param-distinct
	   * @member {boolean|number}
	   */
	  this.distinct = params.distinct;
	  /**
	   * Center of the geo search.
	   * @see https://www.algolia.com/doc/rest#param-aroundLatLng
	   * @member {string}
	   */
	  this.aroundLatLng = params.aroundLatLng;
	  /**
	   * Center of the search, retrieve from the user IP.
	   * @see https://www.algolia.com/doc/rest#param-aroundLatLngViaIP
	   * @member {boolean}
	   */
	  this.aroundLatLngViaIP = params.aroundLatLngViaIP;
	  /**
	   * Radius of the geo search.
	   * @see https://www.algolia.com/doc/rest#param-aroundRadius
	   * @member {number}
	   */
	  this.aroundRadius = params.aroundRadius;
	  /**
	   * Precision of the geo search.
	   * @see https://www.algolia.com/doc/rest#param-aroundPrecision
	   * @member {number}
	   */
	  this.minimumAroundRadius = params.minimumAroundRadius;
	  /**
	   * Precision of the geo search.
	   * @see https://www.algolia.com/doc/rest#param-minimumAroundRadius
	   * @member {number}
	   */
	  this.aroundPrecision = params.aroundPrecision;
	  /**
	   * Geo search inside a box.
	   * @see https://www.algolia.com/doc/rest#param-insideBoundingBox
	   * @member {string}
	   */
	  this.insideBoundingBox = params.insideBoundingBox;
	  /**
	   * Geo search inside a polygon.
	   * @see https://www.algolia.com/doc/rest#param-insidePolygon
	   * @member {string}
	   */
	  this.insidePolygon = params.insidePolygon;
	  /**
	   * Allows to specify an ellipsis character for the snippet when we truncate the text
	   * (added before and after if truncated).
	   * The default value is an empty string and we recommend to set it to "…"
	   * @see https://www.algolia.com/doc/rest#param-insidePolygon
	   * @member {string}
	   */
	  this.snippetEllipsisText = params.snippetEllipsisText;
	  /**
	   * Allows to specify some attributes name on which exact won't be applied.
	   * Attributes are separated with a comma (for example "name,address" ), you can also use a
	   * JSON string array encoding (for example encodeURIComponent('["name","address"]') ).
	   * By default the list is empty.
	   * @see https://www.algolia.com/doc/rest#param-disableExactOnAttributes
	   * @member {string|string[]}
	   */
	  this.disableExactOnAttributes = params.disableExactOnAttributes;
	  /**
	   * Applies 'exact' on single word queries if the word contains at least 3 characters
	   * and is not a stop word.
	   * Can take two values: true or false.
	   * By default, its set to false.
	   * @see https://www.algolia.com/doc/rest#param-enableExactOnSingleWordQuery
	   * @member {boolean}
	   */
	  this.enableExactOnSingleWordQuery = params.enableExactOnSingleWordQuery;

	  // Undocumented parameters, still needed otherwise we fail
	  this.offset = params.offset;
	  this.length = params.length;

	  var self = this;
	  forOwn(params, function checkForUnknownParameter(paramValue, paramName) {
	    if (SearchParameters.PARAMETERS.indexOf(paramName) === -1) {
	      self[paramName] = paramValue;
	    }
	  });
	}

	/**
	 * List all the properties in SearchParameters and therefore all the known Algolia properties
	 * This doesn't contain any beta/hidden features.
	 * @private
	 */
	SearchParameters.PARAMETERS = keys(new SearchParameters());

	/**
	 * @private
	 * @param {object} partialState full or part of a state
	 * @return {object} a new object with the number keys as number
	 */
	SearchParameters._parseNumbers = function(partialState) {
	  // Do not reparse numbers in SearchParameters, they ought to be parsed already
	  if (partialState instanceof SearchParameters) return partialState;

	  var numbers = {};

	  var numberKeys = [
	    'aroundPrecision',
	    'aroundRadius',
	    'getRankingInfo',
	    'minWordSizefor2Typos',
	    'minWordSizefor1Typo',
	    'page',
	    'maxValuesPerFacet',
	    'distinct',
	    'minimumAroundRadius',
	    'hitsPerPage',
	    'minProximity'
	  ];

	  forEach(numberKeys, function(k) {
	    var value = partialState[k];
	    if (isString(value)) {
	      var parsedValue = parseFloat(value);
	      numbers[k] = isNaN(parsedValue) ? value : parsedValue;
	    }
	  });

	  if (partialState.numericRefinements) {
	    var numericRefinements = {};
	    forEach(partialState.numericRefinements, function(operators, attribute) {
	      numericRefinements[attribute] = {};
	      forEach(operators, function(values, operator) {
	        var parsedValues = map(values, function(v) {
	          if (isArray(v)) {
	            return map(v, function(vPrime) {
	              if (isString(vPrime)) {
	                return parseFloat(vPrime);
	              }
	              return vPrime;
	            });
	          } else if (isString(v)) {
	            return parseFloat(v);
	          }
	          return v;
	        });
	        numericRefinements[attribute][operator] = parsedValues;
	      });
	    });
	    numbers.numericRefinements = numericRefinements;
	  }

	  return merge({}, partialState, numbers);
	};

	/**
	 * Factory for SearchParameters
	 * @param {object|SearchParameters} newParameters existing parameters or partial
	 * object for the properties of a new SearchParameters
	 * @return {SearchParameters} frozen instance of SearchParameters
	 */
	SearchParameters.make = function makeSearchParameters(newParameters) {
	  var instance = new SearchParameters(newParameters);

	  forEach(newParameters.hierarchicalFacets, function(facet) {
	    if (facet.rootPath) {
	      var currentRefinement = instance.getHierarchicalRefinement(facet.name);

	      if (currentRefinement.length > 0 && currentRefinement[0].indexOf(facet.rootPath) !== 0) {
	        instance = instance.clearRefinements(facet.name);
	      }

	      // get it again in case it has been cleared
	      currentRefinement = instance.getHierarchicalRefinement(facet.name);
	      if (currentRefinement.length === 0) {
	        instance = instance.toggleHierarchicalFacetRefinement(facet.name, facet.rootPath);
	      }
	    }
	  });

	  return instance;
	};

	/**
	 * Validates the new parameters based on the previous state
	 * @param {SearchParameters} currentState the current state
	 * @param {object|SearchParameters} parameters the new parameters to set
	 * @return {Error|null} Error if the modification is invalid, null otherwise
	 */
	SearchParameters.validate = function(currentState, parameters) {
	  var params = parameters || {};

	  if (currentState.tagFilters && params.tagRefinements && params.tagRefinements.length > 0) {
	    return new Error(
	      '[Tags] Cannot switch from the managed tag API to the advanced API. It is probably ' +
	      'an error, if it is really what you want, you should first clear the tags with clearTags method.');
	  }

	  if (currentState.tagRefinements.length > 0 && params.tagFilters) {
	    return new Error(
	      '[Tags] Cannot switch from the advanced tag API to the managed API. It is probably ' +
	      'an error, if it is not, you should first clear the tags with clearTags method.');
	  }

	  if (currentState.numericFilters && params.numericRefinements && !isEmpty(params.numericRefinements)) {
	    return new Error(
	      "[Numeric filters] Can't switch from the advanced to the managed API. It" +
	      ' is probably an error, if this is really what you want, you have to first' +
	      ' clear the numeric filters.');
	  }

	  if (!isEmpty(currentState.numericRefinements) && params.numericFilters) {
	    return new Error(
	      "[Numeric filters] Can't switch from the managed API to the advanced. It" +
	      ' is probably an error, if this is really what you want, you have to first' +
	      ' clear the numeric filters.');
	  }

	  return null;
	};

	SearchParameters.prototype = {
	  constructor: SearchParameters,

	  /**
	   * Remove all refinements (disjunctive + conjunctive + excludes + numeric filters)
	   * @method
	   * @param {undefined|string|SearchParameters.clearCallback} [attribute] optionnal string or function
	   * - If not given, means to clear all the filters.
	   * - If `string`, means to clear all refinements for the `attribute` named filter.
	   * - If `function`, means to clear all the refinements that return truthy values.
	   * @return {SearchParameters}
	   */
	  clearRefinements: function clearRefinements(attribute) {
	    var clear = RefinementList.clearRefinement;
	    return this.setQueryParameters({
	      numericRefinements: this._clearNumericRefinements(attribute),
	      facetsRefinements: clear(this.facetsRefinements, attribute, 'conjunctiveFacet'),
	      facetsExcludes: clear(this.facetsExcludes, attribute, 'exclude'),
	      disjunctiveFacetsRefinements: clear(this.disjunctiveFacetsRefinements, attribute, 'disjunctiveFacet'),
	      hierarchicalFacetsRefinements: clear(this.hierarchicalFacetsRefinements, attribute, 'hierarchicalFacet')
	    });
	  },
	  /**
	   * Remove all the refined tags from the SearchParameters
	   * @method
	   * @return {SearchParameters}
	   */
	  clearTags: function clearTags() {
	    if (this.tagFilters === undefined && this.tagRefinements.length === 0) return this;

	    return this.setQueryParameters({
	      tagFilters: undefined,
	      tagRefinements: []
	    });
	  },
	  /**
	   * Set the index.
	   * @method
	   * @param {string} index the index name
	   * @return {SearchParameters}
	   */
	  setIndex: function setIndex(index) {
	    if (index === this.index) return this;

	    return this.setQueryParameters({
	      index: index
	    });
	  },
	  /**
	   * Query setter
	   * @method
	   * @param {string} newQuery value for the new query
	   * @return {SearchParameters}
	   */
	  setQuery: function setQuery(newQuery) {
	    if (newQuery === this.query) return this;

	    return this.setQueryParameters({
	      query: newQuery
	    });
	  },
	  /**
	   * Page setter
	   * @method
	   * @param {number} newPage new page number
	   * @return {SearchParameters}
	   */
	  setPage: function setPage(newPage) {
	    if (newPage === this.page) return this;

	    return this.setQueryParameters({
	      page: newPage
	    });
	  },
	  /**
	   * Facets setter
	   * The facets are the simple facets, used for conjunctive (and) facetting.
	   * @method
	   * @param {string[]} facets all the attributes of the algolia records used for conjunctive facetting
	   * @return {SearchParameters}
	   */
	  setFacets: function setFacets(facets) {
	    return this.setQueryParameters({
	      facets: facets
	    });
	  },
	  /**
	   * Disjunctive facets setter
	   * Change the list of disjunctive (or) facets the helper chan handle.
	   * @method
	   * @param {string[]} facets all the attributes of the algolia records used for disjunctive facetting
	   * @return {SearchParameters}
	   */
	  setDisjunctiveFacets: function setDisjunctiveFacets(facets) {
	    return this.setQueryParameters({
	      disjunctiveFacets: facets
	    });
	  },
	  /**
	   * HitsPerPage setter
	   * Hits per page represents the number of hits retrieved for this query
	   * @method
	   * @param {number} n number of hits retrieved per page of results
	   * @return {SearchParameters}
	   */
	  setHitsPerPage: function setHitsPerPage(n) {
	    if (this.hitsPerPage === n) return this;

	    return this.setQueryParameters({
	      hitsPerPage: n
	    });
	  },
	  /**
	   * typoTolerance setter
	   * Set the value of typoTolerance
	   * @method
	   * @param {string} typoTolerance new value of typoTolerance ("true", "false", "min" or "strict")
	   * @return {SearchParameters}
	   */
	  setTypoTolerance: function setTypoTolerance(typoTolerance) {
	    if (this.typoTolerance === typoTolerance) return this;

	    return this.setQueryParameters({
	      typoTolerance: typoTolerance
	    });
	  },
	  /**
	   * Add a numeric filter for a given attribute
	   * When value is an array, they are combined with OR
	   * When value is a single value, it will combined with AND
	   * @method
	   * @param {string} attribute attribute to set the filter on
	   * @param {string} operator operator of the filter (possible values: =, >, >=, <, <=, !=)
	   * @param {number | number[]} value value of the filter
	   * @return {SearchParameters}
	   * @example
	   * // for price = 50 or 40
	   * searchparameter.addNumericRefinement('price', '=', [50, 40]);
	   * @example
	   * // for size = 38 and 40
	   * searchparameter.addNumericRefinement('size', '=', 38);
	   * searchparameter.addNumericRefinement('size', '=', 40);
	   */
	  addNumericRefinement: function(attribute, operator, v) {
	    var value = valToNumber(v);

	    if (this.isNumericRefined(attribute, operator, value)) return this;

	    var mod = merge({}, this.numericRefinements);

	    mod[attribute] = merge({}, mod[attribute]);

	    if (mod[attribute][operator]) {
	      // Array copy
	      mod[attribute][operator] = mod[attribute][operator].slice();
	      // Add the element. Concat can't be used here because value can be an array.
	      mod[attribute][operator].push(value);
	    } else {
	      mod[attribute][operator] = [value];
	    }

	    return this.setQueryParameters({
	      numericRefinements: mod
	    });
	  },
	  /**
	   * Get the list of conjunctive refinements for a single facet
	   * @param {string} facetName name of the attribute used for facetting
	   * @return {string[]} list of refinements
	   */
	  getConjunctiveRefinements: function(facetName) {
	    if (!this.isConjunctiveFacet(facetName)) {
	      throw new Error(facetName + ' is not defined in the facets attribute of the helper configuration');
	    }
	    return this.facetsRefinements[facetName] || [];
	  },
	  /**
	   * Get the list of disjunctive refinements for a single facet
	   * @param {string} facetName name of the attribute used for facetting
	   * @return {string[]} list of refinements
	   */
	  getDisjunctiveRefinements: function(facetName) {
	    if (!this.isDisjunctiveFacet(facetName)) {
	      throw new Error(
	        facetName + ' is not defined in the disjunctiveFacets attribute of the helper configuration'
	      );
	    }
	    return this.disjunctiveFacetsRefinements[facetName] || [];
	  },
	  /**
	   * Get the list of hierarchical refinements for a single facet
	   * @param {string} facetName name of the attribute used for facetting
	   * @return {string[]} list of refinements
	   */
	  getHierarchicalRefinement: function(facetName) {
	    // we send an array but we currently do not support multiple
	    // hierarchicalRefinements for a hierarchicalFacet
	    return this.hierarchicalFacetsRefinements[facetName] || [];
	  },
	  /**
	   * Get the list of exclude refinements for a single facet
	   * @param {string} facetName name of the attribute used for facetting
	   * @return {string[]} list of refinements
	   */
	  getExcludeRefinements: function(facetName) {
	    if (!this.isConjunctiveFacet(facetName)) {
	      throw new Error(facetName + ' is not defined in the facets attribute of the helper configuration');
	    }
	    return this.facetsExcludes[facetName] || [];
	  },

	  /**
	   * Remove all the numeric filter for a given (attribute, operator)
	   * @method
	   * @param {string} attribute attribute to set the filter on
	   * @param {string} [operator] operator of the filter (possible values: =, >, >=, <, <=, !=)
	   * @param {number} [number] the value to be removed
	   * @return {SearchParameters}
	   */
	  removeNumericRefinement: function(attribute, operator, paramValue) {
	    if (paramValue !== undefined) {
	      var paramValueAsNumber = valToNumber(paramValue);
	      if (!this.isNumericRefined(attribute, operator, paramValueAsNumber)) return this;
	      return this.setQueryParameters({
	        numericRefinements: this._clearNumericRefinements(function(value, key) {
	          return key === attribute && value.op === operator && isEqual(value.val, paramValueAsNumber);
	        })
	      });
	    } else if (operator !== undefined) {
	      if (!this.isNumericRefined(attribute, operator)) return this;
	      return this.setQueryParameters({
	        numericRefinements: this._clearNumericRefinements(function(value, key) {
	          return key === attribute && value.op === operator;
	        })
	      });
	    }

	    if (!this.isNumericRefined(attribute)) return this;
	    return this.setQueryParameters({
	      numericRefinements: this._clearNumericRefinements(function(value, key) {
	        return key === attribute;
	      })
	    });
	  },
	  /**
	   * Get the list of numeric refinements for a single facet
	   * @param {string} facetName name of the attribute used for facetting
	   * @return {SearchParameters.OperatorList[]} list of refinements
	   */
	  getNumericRefinements: function(facetName) {
	    return this.numericRefinements[facetName] || {};
	  },
	  /**
	   * Return the current refinement for the (attribute, operator)
	   * @param {string} attribute of the record
	   * @param {string} operator applied
	   * @return {number} value of the refinement
	   */
	  getNumericRefinement: function(attribute, operator) {
	    return this.numericRefinements[attribute] && this.numericRefinements[attribute][operator];
	  },
	  /**
	   * Clear numeric filters.
	   * @method
	   * @private
	   * @param {string|SearchParameters.clearCallback} [attribute] optionnal string or function
	   * - If not given, means to clear all the filters.
	   * - If `string`, means to clear all refinements for the `attribute` named filter.
	   * - If `function`, means to clear all the refinements that return truthy values.
	   * @return {Object.<string, OperatorList>}
	   */
	  _clearNumericRefinements: function _clearNumericRefinements(attribute) {
	    if (isUndefined(attribute)) {
	      return {};
	    } else if (isString(attribute)) {
	      return omit(this.numericRefinements, attribute);
	    } else if (isFunction(attribute)) {
	      return reduce(this.numericRefinements, function(memo, operators, key) {
	        var operatorList = {};

	        forEach(operators, function(values, operator) {
	          var outValues = [];
	          forEach(values, function(value) {
	            var predicateResult = attribute({val: value, op: operator}, key, 'numeric');
	            if (!predicateResult) outValues.push(value);
	          });
	          if (!isEmpty(outValues)) operatorList[operator] = outValues;
	        });

	        if (!isEmpty(operatorList)) memo[key] = operatorList;

	        return memo;
	      }, {});
	    }
	  },
	  /**
	   * Add a facet to the facets attribute of the helper configuration, if it
	   * isn't already present.
	   * @method
	   * @param {string} facet facet name to add
	   * @return {SearchParameters}
	   */
	  addFacet: function addFacet(facet) {
	    if (this.isConjunctiveFacet(facet)) {
	      return this;
	    }

	    return this.setQueryParameters({
	      facets: this.facets.concat([facet])
	    });
	  },
	  /**
	   * Add a disjunctive facet to the disjunctiveFacets attribute of the helper
	   * configuration, if it isn't already present.
	   * @method
	   * @param {string} facet disjunctive facet name to add
	   * @return {SearchParameters}
	   */
	  addDisjunctiveFacet: function addDisjunctiveFacet(facet) {
	    if (this.isDisjunctiveFacet(facet)) {
	      return this;
	    }

	    return this.setQueryParameters({
	      disjunctiveFacets: this.disjunctiveFacets.concat([facet])
	    });
	  },
	  /**
	   * Add a hierarchical facet to the hierarchicalFacets attribute of the helper
	   * configuration.
	   * @method
	   * @param {object} hierarchicalFacet hierarchical facet to add
	   * @return {SearchParameters}
	   * @throws will throw an error if a hierarchical facet with the same name was already declared
	   */
	  addHierarchicalFacet: function addHierarchicalFacet(hierarchicalFacet) {
	    if (this.isHierarchicalFacet(hierarchicalFacet.name)) {
	      throw new Error(
	        'Cannot declare two hierarchical facets with the same name: `' + hierarchicalFacet.name + '`');
	    }

	    return this.setQueryParameters({
	      hierarchicalFacets: this.hierarchicalFacets.concat([hierarchicalFacet])
	    });
	  },
	  /**
	   * Add a refinement on a "normal" facet
	   * @method
	   * @param {string} facet attribute to apply the facetting on
	   * @param {string} value value of the attribute (will be converted to string)
	   * @return {SearchParameters}
	   */
	  addFacetRefinement: function addFacetRefinement(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }
	    if (RefinementList.isRefined(this.facetsRefinements, facet, value)) return this;

	    return this.setQueryParameters({
	      facetsRefinements: RefinementList.addRefinement(this.facetsRefinements, facet, value)
	    });
	  },
	  /**
	   * Exclude a value from a "normal" facet
	   * @method
	   * @param {string} facet attribute to apply the exclusion on
	   * @param {string} value value of the attribute (will be converted to string)
	   * @return {SearchParameters}
	   */
	  addExcludeRefinement: function addExcludeRefinement(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }
	    if (RefinementList.isRefined(this.facetsExcludes, facet, value)) return this;

	    return this.setQueryParameters({
	      facetsExcludes: RefinementList.addRefinement(this.facetsExcludes, facet, value)
	    });
	  },
	  /**
	   * Adds a refinement on a disjunctive facet.
	   * @method
	   * @param {string} facet attribute to apply the facetting on
	   * @param {string} value value of the attribute (will be converted to string)
	   * @return {SearchParameters}
	   */
	  addDisjunctiveFacetRefinement: function addDisjunctiveFacetRefinement(facet, value) {
	    if (!this.isDisjunctiveFacet(facet)) {
	      throw new Error(
	        facet + ' is not defined in the disjunctiveFacets attribute of the helper configuration');
	    }

	    if (RefinementList.isRefined(this.disjunctiveFacetsRefinements, facet, value)) return this;

	    return this.setQueryParameters({
	      disjunctiveFacetsRefinements: RefinementList.addRefinement(
	        this.disjunctiveFacetsRefinements, facet, value)
	    });
	  },
	  /**
	   * addTagRefinement adds a tag to the list used to filter the results
	   * @param {string} tag tag to be added
	   * @return {SearchParameters}
	   */
	  addTagRefinement: function addTagRefinement(tag) {
	    if (this.isTagRefined(tag)) return this;

	    var modification = {
	      tagRefinements: this.tagRefinements.concat(tag)
	    };

	    return this.setQueryParameters(modification);
	  },
	  /**
	   * Remove a facet from the facets attribute of the helper configuration, if it
	   * is present.
	   * @method
	   * @param {string} facet facet name to remove
	   * @return {SearchParameters}
	   */
	  removeFacet: function removeFacet(facet) {
	    if (!this.isConjunctiveFacet(facet)) {
	      return this;
	    }

	    return this.clearRefinements(facet).setQueryParameters({
	      facets: filter(this.facets, function(f) {
	        return f !== facet;
	      })
	    });
	  },
	  /**
	   * Remove a disjunctive facet from the disjunctiveFacets attribute of the
	   * helper configuration, if it is present.
	   * @method
	   * @param {string} facet disjunctive facet name to remove
	   * @return {SearchParameters}
	   */
	  removeDisjunctiveFacet: function removeDisjunctiveFacet(facet) {
	    if (!this.isDisjunctiveFacet(facet)) {
	      return this;
	    }

	    return this.clearRefinements(facet).setQueryParameters({
	      disjunctiveFacets: filter(this.disjunctiveFacets, function(f) {
	        return f !== facet;
	      })
	    });
	  },
	  /**
	   * Remove a hierarchical facet from the hierarchicalFacets attribute of the
	   * helper configuration, if it is present.
	   * @method
	   * @param {string} facet hierarchical facet name to remove
	   * @return {SearchParameters}
	   */
	  removeHierarchicalFacet: function removeHierarchicalFacet(facet) {
	    if (!this.isHierarchicalFacet(facet)) {
	      return this;
	    }

	    return this.clearRefinements(facet).setQueryParameters({
	      hierarchicalFacets: filter(this.hierarchicalFacets, function(f) {
	        return f.name !== facet;
	      })
	    });
	  },
	  /**
	   * Remove a refinement set on facet. If a value is provided, it will clear the
	   * refinement for the given value, otherwise it will clear all the refinement
	   * values for the facetted attribute.
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {string} [value] value used to filter
	   * @return {SearchParameters}
	   */
	  removeFacetRefinement: function removeFacetRefinement(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }
	    if (!RefinementList.isRefined(this.facetsRefinements, facet, value)) return this;

	    return this.setQueryParameters({
	      facetsRefinements: RefinementList.removeRefinement(this.facetsRefinements, facet, value)
	    });
	  },
	  /**
	   * Remove a negative refinement on a facet
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {string} value value used to filter
	   * @return {SearchParameters}
	   */
	  removeExcludeRefinement: function removeExcludeRefinement(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }
	    if (!RefinementList.isRefined(this.facetsExcludes, facet, value)) return this;

	    return this.setQueryParameters({
	      facetsExcludes: RefinementList.removeRefinement(this.facetsExcludes, facet, value)
	    });
	  },
	  /**
	   * Remove a refinement on a disjunctive facet
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {string} value value used to filter
	   * @return {SearchParameters}
	   */
	  removeDisjunctiveFacetRefinement: function removeDisjunctiveFacetRefinement(facet, value) {
	    if (!this.isDisjunctiveFacet(facet)) {
	      throw new Error(
	        facet + ' is not defined in the disjunctiveFacets attribute of the helper configuration');
	    }
	    if (!RefinementList.isRefined(this.disjunctiveFacetsRefinements, facet, value)) return this;

	    return this.setQueryParameters({
	      disjunctiveFacetsRefinements: RefinementList.removeRefinement(
	        this.disjunctiveFacetsRefinements, facet, value)
	    });
	  },
	  /**
	   * Remove a tag from the list of tag refinements
	   * @method
	   * @param {string} tag the tag to remove
	   * @return {SearchParameters}
	   */
	  removeTagRefinement: function removeTagRefinement(tag) {
	    if (!this.isTagRefined(tag)) return this;

	    var modification = {
	      tagRefinements: filter(this.tagRefinements, function(t) { return t !== tag; })
	    };

	    return this.setQueryParameters(modification);
	  },
	  /**
	   * Generic toggle refinement method to use with facet, disjunctive facets
	   * and hierarchical facets
	   * @param  {string} facet the facet to refine
	   * @param  {string} value the associated value
	   * @return {SearchParameters}
	   * @throws will throw an error if the facet is not declared in the settings of the helper
	   */
	  toggleRefinement: function toggleRefinement(facet, value) {
	    if (this.isHierarchicalFacet(facet)) {
	      return this.toggleHierarchicalFacetRefinement(facet, value);
	    } else if (this.isConjunctiveFacet(facet)) {
	      return this.toggleFacetRefinement(facet, value);
	    } else if (this.isDisjunctiveFacet(facet)) {
	      return this.toggleDisjunctiveFacetRefinement(facet, value);
	    }

	    throw new Error('Cannot refine the undeclared facet ' + facet +
	      '; it should be added to the helper options facets, disjunctiveFacets or hierarchicalFacets');
	  },
	  /**
	   * Switch the refinement applied over a facet/value
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {value} value value used for filtering
	   * @return {SearchParameters}
	   */
	  toggleFacetRefinement: function toggleFacetRefinement(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }

	    return this.setQueryParameters({
	      facetsRefinements: RefinementList.toggleRefinement(this.facetsRefinements, facet, value)
	    });
	  },
	  /**
	   * Switch the refinement applied over a facet/value
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {value} value value used for filtering
	   * @return {SearchParameters}
	   */
	  toggleExcludeFacetRefinement: function toggleExcludeFacetRefinement(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }

	    return this.setQueryParameters({
	      facetsExcludes: RefinementList.toggleRefinement(this.facetsExcludes, facet, value)
	    });
	  },
	  /**
	   * Switch the refinement applied over a facet/value
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {value} value value used for filtering
	   * @return {SearchParameters}
	   */
	  toggleDisjunctiveFacetRefinement: function toggleDisjunctiveFacetRefinement(facet, value) {
	    if (!this.isDisjunctiveFacet(facet)) {
	      throw new Error(
	        facet + ' is not defined in the disjunctiveFacets attribute of the helper configuration');
	    }

	    return this.setQueryParameters({
	      disjunctiveFacetsRefinements: RefinementList.toggleRefinement(
	        this.disjunctiveFacetsRefinements, facet, value)
	    });
	  },
	  /**
	   * Switch the refinement applied over a facet/value
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {value} value value used for filtering
	   * @return {SearchParameters}
	   */
	  toggleHierarchicalFacetRefinement: function toggleHierarchicalFacetRefinement(facet, value) {
	    if (!this.isHierarchicalFacet(facet)) {
	      throw new Error(
	        facet + ' is not defined in the hierarchicalFacets attribute of the helper configuration');
	    }

	    var separator = this._getHierarchicalFacetSeparator(this.getHierarchicalFacetByName(facet));

	    var mod = {};

	    var upOneOrMultipleLevel = this.hierarchicalFacetsRefinements[facet] !== undefined &&
	      this.hierarchicalFacetsRefinements[facet].length > 0 && (
	      // remove current refinement:
	      // refinement was 'beer > IPA', call is toggleRefine('beer > IPA'), refinement should be `beer`
	      this.hierarchicalFacetsRefinements[facet][0] === value ||
	      // remove a parent refinement of the current refinement:
	      //  - refinement was 'beer > IPA > Flying dog'
	      //  - call is toggleRefine('beer > IPA')
	      //  - refinement should be `beer`
	      this.hierarchicalFacetsRefinements[facet][0].indexOf(value + separator) === 0
	    );

	    if (upOneOrMultipleLevel) {
	      if (value.indexOf(separator) === -1) {
	        // go back to root level
	        mod[facet] = [];
	      } else {
	        mod[facet] = [value.slice(0, value.lastIndexOf(separator))];
	      }
	    } else {
	      mod[facet] = [value];
	    }

	    return this.setQueryParameters({
	      hierarchicalFacetsRefinements: defaults({}, mod, this.hierarchicalFacetsRefinements)
	    });
	  },

	  /**
	   * Adds a refinement on a hierarchical facet.
	   * @param {string} facet the facet name
	   * @param {string} path the hierarchical facet path
	   * @return {SearchParameter} the new state
	   * @throws Error if the facet is not defined or if the facet is refined
	   */
	  addHierarchicalFacetRefinement: function(facet, path) {
	    if (this.isHierarchicalFacetRefined(facet)) {
	      throw new Error(facet + ' is already refined.');
	    }
	    var mod = {};
	    mod[facet] = [path];
	    return this.setQueryParameters({
	      hierarchicalFacetsRefinements: defaults({}, mod, this.hierarchicalFacetsRefinements)
	    });
	  },

	  /**
	   * Removes the refinement set on a hierarchical facet.
	   * @param {string} facet the facet name
	   * @return {SearchParameter} the new state
	   * @throws Error if the facet is not defined or if the facet is not refined
	   */
	  removeHierarchicalFacetRefinement: function(facet) {
	    if (!this.isHierarchicalFacetRefined(facet)) {
	      throw new Error(facet + ' is not refined.');
	    }
	    var mod = {};
	    mod[facet] = [];
	    return this.setQueryParameters({
	      hierarchicalFacetsRefinements: defaults({}, mod, this.hierarchicalFacetsRefinements)
	    });
	  },
	  /**
	   * Switch the tag refinement
	   * @method
	   * @param {string} tag the tag to remove or add
	   * @return {SearchParameters}
	   */
	  toggleTagRefinement: function toggleTagRefinement(tag) {
	    if (this.isTagRefined(tag)) {
	      return this.removeTagRefinement(tag);
	    }

	    return this.addTagRefinement(tag);
	  },
	  /**
	   * Test if the facet name is from one of the disjunctive facets
	   * @method
	   * @param {string} facet facet name to test
	   * @return {boolean}
	   */
	  isDisjunctiveFacet: function(facet) {
	    return indexOf(this.disjunctiveFacets, facet) > -1;
	  },
	  /**
	   * Test if the facet name is from one of the hierarchical facets
	   * @method
	   * @param {string} facetName facet name to test
	   * @return {boolean}
	   */
	  isHierarchicalFacet: function(facetName) {
	    return this.getHierarchicalFacetByName(facetName) !== undefined;
	  },
	  /**
	   * Test if the facet name is from one of the conjunctive/normal facets
	   * @method
	   * @param {string} facet facet name to test
	   * @return {boolean}
	   */
	  isConjunctiveFacet: function(facet) {
	    return indexOf(this.facets, facet) > -1;
	  },
	  /**
	   * Returns true if the facet is refined, either for a specific value or in
	   * general.
	   * @method
	   * @param {string} facet name of the attribute for used for facetting
	   * @param {string} value, optionnal value. If passed will test that this value
	   * is filtering the given facet.
	   * @return {boolean} returns true if refined
	   */
	  isFacetRefined: function isFacetRefined(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }
	    return RefinementList.isRefined(this.facetsRefinements, facet, value);
	  },
	  /**
	   * Returns true if the facet contains exclusions or if a specific value is
	   * excluded.
	   *
	   * @method
	   * @param {string} facet name of the attribute for used for facetting
	   * @param {string} [value] optionnal value. If passed will test that this value
	   * is filtering the given facet.
	   * @return {boolean} returns true if refined
	   */
	  isExcludeRefined: function isExcludeRefined(facet, value) {
	    if (!this.isConjunctiveFacet(facet)) {
	      throw new Error(facet + ' is not defined in the facets attribute of the helper configuration');
	    }
	    return RefinementList.isRefined(this.facetsExcludes, facet, value);
	  },
	  /**
	   * Returns true if the facet contains a refinement, or if a value passed is a
	   * refinement for the facet.
	   * @method
	   * @param {string} facet name of the attribute for used for facetting
	   * @param {string} value optionnal, will test if the value is used for refinement
	   * if there is one, otherwise will test if the facet contains any refinement
	   * @return {boolean}
	   */
	  isDisjunctiveFacetRefined: function isDisjunctiveFacetRefined(facet, value) {
	    if (!this.isDisjunctiveFacet(facet)) {
	      throw new Error(
	        facet + ' is not defined in the disjunctiveFacets attribute of the helper configuration');
	    }
	    return RefinementList.isRefined(this.disjunctiveFacetsRefinements, facet, value);
	  },
	  /**
	   * Returns true if the facet contains a refinement, or if a value passed is a
	   * refinement for the facet.
	   * @method
	   * @param {string} facet name of the attribute for used for facetting
	   * @param {string} value optionnal, will test if the value is used for refinement
	   * if there is one, otherwise will test if the facet contains any refinement
	   * @return {boolean}
	   */
	  isHierarchicalFacetRefined: function isHierarchicalFacetRefined(facet, value) {
	    if (!this.isHierarchicalFacet(facet)) {
	      throw new Error(
	        facet + ' is not defined in the hierarchicalFacets attribute of the helper configuration');
	    }

	    var refinements = this.getHierarchicalRefinement(facet);

	    if (!value) {
	      return refinements.length > 0;
	    }

	    return indexOf(refinements, value) !== -1;
	  },
	  /**
	   * Test if the triple (attribute, operator, value) is already refined.
	   * If only the attribute and the operator are provided, it tests if the
	   * contains any refinement value.
	   * @method
	   * @param {string} attribute attribute for which the refinement is applied
	   * @param {string} [operator] operator of the refinement
	   * @param {string} [value] value of the refinement
	   * @return {boolean} true if it is refined
	   */
	  isNumericRefined: function isNumericRefined(attribute, operator, value) {
	    if (isUndefined(value) && isUndefined(operator)) {
	      return !!this.numericRefinements[attribute];
	    }

	    var isOperatorDefined = this.numericRefinements[attribute] &&
	      !isUndefined(this.numericRefinements[attribute][operator]);

	    if (isUndefined(value) || !isOperatorDefined) {
	      return isOperatorDefined;
	    }

	    var parsedValue = valToNumber(value);
	    var isAttributeValueDefined = !isUndefined(
	      findArray(this.numericRefinements[attribute][operator], parsedValue)
	    );

	    return isOperatorDefined && isAttributeValueDefined;
	  },
	  /**
	   * Returns true if the tag refined, false otherwise
	   * @method
	   * @param {string} tag the tag to check
	   * @return {boolean}
	   */
	  isTagRefined: function isTagRefined(tag) {
	    return indexOf(this.tagRefinements, tag) !== -1;
	  },
	  /**
	   * Returns the list of all disjunctive facets refined
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {value} value value used for filtering
	   * @return {string[]}
	   */
	  getRefinedDisjunctiveFacets: function getRefinedDisjunctiveFacets() {
	    // attributes used for numeric filter can also be disjunctive
	    var disjunctiveNumericRefinedFacets = intersection(
	      keys(this.numericRefinements),
	      this.disjunctiveFacets
	    );

	    return keys(this.disjunctiveFacetsRefinements)
	      .concat(disjunctiveNumericRefinedFacets)
	      .concat(this.getRefinedHierarchicalFacets());
	  },
	  /**
	   * Returns the list of all disjunctive facets refined
	   * @method
	   * @param {string} facet name of the attribute used for facetting
	   * @param {value} value value used for filtering
	   * @return {string[]}
	   */
	  getRefinedHierarchicalFacets: function getRefinedHierarchicalFacets() {
	    return intersection(
	      // enforce the order between the two arrays,
	      // so that refinement name index === hierarchical facet index
	      map(this.hierarchicalFacets, 'name'),
	      keys(this.hierarchicalFacetsRefinements)
	    );
	  },
	  /**
	   * Returned the list of all disjunctive facets not refined
	   * @method
	   * @return {string[]}
	   */
	  getUnrefinedDisjunctiveFacets: function() {
	    var refinedFacets = this.getRefinedDisjunctiveFacets();

	    return filter(this.disjunctiveFacets, function(f) {
	      return indexOf(refinedFacets, f) === -1;
	    });
	  },

	  managedParameters: [
	    'index',
	    'facets', 'disjunctiveFacets', 'facetsRefinements',
	    'facetsExcludes', 'disjunctiveFacetsRefinements',
	    'numericRefinements', 'tagRefinements', 'hierarchicalFacets', 'hierarchicalFacetsRefinements'
	  ],
	  getQueryParams: function getQueryParams() {
	    var managedParameters = this.managedParameters;

	    var queryParams = {};

	    forOwn(this, function(paramValue, paramName) {
	      if (indexOf(managedParameters, paramName) === -1 && paramValue !== undefined) {
	        queryParams[paramName] = paramValue;
	      }
	    });

	    return queryParams;
	  },
	  /**
	   * Let the user retrieve any parameter value from the SearchParameters
	   * @param {string} paramName name of the parameter
	   * @return {any} the value of the parameter
	   */
	  getQueryParameter: function getQueryParameter(paramName) {
	    if (!this.hasOwnProperty(paramName)) {
	      throw new Error(
	        "Parameter '" + paramName + "' is not an attribute of SearchParameters " +
	        '(http://algolia.github.io/algoliasearch-helper-js/docs/SearchParameters.html)');
	    }

	    return this[paramName];
	  },
	  /**
	   * Let the user set a specific value for a given parameter. Will return the
	   * same instance if the parameter is invalid or if the value is the same as the
	   * previous one.
	   * @method
	   * @param {string} parameter the parameter name
	   * @param {any} value the value to be set, must be compliant with the definition
	   * of the attribute on the object
	   * @return {SearchParameters} the updated state
	   */
	  setQueryParameter: function setParameter(parameter, value) {
	    if (this[parameter] === value) return this;

	    var modification = {};

	    modification[parameter] = value;

	    return this.setQueryParameters(modification);
	  },
	  /**
	   * Let the user set any of the parameters with a plain object.
	   * @method
	   * @param {object} params all the keys and the values to be updated
	   * @return {SearchParameters} a new updated instance
	   */
	  setQueryParameters: function setQueryParameters(params) {
	    if (!params) return this;

	    var error = SearchParameters.validate(this, params);

	    if (error) {
	      throw error;
	    }

	    var parsedParams = SearchParameters._parseNumbers(params);

	    return this.mutateMe(function mergeWith(newInstance) {
	      var ks = keys(params);

	      forEach(ks, function(k) {
	        newInstance[k] = parsedParams[k];
	      });

	      return newInstance;
	    });
	  },

	  /**
	   * Returns an object with only the selected attributes.
	   * @param {string[]} filters filters to retrieve only a subset of the state. It
	   * accepts strings that can be either attributes of the SearchParameters (e.g. hitsPerPage)
	   * or attributes of the index with the notation 'attribute:nameOfMyAttribute'
	   * @return {object}
	   */
	  filter: function(filters) {
	    return filterState(this, filters);
	  },
	  /**
	   * Helper function to make it easier to build new instances from a mutating
	   * function
	   * @private
	   * @param {function} fn newMutableState -> previousState -> () function that will
	   * change the value of the newMutable to the desired state
	   * @return {SearchParameters} a new instance with the specified modifications applied
	   */
	  mutateMe: function mutateMe(fn) {
	    var newState = new this.constructor(this);

	    fn(newState, this);
	    return newState;
	  },

	  /**
	   * Helper function to get the hierarchicalFacet separator or the default one (`>`)
	   * @param  {object} hierarchicalFacet
	   * @return {string} returns the hierarchicalFacet.separator or `>` as default
	   */
	  _getHierarchicalFacetSortBy: function(hierarchicalFacet) {
	    return hierarchicalFacet.sortBy || ['isRefined:desc', 'name:asc'];
	  },

	  /**
	   * Helper function to get the hierarchicalFacet separator or the default one (`>`)
	   * @private
	   * @param  {object} hierarchicalFacet
	   * @return {string} returns the hierarchicalFacet.separator or `>` as default
	   */
	  _getHierarchicalFacetSeparator: function(hierarchicalFacet) {
	    return hierarchicalFacet.separator || ' > ';
	  },

	  /**
	   * Helper function to get the hierarchicalFacet prefix path or null
	   * @private
	   * @param  {object} hierarchicalFacet
	   * @return {string} returns the hierarchicalFacet.rootPath or null as default
	   */
	  _getHierarchicalRootPath: function(hierarchicalFacet) {
	    return hierarchicalFacet.rootPath || null;
	  },

	  /**
	   * Helper function to check if we show the parent level of the hierarchicalFacet
	   * @private
	   * @param  {object} hierarchicalFacet
	   * @return {string} returns the hierarchicalFacet.showParentLevel or true as default
	   */
	  _getHierarchicalShowParentLevel: function(hierarchicalFacet) {
	    if (typeof hierarchicalFacet.showParentLevel === 'boolean') {
	      return hierarchicalFacet.showParentLevel;
	    }
	    return true;
	  },

	  /**
	   * Helper function to get the hierarchicalFacet by it's name
	   * @param  {string} hierarchicalFacetName
	   * @return {object} a hierarchicalFacet
	   */
	  getHierarchicalFacetByName: function(hierarchicalFacetName) {
	    return find(
	      this.hierarchicalFacets,
	      {name: hierarchicalFacetName}
	    );
	  },

	  /**
	   * Get the current breadcrumb for a hierarchical facet, as an array
	   * @param  {string} facetName Hierarchical facet name
	   * @return {array.<string>} the path as an array of string
	   */
	  getHierarchicalFacetBreadcrumb: function(facetName) {
	    if (!this.isHierarchicalFacet(facetName)) {
	      throw new Error(
	        'Cannot get the breadcrumb of an unknown hierarchical facet: `' + facetName + '`');
	    }

	    var refinement = this.getHierarchicalRefinement(facetName)[0];
	    if (!refinement) return [];

	    var separator = this._getHierarchicalFacetSeparator(
	      this.getHierarchicalFacetByName(facetName)
	    );
	    var path = refinement.split(separator);
	    return map(path, trim);
	  }
	};

	/**
	 * Callback used for clearRefinement method
	 * @callback SearchParameters.clearCallback
	 * @param {OperatorList|FacetList} value the value of the filter
	 * @param {string} key the current attribute name
	 * @param {string} type `numeric`, `disjunctiveFacet`, `conjunctiveFacet`, `hierarchicalFacet` or `exclude`
	 * depending on the type of facet
	 * @return {boolean} `true` if the element should be removed. `false` otherwise.
	 */
	module.exports = SearchParameters;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var arrayLikeKeys = __webpack_require__(41),
	    baseKeys = __webpack_require__(62),
	    isArrayLike = __webpack_require__(66);

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
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	module.exports = keys;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(42),
	    isArguments = __webpack_require__(43),
	    isArray = __webpack_require__(52),
	    isBuffer = __webpack_require__(53),
	    isIndex = __webpack_require__(56),
	    isTypedArray = __webpack_require__(57);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = arrayLikeKeys;


/***/ },
/* 42 */
/***/ function(module, exports) {

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

	module.exports = baseTimes;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsArguments = __webpack_require__(44),
	    isObjectLike = __webpack_require__(51);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

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
	var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};

	module.exports = isArguments;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(45),
	    isObjectLike = __webpack_require__(51);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike(value) && baseGetTag(value) == argsTag;
	}

	module.exports = baseIsArguments;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(46),
	    getRawTag = __webpack_require__(49),
	    objectToString = __webpack_require__(50);

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

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
	  value = Object(value);
	  return (symToStringTag && symToStringTag in value)
	    ? getRawTag(value)
	    : objectToString(value);
	}

	module.exports = baseGetTag;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(47);

	/** Built-in value references. */
	var Symbol = root.Symbol;

	module.exports = Symbol;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var freeGlobal = __webpack_require__(48);

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	module.exports = root;


/***/ },
/* 48 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	module.exports = freeGlobal;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(46);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

	module.exports = getRawTag;


/***/ },
/* 50 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

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

	module.exports = objectToString;


/***/ },
/* 51 */
/***/ function(module, exports) {

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

	module.exports = isObjectLike;


/***/ },
/* 52 */
/***/ function(module, exports) {

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

	module.exports = isArray;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(47),
	    stubFalse = __webpack_require__(55);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

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
	var isBuffer = nativeIsBuffer || stubFalse;

	module.exports = isBuffer;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(54)(module)))

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 55 */
/***/ function(module, exports) {

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

	module.exports = stubFalse;


/***/ },
/* 56 */
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

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
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	module.exports = isIndex;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsTypedArray = __webpack_require__(58),
	    baseUnary = __webpack_require__(60),
	    nodeUtil = __webpack_require__(61);

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

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
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	module.exports = isTypedArray;


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(45),
	    isLength = __webpack_require__(59),
	    isObjectLike = __webpack_require__(51);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}

	module.exports = baseIsTypedArray;


/***/ },
/* 59 */
/***/ function(module, exports) {

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

	module.exports = isLength;


/***/ },
/* 60 */
/***/ function(module, exports) {

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

	module.exports = baseUnary;


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(48);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(54)(module)))

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var isPrototype = __webpack_require__(63),
	    nativeKeys = __webpack_require__(64);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = baseKeys;


/***/ },
/* 63 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	module.exports = isPrototype;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(65);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);

	module.exports = nativeKeys;


/***/ },
/* 65 */
/***/ function(module, exports) {

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

	module.exports = overArg;


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(67),
	    isLength = __webpack_require__(59);

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
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	module.exports = isArrayLike;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(45),
	    isObject = __webpack_require__(68);

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
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
	  if (!isObject(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	module.exports = isFunction;


/***/ },
/* 68 */
/***/ function(module, exports) {

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

	module.exports = isObject;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(70),
	    baseIntersection = __webpack_require__(71),
	    baseRest = __webpack_require__(112),
	    castArrayLikeObject = __webpack_require__(121);

	/**
	 * Creates an array of unique values that are included in all given arrays
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons. The order and references of result values are
	 * determined by the first array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {...Array} [arrays] The arrays to inspect.
	 * @returns {Array} Returns the new array of intersecting values.
	 * @example
	 *
	 * _.intersection([2, 1], [2, 3]);
	 * // => [2]
	 */
	var intersection = baseRest(function(arrays) {
	  var mapped = arrayMap(arrays, castArrayLikeObject);
	  return (mapped.length && mapped[0] === arrays[0])
	    ? baseIntersection(mapped)
	    : [];
	});

	module.exports = intersection;


/***/ },
/* 70 */
/***/ function(module, exports) {

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

	module.exports = arrayMap;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(72),
	    arrayIncludes = __webpack_require__(105),
	    arrayIncludesWith = __webpack_require__(110),
	    arrayMap = __webpack_require__(70),
	    baseUnary = __webpack_require__(60),
	    cacheHas = __webpack_require__(111);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;

	/**
	 * The base implementation of methods like `_.intersection`, without support
	 * for iteratee shorthands, that accepts an array of arrays to inspect.
	 *
	 * @private
	 * @param {Array} arrays The arrays to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new array of shared values.
	 */
	function baseIntersection(arrays, iteratee, comparator) {
	  var includes = comparator ? arrayIncludesWith : arrayIncludes,
	      length = arrays[0].length,
	      othLength = arrays.length,
	      othIndex = othLength,
	      caches = Array(othLength),
	      maxLength = Infinity,
	      result = [];

	  while (othIndex--) {
	    var array = arrays[othIndex];
	    if (othIndex && iteratee) {
	      array = arrayMap(array, baseUnary(iteratee));
	    }
	    maxLength = nativeMin(array.length, maxLength);
	    caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
	      ? new SetCache(othIndex && array)
	      : undefined;
	  }
	  array = arrays[0];

	  var index = -1,
	      seen = caches[0];

	  outer:
	  while (++index < length && result.length < maxLength) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;

	    value = (comparator || value !== 0) ? value : 0;
	    if (!(seen
	          ? cacheHas(seen, computed)
	          : includes(result, computed, comparator)
	        )) {
	      othIndex = othLength;
	      while (--othIndex) {
	        var cache = caches[othIndex];
	        if (!(cache
	              ? cacheHas(cache, computed)
	              : includes(arrays[othIndex], computed, comparator))
	            ) {
	          continue outer;
	        }
	      }
	      if (seen) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}

	module.exports = baseIntersection;


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(73),
	    setCacheAdd = __webpack_require__(103),
	    setCacheHas = __webpack_require__(104);

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

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

	module.exports = SetCache;


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var mapCacheClear = __webpack_require__(74),
	    mapCacheDelete = __webpack_require__(97),
	    mapCacheGet = __webpack_require__(100),
	    mapCacheHas = __webpack_require__(101),
	    mapCacheSet = __webpack_require__(102);

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
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	module.exports = MapCache;


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var Hash = __webpack_require__(75),
	    ListCache = __webpack_require__(88),
	    Map = __webpack_require__(96);

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
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	module.exports = mapCacheClear;


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var hashClear = __webpack_require__(76),
	    hashDelete = __webpack_require__(84),
	    hashGet = __webpack_require__(85),
	    hashHas = __webpack_require__(86),
	    hashSet = __webpack_require__(87);

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
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	module.exports = Hash;


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(77);

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	  this.size = 0;
	}

	module.exports = hashClear;


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(78);

	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');

	module.exports = nativeCreate;


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsNative = __webpack_require__(79),
	    getValue = __webpack_require__(83);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	module.exports = getNative;


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(67),
	    isMasked = __webpack_require__(80),
	    isObject = __webpack_require__(68),
	    toSource = __webpack_require__(82);

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
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
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	module.exports = baseIsNative;


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var coreJsData = __webpack_require__(81);

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
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

	module.exports = isMasked;


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(47);

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	module.exports = coreJsData;


/***/ },
/* 82 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var funcProto = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

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
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	module.exports = toSource;


/***/ },
/* 83 */
/***/ function(module, exports) {

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

	module.exports = getValue;


/***/ },
/* 84 */
/***/ function(module, exports) {

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

	module.exports = hashDelete;


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(77);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	module.exports = hashGet;


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(77);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}

	module.exports = hashHas;


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(77);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

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
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	module.exports = hashSet;


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(89),
	    listCacheDelete = __webpack_require__(90),
	    listCacheGet = __webpack_require__(93),
	    listCacheHas = __webpack_require__(94),
	    listCacheSet = __webpack_require__(95);

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
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	module.exports = ListCache;


/***/ },
/* 89 */
/***/ function(module, exports) {

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

	module.exports = listCacheClear;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(91);

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
	      index = assocIndexOf(data, key);

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

	module.exports = listCacheDelete;


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(92);

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
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	module.exports = assocIndexOf;


/***/ },
/* 92 */
/***/ function(module, exports) {

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

	module.exports = eq;


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(91);

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
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	module.exports = listCacheGet;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(91);

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
	  return assocIndexOf(this.__data__, key) > -1;
	}

	module.exports = listCacheHas;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(91);

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
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	module.exports = listCacheSet;


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(78),
	    root = __webpack_require__(47);

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');

	module.exports = Map;


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(98);

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
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	module.exports = mapCacheDelete;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var isKeyable = __webpack_require__(99);

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
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	module.exports = getMapData;


/***/ },
/* 99 */
/***/ function(module, exports) {

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

	module.exports = isKeyable;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(98);

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
	  return getMapData(this, key).get(key);
	}

	module.exports = mapCacheGet;


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(98);

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
	  return getMapData(this, key).has(key);
	}

	module.exports = mapCacheHas;


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(98);

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
	  var data = getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	module.exports = mapCacheSet;


/***/ },
/* 103 */
/***/ function(module, exports) {

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

	module.exports = setCacheAdd;


/***/ },
/* 104 */
/***/ function(module, exports) {

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

	module.exports = setCacheHas;


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(106);

	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array == null ? 0 : array.length;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}

	module.exports = arrayIncludes;


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var baseFindIndex = __webpack_require__(107),
	    baseIsNaN = __webpack_require__(108),
	    strictIndexOf = __webpack_require__(109);

	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  return value === value
	    ? strictIndexOf(array, value, fromIndex)
	    : baseFindIndex(array, baseIsNaN, fromIndex);
	}

	module.exports = baseIndexOf;


/***/ },
/* 107 */
/***/ function(module, exports) {

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

	module.exports = baseFindIndex;


/***/ },
/* 108 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}

	module.exports = baseIsNaN;


/***/ },
/* 109 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.indexOf` which performs strict equality
	 * comparisons of values, i.e. `===`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function strictIndexOf(array, value, fromIndex) {
	  var index = fromIndex - 1,
	      length = array.length;

	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}

	module.exports = strictIndexOf;


/***/ },
/* 110 */
/***/ function(module, exports) {

	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}

	module.exports = arrayIncludesWith;


/***/ },
/* 111 */
/***/ function(module, exports) {

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

	module.exports = cacheHas;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(113),
	    overRest = __webpack_require__(114),
	    setToString = __webpack_require__(116);

	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */
	function baseRest(func, start) {
	  return setToString(overRest(func, start, identity), func + '');
	}

	module.exports = baseRest;


/***/ },
/* 113 */
/***/ function(module, exports) {

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

	module.exports = identity;


/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(115);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */
	function overRest(func, start, transform) {
	  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = transform(array);
	    return apply(func, this, otherArgs);
	  };
	}

	module.exports = overRest;


/***/ },
/* 115 */
/***/ function(module, exports) {

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  switch (args.length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	module.exports = apply;


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var baseSetToString = __webpack_require__(117),
	    shortOut = __webpack_require__(120);

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString = shortOut(baseSetToString);

	module.exports = setToString;


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var constant = __webpack_require__(118),
	    defineProperty = __webpack_require__(119),
	    identity = __webpack_require__(113);

	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetToString = !defineProperty ? identity : function(func, string) {
	  return defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant(string),
	    'writable': true
	  });
	};

	module.exports = baseSetToString;


/***/ },
/* 118 */
/***/ function(module, exports) {

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */
	function constant(value) {
	  return function() {
	    return value;
	  };
	}

	module.exports = constant;


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(78);

	var defineProperty = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	module.exports = defineProperty;


/***/ },
/* 120 */
/***/ function(module, exports) {

	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800,
	    HOT_SPAN = 16;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeNow = Date.now;

	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */
	function shortOut(func) {
	  var count = 0,
	      lastCalled = 0;

	  return function() {
	    var stamp = nativeNow(),
	        remaining = HOT_SPAN - (stamp - lastCalled);

	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }
	    return func.apply(undefined, arguments);
	  };
	}

	module.exports = shortOut;


/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(122);

	/**
	 * Casts `value` to an empty array if it's not an array like object.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array|Object} Returns the cast array-like object.
	 */
	function castArrayLikeObject(value) {
	  return isArrayLikeObject(value) ? value : [];
	}

	module.exports = castArrayLikeObject;


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(66),
	    isObjectLike = __webpack_require__(51);

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	module.exports = isArrayLikeObject;


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(124),
	    castFunction = __webpack_require__(127);

	/**
	 * Iterates over own enumerable string keyed properties of an object and
	 * invokes `iteratee` for each property. The iteratee is invoked with three
	 * arguments: (value, key, object). Iteratee functions may exit iteration
	 * early by explicitly returning `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.3.0
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 * @see _.forOwnRight
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.forOwn(new Foo, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
	 */
	function forOwn(object, iteratee) {
	  return object && baseForOwn(object, castFunction(iteratee));
	}

	module.exports = forOwn;


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(125),
	    keys = __webpack_require__(40);

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}

	module.exports = baseForOwn;


/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(126);

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
	var baseFor = createBaseFor();

	module.exports = baseFor;


/***/ },
/* 126 */
/***/ function(module, exports) {

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

	module.exports = createBaseFor;


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(113);

	/**
	 * Casts `value` to `identity` if it's not a function.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Function} Returns cast function.
	 */
	function castFunction(value) {
	  return typeof value == 'function' ? value : identity;
	}

	module.exports = castFunction;


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(129),
	    baseEach = __webpack_require__(130),
	    castFunction = __webpack_require__(127),
	    isArray = __webpack_require__(52);

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
	  var func = isArray(collection) ? arrayEach : baseEach;
	  return func(collection, castFunction(iteratee));
	}

	module.exports = forEach;


/***/ },
/* 129 */
/***/ function(module, exports) {

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

	module.exports = arrayEach;


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(124),
	    createBaseEach = __webpack_require__(131);

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);

	module.exports = baseEach;


/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(66);

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
	    if (!isArrayLike(collection)) {
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

	module.exports = createBaseEach;


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(133),
	    baseFilter = __webpack_require__(134),
	    baseIteratee = __webpack_require__(135),
	    isArray = __webpack_require__(52);

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
	 */
	function filter(collection, predicate) {
	  var func = isArray(collection) ? arrayFilter : baseFilter;
	  return func(collection, baseIteratee(predicate, 3));
	}

	module.exports = filter;


/***/ },
/* 133 */
/***/ function(module, exports) {

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

	module.exports = arrayFilter;


/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(130);

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
	  baseEach(collection, function(value, index, collection) {
	    if (predicate(value, index, collection)) {
	      result.push(value);
	    }
	  });
	  return result;
	}

	module.exports = baseFilter;


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(136),
	    baseMatchesProperty = __webpack_require__(161),
	    identity = __webpack_require__(113),
	    isArray = __webpack_require__(52),
	    property = __webpack_require__(176);

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
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

	module.exports = baseIteratee;


/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(137),
	    getMatchData = __webpack_require__(158),
	    matchesStrictComparable = __webpack_require__(160);

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	module.exports = baseMatches;


/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(138),
	    baseIsEqual = __webpack_require__(144);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

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
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	module.exports = baseIsMatch;


/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(88),
	    stackClear = __webpack_require__(139),
	    stackDelete = __webpack_require__(140),
	    stackGet = __webpack_require__(141),
	    stackHas = __webpack_require__(142),
	    stackSet = __webpack_require__(143);

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	module.exports = Stack;


/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(88);

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	  this.size = 0;
	}

	module.exports = stackClear;


/***/ },
/* 140 */
/***/ function(module, exports) {

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

	module.exports = stackDelete;


/***/ },
/* 141 */
/***/ function(module, exports) {

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

	module.exports = stackGet;


/***/ },
/* 142 */
/***/ function(module, exports) {

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

	module.exports = stackHas;


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(88),
	    Map = __webpack_require__(96),
	    MapCache = __webpack_require__(73);

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
	  if (data instanceof ListCache) {
	    var pairs = data.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	module.exports = stackSet;


/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(145),
	    isObject = __webpack_require__(68),
	    isObjectLike = __webpack_require__(51);

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
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}

	module.exports = baseIsEqual;


/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(138),
	    equalArrays = __webpack_require__(146),
	    equalByTag = __webpack_require__(148),
	    equalObjects = __webpack_require__(152),
	    getTag = __webpack_require__(153),
	    isArray = __webpack_require__(52),
	    isBuffer = __webpack_require__(53),
	    isTypedArray = __webpack_require__(57);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;

	  if (!objIsArr) {
	    objTag = getTag(object);
	    objTag = objTag == argsTag ? objectTag : objTag;
	  }
	  if (!othIsArr) {
	    othTag = getTag(other);
	    othTag = othTag == argsTag ? objectTag : othTag;
	  }
	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	module.exports = baseIsEqualDeep;


/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(72),
	    arraySome = __webpack_require__(147),
	    cacheHas = __webpack_require__(111);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

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
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

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
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
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

	module.exports = equalArrays;


/***/ },
/* 147 */
/***/ function(module, exports) {

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

	module.exports = arraySome;


/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(46),
	    Uint8Array = __webpack_require__(149),
	    eq = __webpack_require__(92),
	    equalArrays = __webpack_require__(146),
	    mapToArray = __webpack_require__(150),
	    setToArray = __webpack_require__(151);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
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
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	module.exports = equalByTag;


/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(47);

	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;

	module.exports = Uint8Array;


/***/ },
/* 150 */
/***/ function(module, exports) {

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

	module.exports = mapToArray;


/***/ },
/* 151 */
/***/ function(module, exports) {

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

	module.exports = setToArray;


/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(40);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
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

	module.exports = equalObjects;


/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(154),
	    Map = __webpack_require__(96),
	    Promise = __webpack_require__(155),
	    Set = __webpack_require__(156),
	    WeakMap = __webpack_require__(157),
	    baseGetTag = __webpack_require__(45),
	    toSource = __webpack_require__(82);

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	module.exports = getTag;


/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(78),
	    root = __webpack_require__(47);

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');

	module.exports = DataView;


/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(78),
	    root = __webpack_require__(47);

	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');

	module.exports = Promise;


/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(78),
	    root = __webpack_require__(47);

	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');

	module.exports = Set;


/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(78),
	    root = __webpack_require__(47);

	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');

	module.exports = WeakMap;


/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(159),
	    keys = __webpack_require__(40);

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}

	module.exports = getMatchData;


/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(68);

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}

	module.exports = isStrictComparable;


/***/ },
/* 160 */
/***/ function(module, exports) {

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

	module.exports = matchesStrictComparable;


/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(144),
	    get = __webpack_require__(162),
	    hasIn = __webpack_require__(173),
	    isKey = __webpack_require__(165),
	    isStrictComparable = __webpack_require__(159),
	    matchesStrictComparable = __webpack_require__(160),
	    toKey = __webpack_require__(172);

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
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}

	module.exports = baseMatchesProperty;


/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(163);

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
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}

	module.exports = get;


/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(164),
	    toKey = __webpack_require__(172);

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = castPath(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	module.exports = baseGet;


/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(52),
	    isKey = __webpack_require__(165),
	    stringToPath = __webpack_require__(167),
	    toString = __webpack_require__(170);

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray(value)) {
	    return value;
	  }
	  return isKey(value, object) ? [value] : stringToPath(toString(value));
	}

	module.exports = castPath;


/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(52),
	    isSymbol = __webpack_require__(166);

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
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	module.exports = isKey;


/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(45),
	    isObjectLike = __webpack_require__(51);

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

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
	    (isObjectLike(value) && baseGetTag(value) == symbolTag);
	}

	module.exports = isSymbol;


/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	var memoizeCapped = __webpack_require__(168);

	/** Used to match property names within property paths. */
	var reLeadingDot = /^\./,
	    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoizeCapped(function(string) {
	  var result = [];
	  if (reLeadingDot.test(string)) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

	module.exports = stringToPath;


/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	var memoize = __webpack_require__(169);

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
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

	module.exports = memoizeCapped;


/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(73);

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
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize.Cache = MapCache;

	module.exports = memoize;


/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(171);

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
	  return value == null ? '' : baseToString(value);
	}

	module.exports = toString;


/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(46),
	    arrayMap = __webpack_require__(70),
	    isArray = __webpack_require__(52),
	    isSymbol = __webpack_require__(166);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

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
	  if (isArray(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	module.exports = baseToString;


/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(166);

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
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	module.exports = toKey;


/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(174),
	    hasPath = __webpack_require__(175);

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
	  return object != null && hasPath(object, path, baseHasIn);
	}

	module.exports = hasIn;


/***/ },
/* 174 */
/***/ function(module, exports) {

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

	module.exports = baseHasIn;


/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(164),
	    isArguments = __webpack_require__(43),
	    isArray = __webpack_require__(52),
	    isIndex = __webpack_require__(56),
	    isLength = __webpack_require__(59),
	    toKey = __webpack_require__(172);

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
	  path = castPath(path, object);

	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isArguments(object));
	}

	module.exports = hasPath;


/***/ },
/* 176 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(177),
	    basePropertyDeep = __webpack_require__(178),
	    isKey = __webpack_require__(165),
	    toKey = __webpack_require__(172);

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
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}

	module.exports = property;


/***/ },
/* 177 */
/***/ function(module, exports) {

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

	module.exports = baseProperty;


/***/ },
/* 178 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(163);

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}

	module.exports = basePropertyDeep;


/***/ },
/* 179 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(70),
	    baseIteratee = __webpack_require__(135),
	    baseMap = __webpack_require__(180),
	    isArray = __webpack_require__(52);

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
	  var func = isArray(collection) ? arrayMap : baseMap;
	  return func(collection, baseIteratee(iteratee, 3));
	}

	module.exports = map;


/***/ },
/* 180 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(130),
	    isArrayLike = __webpack_require__(66);

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
	      result = isArrayLike(collection) ? Array(collection.length) : [];

	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}

	module.exports = baseMap;


/***/ },
/* 181 */
/***/ function(module, exports, __webpack_require__) {

	var arrayReduce = __webpack_require__(182),
	    baseEach = __webpack_require__(130),
	    baseIteratee = __webpack_require__(135),
	    baseReduce = __webpack_require__(183),
	    isArray = __webpack_require__(52);

	/**
	 * Reduces `collection` to a value which is the accumulated result of running
	 * each element in `collection` thru `iteratee`, where each successive
	 * invocation is supplied the return value of the previous. If `accumulator`
	 * is not given, the first element of `collection` is used as the initial
	 * value. The iteratee is invoked with four arguments:
	 * (accumulator, value, index|key, collection).
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.reduce`, `_.reduceRight`, and `_.transform`.
	 *
	 * The guarded methods are:
	 * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
	 * and `sortBy`
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @returns {*} Returns the accumulated value.
	 * @see _.reduceRight
	 * @example
	 *
	 * _.reduce([1, 2], function(sum, n) {
	 *   return sum + n;
	 * }, 0);
	 * // => 3
	 *
	 * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
	 *   (result[value] || (result[value] = [])).push(key);
	 *   return result;
	 * }, {});
	 * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
	 */
	function reduce(collection, iteratee, accumulator) {
	  var func = isArray(collection) ? arrayReduce : baseReduce,
	      initAccum = arguments.length < 3;

	  return func(collection, baseIteratee(iteratee, 4), accumulator, initAccum, baseEach);
	}

	module.exports = reduce;


/***/ },
/* 182 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	module.exports = arrayReduce;


/***/ },
/* 183 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.reduce` and `_.reduceRight`, without support
	 * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} accumulator The initial value.
	 * @param {boolean} initAccum Specify using the first or last element of
	 *  `collection` as the initial value.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @returns {*} Returns the accumulated value.
	 */
	function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
	  eachFunc(collection, function(value, index, collection) {
	    accumulator = initAccum
	      ? (initAccum = false, value)
	      : iteratee(accumulator, value, index, collection);
	  });
	  return accumulator;
	}

	module.exports = baseReduce;


/***/ },
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(70),
	    baseClone = __webpack_require__(185),
	    baseUnset = __webpack_require__(219),
	    castPath = __webpack_require__(164),
	    copyObject = __webpack_require__(189),
	    flatRest = __webpack_require__(223),
	    getAllKeysIn = __webpack_require__(205);

	/** Used to compose bitmasks for cloning. */
	var CLONE_DEEP_FLAG = 1,
	    CLONE_FLAT_FLAG = 2,
	    CLONE_SYMBOLS_FLAG = 4;

	/**
	 * The opposite of `_.pick`; this method creates an object composed of the
	 * own and inherited enumerable property paths of `object` that are not omitted.
	 *
	 * **Note:** This method is considerably slower than `_.pick`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [paths] The property paths to omit.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.omit(object, ['a', 'c']);
	 * // => { 'b': '2' }
	 */
	var omit = flatRest(function(object, paths) {
	  var result = {};
	  if (object == null) {
	    return result;
	  }
	  var isDeep = false;
	  paths = arrayMap(paths, function(path) {
	    path = castPath(path, object);
	    isDeep || (isDeep = path.length > 1);
	    return path;
	  });
	  copyObject(object, getAllKeysIn(object), result);
	  if (isDeep) {
	    result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG);
	  }
	  var length = paths.length;
	  while (length--) {
	    baseUnset(result, paths[length]);
	  }
	  return result;
	});

	module.exports = omit;


/***/ },
/* 185 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(138),
	    arrayEach = __webpack_require__(129),
	    assignValue = __webpack_require__(186),
	    baseAssign = __webpack_require__(188),
	    baseAssignIn = __webpack_require__(190),
	    cloneBuffer = __webpack_require__(194),
	    copyArray = __webpack_require__(195),
	    copySymbols = __webpack_require__(196),
	    copySymbolsIn = __webpack_require__(199),
	    getAllKeys = __webpack_require__(203),
	    getAllKeysIn = __webpack_require__(205),
	    getTag = __webpack_require__(153),
	    initCloneArray = __webpack_require__(206),
	    initCloneByTag = __webpack_require__(207),
	    initCloneObject = __webpack_require__(217),
	    isArray = __webpack_require__(52),
	    isBuffer = __webpack_require__(53),
	    isObject = __webpack_require__(68),
	    keys = __webpack_require__(40);

	/** Used to compose bitmasks for cloning. */
	var CLONE_DEEP_FLAG = 1,
	    CLONE_FLAT_FLAG = 2,
	    CLONE_SYMBOLS_FLAG = 4;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
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
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
	cloneableTags[boolTag] = cloneableTags[dateTag] =
	cloneableTags[float32Tag] = cloneableTags[float64Tag] =
	cloneableTags[int8Tag] = cloneableTags[int16Tag] =
	cloneableTags[int32Tag] = cloneableTags[mapTag] =
	cloneableTags[numberTag] = cloneableTags[objectTag] =
	cloneableTags[regexpTag] = cloneableTags[setTag] =
	cloneableTags[stringTag] = cloneableTags[symbolTag] =
	cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
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
	      isDeep = bitmask & CLONE_DEEP_FLAG,
	      isFlat = bitmask & CLONE_FLAT_FLAG,
	      isFull = bitmask & CLONE_SYMBOLS_FLAG;

	  if (customizer) {
	    result = object ? customizer(value, key, object, stack) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return copyArray(value, result);
	    }
	  } else {
	    var tag = getTag(value),
	        isFunc = tag == funcTag || tag == genTag;

	    if (isBuffer(value)) {
	      return cloneBuffer(value, isDeep);
	    }
	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      result = (isFlat || isFunc) ? {} : initCloneObject(value);
	      if (!isDeep) {
	        return isFlat
	          ? copySymbolsIn(value, baseAssignIn(result, value))
	          : copySymbols(value, baseAssign(result, value));
	      }
	    } else {
	      if (!cloneableTags[tag]) {
	        return object ? value : {};
	      }
	      result = initCloneByTag(value, tag, baseClone, isDeep);
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stack || (stack = new Stack);
	  var stacked = stack.get(value);
	  if (stacked) {
	    return stacked;
	  }
	  stack.set(value, result);

	  var keysFunc = isFull
	    ? (isFlat ? getAllKeysIn : getAllKeys)
	    : (isFlat ? keysIn : keys);

	  var props = isArr ? undefined : keysFunc(value);
	  arrayEach(props || value, function(subValue, key) {
	    if (props) {
	      key = subValue;
	      subValue = value[key];
	    }
	    // Recursively populate clone (susceptible to call stack limits).
	    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
	  });
	  return result;
	}

	module.exports = baseClone;


/***/ },
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(187),
	    eq = __webpack_require__(92);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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
	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}

	module.exports = assignValue;


/***/ },
/* 187 */
/***/ function(module, exports, __webpack_require__) {

	var defineProperty = __webpack_require__(119);

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
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	module.exports = baseAssignValue;


/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(189),
	    keys = __webpack_require__(40);

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
	  return object && copyObject(source, keys(source), object);
	}

	module.exports = baseAssign;


/***/ },
/* 189 */
/***/ function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(186),
	    baseAssignValue = __webpack_require__(187);

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
	      baseAssignValue(object, key, newValue);
	    } else {
	      assignValue(object, key, newValue);
	    }
	  }
	  return object;
	}

	module.exports = copyObject;


/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(189),
	    keysIn = __webpack_require__(191);

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
	  return object && copyObject(source, keysIn(source), object);
	}

	module.exports = baseAssignIn;


/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	var arrayLikeKeys = __webpack_require__(41),
	    baseKeysIn = __webpack_require__(192),
	    isArrayLike = __webpack_require__(66);

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
	  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}

	module.exports = keysIn;


/***/ },
/* 192 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(68),
	    isPrototype = __webpack_require__(63),
	    nativeKeysIn = __webpack_require__(193);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeysIn(object) {
	  if (!isObject(object)) {
	    return nativeKeysIn(object);
	  }
	  var isProto = isPrototype(object),
	      result = [];

	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = baseKeysIn;


/***/ },
/* 193 */
/***/ function(module, exports) {

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

	module.exports = nativeKeysIn;


/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(47);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(54)(module)))

/***/ },
/* 195 */
/***/ function(module, exports) {

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

	module.exports = copyArray;


/***/ },
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(189),
	    getSymbols = __webpack_require__(197);

	/**
	 * Copies own symbols of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy symbols from.
	 * @param {Object} [object={}] The object to copy symbols to.
	 * @returns {Object} Returns `object`.
	 */
	function copySymbols(source, object) {
	  return copyObject(source, getSymbols(source), object);
	}

	module.exports = copySymbols;


/***/ },
/* 197 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(65),
	    stubArray = __webpack_require__(198);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

	module.exports = getSymbols;


/***/ },
/* 198 */
/***/ function(module, exports) {

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

	module.exports = stubArray;


/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(189),
	    getSymbolsIn = __webpack_require__(200);

	/**
	 * Copies own and inherited symbols of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy symbols from.
	 * @param {Object} [object={}] The object to copy symbols to.
	 * @returns {Object} Returns `object`.
	 */
	function copySymbolsIn(source, object) {
	  return copyObject(source, getSymbolsIn(source), object);
	}

	module.exports = copySymbolsIn;


/***/ },
/* 200 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(201),
	    getPrototype = __webpack_require__(202),
	    getSymbols = __webpack_require__(197),
	    stubArray = __webpack_require__(198);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own and inherited enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
	  var result = [];
	  while (object) {
	    arrayPush(result, getSymbols(object));
	    object = getPrototype(object);
	  }
	  return result;
	};

	module.exports = getSymbolsIn;


/***/ },
/* 201 */
/***/ function(module, exports) {

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

	module.exports = arrayPush;


/***/ },
/* 202 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(65);

	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

	module.exports = getPrototype;


/***/ },
/* 203 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(204),
	    getSymbols = __webpack_require__(197),
	    keys = __webpack_require__(40);

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}

	module.exports = getAllKeys;


/***/ },
/* 204 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(201),
	    isArray = __webpack_require__(52);

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
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}

	module.exports = baseGetAllKeys;


/***/ },
/* 205 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(204),
	    getSymbolsIn = __webpack_require__(200),
	    keysIn = __webpack_require__(191);

	/**
	 * Creates an array of own and inherited enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeysIn(object) {
	  return baseGetAllKeys(object, keysIn, getSymbolsIn);
	}

	module.exports = getAllKeysIn;


/***/ },
/* 206 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = array.constructor(length);

	  // Add properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}

	module.exports = initCloneArray;


/***/ },
/* 207 */
/***/ function(module, exports, __webpack_require__) {

	var cloneArrayBuffer = __webpack_require__(208),
	    cloneDataView = __webpack_require__(209),
	    cloneMap = __webpack_require__(210),
	    cloneRegExp = __webpack_require__(212),
	    cloneSet = __webpack_require__(213),
	    cloneSymbol = __webpack_require__(215),
	    cloneTypedArray = __webpack_require__(216);

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, cloneFunc, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return cloneArrayBuffer(object);

	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);

	    case dataViewTag:
	      return cloneDataView(object, isDeep);

	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      return cloneTypedArray(object, isDeep);

	    case mapTag:
	      return cloneMap(object, isDeep, cloneFunc);

	    case numberTag:
	    case stringTag:
	      return new Ctor(object);

	    case regexpTag:
	      return cloneRegExp(object);

	    case setTag:
	      return cloneSet(object, isDeep, cloneFunc);

	    case symbolTag:
	      return cloneSymbol(object);
	  }
	}

	module.exports = initCloneByTag;


/***/ },
/* 208 */
/***/ function(module, exports, __webpack_require__) {

	var Uint8Array = __webpack_require__(149);

	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneArrayBuffer(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	  return result;
	}

	module.exports = cloneArrayBuffer;


/***/ },
/* 209 */
/***/ function(module, exports, __webpack_require__) {

	var cloneArrayBuffer = __webpack_require__(208);

	/**
	 * Creates a clone of `dataView`.
	 *
	 * @private
	 * @param {Object} dataView The data view to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned data view.
	 */
	function cloneDataView(dataView, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
	  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
	}

	module.exports = cloneDataView;


/***/ },
/* 210 */
/***/ function(module, exports, __webpack_require__) {

	var addMapEntry = __webpack_require__(211),
	    arrayReduce = __webpack_require__(182),
	    mapToArray = __webpack_require__(150);

	/** Used to compose bitmasks for cloning. */
	var CLONE_DEEP_FLAG = 1;

	/**
	 * Creates a clone of `map`.
	 *
	 * @private
	 * @param {Object} map The map to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned map.
	 */
	function cloneMap(map, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(mapToArray(map), CLONE_DEEP_FLAG) : mapToArray(map);
	  return arrayReduce(array, addMapEntry, new map.constructor);
	}

	module.exports = cloneMap;


/***/ },
/* 211 */
/***/ function(module, exports) {

	/**
	 * Adds the key-value `pair` to `map`.
	 *
	 * @private
	 * @param {Object} map The map to modify.
	 * @param {Array} pair The key-value pair to add.
	 * @returns {Object} Returns `map`.
	 */
	function addMapEntry(map, pair) {
	  // Don't return `map.set` because it's not chainable in IE 11.
	  map.set(pair[0], pair[1]);
	  return map;
	}

	module.exports = addMapEntry;


/***/ },
/* 212 */
/***/ function(module, exports) {

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

	module.exports = cloneRegExp;


/***/ },
/* 213 */
/***/ function(module, exports, __webpack_require__) {

	var addSetEntry = __webpack_require__(214),
	    arrayReduce = __webpack_require__(182),
	    setToArray = __webpack_require__(151);

	/** Used to compose bitmasks for cloning. */
	var CLONE_DEEP_FLAG = 1;

	/**
	 * Creates a clone of `set`.
	 *
	 * @private
	 * @param {Object} set The set to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned set.
	 */
	function cloneSet(set, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(setToArray(set), CLONE_DEEP_FLAG) : setToArray(set);
	  return arrayReduce(array, addSetEntry, new set.constructor);
	}

	module.exports = cloneSet;


/***/ },
/* 214 */
/***/ function(module, exports) {

	/**
	 * Adds `value` to `set`.
	 *
	 * @private
	 * @param {Object} set The set to modify.
	 * @param {*} value The value to add.
	 * @returns {Object} Returns `set`.
	 */
	function addSetEntry(set, value) {
	  // Don't return `set.add` because it's not chainable in IE 11.
	  set.add(value);
	  return set;
	}

	module.exports = addSetEntry;


/***/ },
/* 215 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(46);

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * Creates a clone of the `symbol` object.
	 *
	 * @private
	 * @param {Object} symbol The symbol object to clone.
	 * @returns {Object} Returns the cloned symbol object.
	 */
	function cloneSymbol(symbol) {
	  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
	}

	module.exports = cloneSymbol;


/***/ },
/* 216 */
/***/ function(module, exports, __webpack_require__) {

	var cloneArrayBuffer = __webpack_require__(208);

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}

	module.exports = cloneTypedArray;


/***/ },
/* 217 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(218),
	    getPrototype = __webpack_require__(202),
	    isPrototype = __webpack_require__(63);

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  return (typeof object.constructor == 'function' && !isPrototype(object))
	    ? baseCreate(getPrototype(object))
	    : {};
	}

	module.exports = initCloneObject;


/***/ },
/* 218 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(68);

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
	    if (!isObject(proto)) {
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

	module.exports = baseCreate;


/***/ },
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(164),
	    last = __webpack_require__(220),
	    parent = __webpack_require__(221),
	    toKey = __webpack_require__(172);

	/**
	 * The base implementation of `_.unset`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The property path to unset.
	 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
	 */
	function baseUnset(object, path) {
	  path = castPath(path, object);
	  object = parent(object, path);
	  return object == null || delete object[toKey(last(path))];
	}

	module.exports = baseUnset;


/***/ },
/* 220 */
/***/ function(module, exports) {

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? array[length - 1] : undefined;
	}

	module.exports = last;


/***/ },
/* 221 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(163),
	    baseSlice = __webpack_require__(222);

	/**
	 * Gets the parent value at `path` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path to get the parent value of.
	 * @returns {*} Returns the parent value.
	 */
	function parent(object, path) {
	  return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
	}

	module.exports = parent;


/***/ },
/* 222 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;

	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = end > length ? length : end;
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;

	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}

	module.exports = baseSlice;


/***/ },
/* 223 */
/***/ function(module, exports, __webpack_require__) {

	var flatten = __webpack_require__(224),
	    overRest = __webpack_require__(114),
	    setToString = __webpack_require__(116);

	/**
	 * A specialized version of `baseRest` which flattens the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @returns {Function} Returns the new function.
	 */
	function flatRest(func) {
	  return setToString(overRest(func, undefined, flatten), func + '');
	}

	module.exports = flatRest;


/***/ },
/* 224 */
/***/ function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(225);

	/**
	 * Flattens `array` a single level deep.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to flatten.
	 * @returns {Array} Returns the new flattened array.
	 * @example
	 *
	 * _.flatten([1, [2, [3, [4]], 5]]);
	 * // => [1, 2, [3, [4]], 5]
	 */
	function flatten(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? baseFlatten(array, 1) : [];
	}

	module.exports = flatten;


/***/ },
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(201),
	    isFlattenable = __webpack_require__(226);

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, predicate, isStrict, result) {
	  var index = -1,
	      length = array.length;

	  predicate || (predicate = isFlattenable);
	  result || (result = []);

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	module.exports = baseFlatten;


/***/ },
/* 226 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(46),
	    isArguments = __webpack_require__(43),
	    isArray = __webpack_require__(52);

	/** Built-in value references. */
	var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	  return isArray(value) || isArguments(value) ||
	    !!(spreadableSymbol && value && value[spreadableSymbol]);
	}

	module.exports = isFlattenable;


/***/ },
/* 227 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(106),
	    toInteger = __webpack_require__(228);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Gets the index at which the first occurrence of `value` is found in `array`
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons. If `fromIndex` is negative, it's used as the
	 * offset from the end of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 * @example
	 *
	 * _.indexOf([1, 2, 1, 2], 2);
	 * // => 1
	 *
	 * // Search from the `fromIndex`.
	 * _.indexOf([1, 2, 1, 2], 2, 2);
	 * // => 3
	 */
	function indexOf(array, value, fromIndex) {
	  var length = array == null ? 0 : array.length;
	  if (!length) {
	    return -1;
	  }
	  var index = fromIndex == null ? 0 : toInteger(fromIndex);
	  if (index < 0) {
	    index = nativeMax(length + index, 0);
	  }
	  return baseIndexOf(array, value, index);
	}

	module.exports = indexOf;


/***/ },
/* 228 */
/***/ function(module, exports, __webpack_require__) {

	var toFinite = __webpack_require__(229);

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
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}

	module.exports = toInteger;


/***/ },
/* 229 */
/***/ function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(230);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
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
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	module.exports = toFinite;


/***/ },
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(68),
	    isSymbol = __webpack_require__(166);

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

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
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	module.exports = toNumber;


/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	var isNumber = __webpack_require__(232);

	/**
	 * Checks if `value` is `NaN`.
	 *
	 * **Note:** This method is based on
	 * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
	 * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
	 * `undefined` and other non-number values.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 * @example
	 *
	 * _.isNaN(NaN);
	 * // => true
	 *
	 * _.isNaN(new Number(NaN));
	 * // => true
	 *
	 * isNaN(undefined);
	 * // => true
	 *
	 * _.isNaN(undefined);
	 * // => false
	 */
	function isNaN(value) {
	  // An `NaN` primitive is the only value that is not equal to itself.
	  // Perform the `toStringTag` check first to avoid errors with some
	  // ActiveX objects in IE.
	  return isNumber(value) && value != +value;
	}

	module.exports = isNaN;


/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(45),
	    isObjectLike = __webpack_require__(51);

	/** `Object#toString` result references. */
	var numberTag = '[object Number]';

	/**
	 * Checks if `value` is classified as a `Number` primitive or object.
	 *
	 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
	 * classified as numbers, use the `_.isFinite` method.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a number, else `false`.
	 * @example
	 *
	 * _.isNumber(3);
	 * // => true
	 *
	 * _.isNumber(Number.MIN_VALUE);
	 * // => true
	 *
	 * _.isNumber(Infinity);
	 * // => true
	 *
	 * _.isNumber('3');
	 * // => false
	 */
	function isNumber(value) {
	  return typeof value == 'number' ||
	    (isObjectLike(value) && baseGetTag(value) == numberTag);
	}

	module.exports = isNumber;


/***/ },
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	var baseKeys = __webpack_require__(62),
	    getTag = __webpack_require__(153),
	    isArguments = __webpack_require__(43),
	    isArray = __webpack_require__(52),
	    isArrayLike = __webpack_require__(66),
	    isBuffer = __webpack_require__(53),
	    isPrototype = __webpack_require__(63),
	    isTypedArray = __webpack_require__(57);

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
	  if (isArrayLike(value) &&
	      (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
	        isBuffer(value) || isTypedArray(value) || isArguments(value))) {
	    return !value.length;
	  }
	  var tag = getTag(value);
	  if (tag == mapTag || tag == setTag) {
	    return !value.size;
	  }
	  if (isPrototype(value)) {
	    return !baseKeys(value).length;
	  }
	  for (var key in value) {
	    if (hasOwnProperty.call(value, key)) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = isEmpty;


/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(144);

	/**
	 * Performs a deep comparison between two values to determine if they are
	 * equivalent.
	 *
	 * **Note:** This method supports comparing arrays, array buffers, booleans,
	 * date objects, error objects, maps, numbers, `Object` objects, regexes,
	 * sets, strings, symbols, and typed arrays. `Object` objects are compared
	 * by their own, not inherited, enumerable properties. Functions and DOM
	 * nodes are **not** supported.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.isEqual(object, other);
	 * // => true
	 *
	 * object === other;
	 * // => false
	 */
	function isEqual(value, other) {
	  return baseIsEqual(value, other);
	}

	module.exports = isEqual;


/***/ },
/* 235 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is `undefined`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	 * @example
	 *
	 * _.isUndefined(void 0);
	 * // => true
	 *
	 * _.isUndefined(null);
	 * // => false
	 */
	function isUndefined(value) {
	  return value === undefined;
	}

	module.exports = isUndefined;


/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(45),
	    isArray = __webpack_require__(52),
	    isObjectLike = __webpack_require__(51);

	/** `Object#toString` result references. */
	var stringTag = '[object String]';

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
	}

	module.exports = isString;


/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	var createFind = __webpack_require__(238),
	    findIndex = __webpack_require__(239);

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
	var find = createFind(findIndex);

	module.exports = find;


/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	var baseIteratee = __webpack_require__(135),
	    isArrayLike = __webpack_require__(66),
	    keys = __webpack_require__(40);

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
	    if (!isArrayLike(collection)) {
	      var iteratee = baseIteratee(predicate, 3);
	      collection = keys(collection);
	      predicate = function(key) { return iteratee(iterable[key], key, iterable); };
	    }
	    var index = findIndexFunc(collection, predicate, fromIndex);
	    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
	  };
	}

	module.exports = createFind;


/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	var baseFindIndex = __webpack_require__(107),
	    baseIteratee = __webpack_require__(135),
	    toInteger = __webpack_require__(228);

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
	function findIndex(array, predicate, fromIndex) {
	  var length = array == null ? 0 : array.length;
	  if (!length) {
	    return -1;
	  }
	  var index = fromIndex == null ? 0 : toInteger(fromIndex);
	  if (index < 0) {
	    index = nativeMax(length + index, 0);
	  }
	  return baseFindIndex(array, baseIteratee(predicate, 3), index);
	}

	module.exports = findIndex;


/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(171),
	    castSlice = __webpack_require__(241),
	    charsEndIndex = __webpack_require__(242),
	    charsStartIndex = __webpack_require__(243),
	    stringToArray = __webpack_require__(244),
	    toString = __webpack_require__(170);

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/**
	 * Removes leading and trailing whitespace or specified characters from `string`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to trim.
	 * @param {string} [chars=whitespace] The characters to trim.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	 * @returns {string} Returns the trimmed string.
	 * @example
	 *
	 * _.trim('  abc  ');
	 * // => 'abc'
	 *
	 * _.trim('-_-abc-_-', '_-');
	 * // => 'abc'
	 *
	 * _.map(['  foo  ', '  bar  '], _.trim);
	 * // => ['foo', 'bar']
	 */
	function trim(string, chars, guard) {
	  string = toString(string);
	  if (string && (guard || chars === undefined)) {
	    return string.replace(reTrim, '');
	  }
	  if (!string || !(chars = baseToString(chars))) {
	    return string;
	  }
	  var strSymbols = stringToArray(string),
	      chrSymbols = stringToArray(chars),
	      start = charsStartIndex(strSymbols, chrSymbols),
	      end = charsEndIndex(strSymbols, chrSymbols) + 1;

	  return castSlice(strSymbols, start, end).join('');
	}

	module.exports = trim;


/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

	var baseSlice = __webpack_require__(222);

	/**
	 * Casts `array` to a slice if it's needed.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {number} start The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the cast slice.
	 */
	function castSlice(array, start, end) {
	  var length = array.length;
	  end = end === undefined ? length : end;
	  return (!start && end >= length) ? array : baseSlice(array, start, end);
	}

	module.exports = castSlice;


/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(106);

	/**
	 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
	 * that is not found in the character symbols.
	 *
	 * @private
	 * @param {Array} strSymbols The string symbols to inspect.
	 * @param {Array} chrSymbols The character symbols to find.
	 * @returns {number} Returns the index of the last unmatched string symbol.
	 */
	function charsEndIndex(strSymbols, chrSymbols) {
	  var index = strSymbols.length;

	  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
	  return index;
	}

	module.exports = charsEndIndex;


/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(106);

	/**
	 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
	 * that is not found in the character symbols.
	 *
	 * @private
	 * @param {Array} strSymbols The string symbols to inspect.
	 * @param {Array} chrSymbols The character symbols to find.
	 * @returns {number} Returns the index of the first unmatched string symbol.
	 */
	function charsStartIndex(strSymbols, chrSymbols) {
	  var index = -1,
	      length = strSymbols.length;

	  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
	  return index;
	}

	module.exports = charsStartIndex;


/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	var asciiToArray = __webpack_require__(245),
	    hasUnicode = __webpack_require__(246),
	    unicodeToArray = __webpack_require__(247);

	/**
	 * Converts `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function stringToArray(string) {
	  return hasUnicode(string)
	    ? unicodeToArray(string)
	    : asciiToArray(string);
	}

	module.exports = stringToArray;


/***/ },
/* 245 */
/***/ function(module, exports) {

	/**
	 * Converts an ASCII `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function asciiToArray(string) {
	  return string.split('');
	}

	module.exports = asciiToArray;


/***/ },
/* 246 */
/***/ function(module, exports) {

	/** Used to compose unicode character classes. */
	var rsAstralRange = '\\ud800-\\udfff',
	    rsComboMarksRange = '\\u0300-\\u036f',
	    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
	    rsComboSymbolsRange = '\\u20d0-\\u20ff',
	    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
	    rsVarRange = '\\ufe0e\\ufe0f';

	/** Used to compose unicode capture groups. */
	var rsZWJ = '\\u200d';

	/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

	/**
	 * Checks if `string` contains Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
	 */
	function hasUnicode(string) {
	  return reHasUnicode.test(string);
	}

	module.exports = hasUnicode;


/***/ },
/* 247 */
/***/ function(module, exports) {

	/** Used to compose unicode character classes. */
	var rsAstralRange = '\\ud800-\\udfff',
	    rsComboMarksRange = '\\u0300-\\u036f',
	    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
	    rsComboSymbolsRange = '\\u20d0-\\u20ff',
	    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
	    rsVarRange = '\\ufe0e\\ufe0f';

	/** Used to compose unicode capture groups. */
	var rsAstral = '[' + rsAstralRange + ']',
	    rsCombo = '[' + rsComboRange + ']',
	    rsFitz = '\\ud83c[\\udffb-\\udfff]',
	    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
	    rsNonAstral = '[^' + rsAstralRange + ']',
	    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
	    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
	    rsZWJ = '\\u200d';

	/** Used to compose unicode regexes. */
	var reOptMod = rsModifier + '?',
	    rsOptVar = '[' + rsVarRange + ']?',
	    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
	    rsSeq = rsOptVar + reOptMod + rsOptJoin,
	    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

	/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

	/**
	 * Converts a Unicode `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function unicodeToArray(string) {
	  return string.match(reUnicode) || [];
	}

	module.exports = unicodeToArray;


/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(115),
	    assignInDefaults = __webpack_require__(249),
	    assignInWith = __webpack_require__(250),
	    baseRest = __webpack_require__(112);

	/**
	 * Assigns own and inherited enumerable string keyed properties of source
	 * objects to the destination object for all destination properties that
	 * resolve to `undefined`. Source objects are applied from left to right.
	 * Once a property is set, additional values of the same property are ignored.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.defaultsDeep
	 * @example
	 *
	 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
	 * // => { 'a': 1, 'b': 2 }
	 */
	var defaults = baseRest(function(args) {
	  args.push(undefined, assignInDefaults);
	  return apply(assignInWith, undefined, args);
	});

	module.exports = defaults;


/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(92);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used by `_.defaults` to customize its `_.assignIn` use.
	 *
	 * @private
	 * @param {*} objValue The destination value.
	 * @param {*} srcValue The source value.
	 * @param {string} key The key of the property to assign.
	 * @param {Object} object The parent object of `objValue`.
	 * @returns {*} Returns the value to assign.
	 */
	function assignInDefaults(objValue, srcValue, key, object) {
	  if (objValue === undefined ||
	      (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
	    return srcValue;
	  }
	  return objValue;
	}

	module.exports = assignInDefaults;


/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(189),
	    createAssigner = __webpack_require__(251),
	    keysIn = __webpack_require__(191);

	/**
	 * This method is like `_.assignIn` except that it accepts `customizer`
	 * which is invoked to produce the assigned values. If `customizer` returns
	 * `undefined`, assignment is handled by the method instead. The `customizer`
	 * is invoked with five arguments: (objValue, srcValue, key, object, source).
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @alias extendWith
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} sources The source objects.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 * @see _.assignWith
	 * @example
	 *
	 * function customizer(objValue, srcValue) {
	 *   return _.isUndefined(objValue) ? srcValue : objValue;
	 * }
	 *
	 * var defaults = _.partialRight(_.assignInWith, customizer);
	 *
	 * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
	 * // => { 'a': 1, 'b': 2 }
	 */
	var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
	  copyObject(source, keysIn(source), object, customizer);
	});

	module.exports = assignInWith;


/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(112),
	    isIterateeCall = __webpack_require__(252);

	/**
	 * Creates a function like `_.assign`.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return baseRest(function(object, sources) {
	    var index = -1,
	        length = sources.length,
	        customizer = length > 1 ? sources[length - 1] : undefined,
	        guard = length > 2 ? sources[2] : undefined;

	    customizer = (assigner.length > 3 && typeof customizer == 'function')
	      ? (length--, customizer)
	      : undefined;

	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    object = Object(object);
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, index, customizer);
	      }
	    }
	    return object;
	  });
	}

	module.exports = createAssigner;


/***/ },
/* 252 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(92),
	    isArrayLike = __webpack_require__(66),
	    isIndex = __webpack_require__(56),
	    isObject = __webpack_require__(68);

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq(object[index], value);
	  }
	  return false;
	}

	module.exports = isIterateeCall;


/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	var baseMerge = __webpack_require__(254),
	    createAssigner = __webpack_require__(251);

	/**
	 * This method is like `_.assign` except that it recursively merges own and
	 * inherited enumerable string keyed properties of source objects into the
	 * destination object. Source properties that resolve to `undefined` are
	 * skipped if a destination value exists. Array and plain object properties
	 * are merged recursively. Other objects and value types are overridden by
	 * assignment. Source objects are applied from left to right. Subsequent
	 * sources overwrite property assignments of previous sources.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.5.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * var object = {
	 *   'a': [{ 'b': 2 }, { 'd': 4 }]
	 * };
	 *
	 * var other = {
	 *   'a': [{ 'c': 3 }, { 'e': 5 }]
	 * };
	 *
	 * _.merge(object, other);
	 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
	 */
	var merge = createAssigner(function(object, source, srcIndex) {
	  baseMerge(object, source, srcIndex);
	});

	module.exports = merge;


/***/ },
/* 254 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(138),
	    assignMergeValue = __webpack_require__(255),
	    baseFor = __webpack_require__(125),
	    baseMergeDeep = __webpack_require__(256),
	    isObject = __webpack_require__(68),
	    keysIn = __webpack_require__(191);

	/**
	 * The base implementation of `_.merge` without support for multiple sources.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMerge(object, source, srcIndex, customizer, stack) {
	  if (object === source) {
	    return;
	  }
	  baseFor(source, function(srcValue, key) {
	    if (isObject(srcValue)) {
	      stack || (stack = new Stack);
	      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
	    }
	    else {
	      var newValue = customizer
	        ? customizer(object[key], srcValue, (key + ''), object, source, stack)
	        : undefined;

	      if (newValue === undefined) {
	        newValue = srcValue;
	      }
	      assignMergeValue(object, key, newValue);
	    }
	  }, keysIn);
	}

	module.exports = baseMerge;


/***/ },
/* 255 */
/***/ function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(187),
	    eq = __webpack_require__(92);

	/**
	 * This function is like `assignValue` except that it doesn't assign
	 * `undefined` values.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignMergeValue(object, key, value) {
	  if ((value !== undefined && !eq(object[key], value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}

	module.exports = assignMergeValue;


/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

	var assignMergeValue = __webpack_require__(255),
	    cloneBuffer = __webpack_require__(194),
	    cloneTypedArray = __webpack_require__(216),
	    copyArray = __webpack_require__(195),
	    initCloneObject = __webpack_require__(217),
	    isArguments = __webpack_require__(43),
	    isArray = __webpack_require__(52),
	    isArrayLikeObject = __webpack_require__(122),
	    isBuffer = __webpack_require__(53),
	    isFunction = __webpack_require__(67),
	    isObject = __webpack_require__(68),
	    isPlainObject = __webpack_require__(257),
	    isTypedArray = __webpack_require__(57),
	    toPlainObject = __webpack_require__(258);

	/**
	 * A specialized version of `baseMerge` for arrays and objects which performs
	 * deep merges and tracks traversed objects enabling objects with circular
	 * references to be merged.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {string} key The key of the value to merge.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} mergeFunc The function to merge values.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
	  var objValue = object[key],
	      srcValue = source[key],
	      stacked = stack.get(srcValue);

	  if (stacked) {
	    assignMergeValue(object, key, stacked);
	    return;
	  }
	  var newValue = customizer
	    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
	    : undefined;

	  var isCommon = newValue === undefined;

	  if (isCommon) {
	    var isArr = isArray(srcValue),
	        isBuff = !isArr && isBuffer(srcValue),
	        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

	    newValue = srcValue;
	    if (isArr || isBuff || isTyped) {
	      if (isArray(objValue)) {
	        newValue = objValue;
	      }
	      else if (isArrayLikeObject(objValue)) {
	        newValue = copyArray(objValue);
	      }
	      else if (isBuff) {
	        isCommon = false;
	        newValue = cloneBuffer(srcValue, true);
	      }
	      else if (isTyped) {
	        isCommon = false;
	        newValue = cloneTypedArray(srcValue, true);
	      }
	      else {
	        newValue = [];
	      }
	    }
	    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	      newValue = objValue;
	      if (isArguments(objValue)) {
	        newValue = toPlainObject(objValue);
	      }
	      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
	        newValue = initCloneObject(srcValue);
	      }
	    }
	    else {
	      isCommon = false;
	    }
	  }
	  if (isCommon) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, newValue);
	    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
	    stack['delete'](srcValue);
	  }
	  assignMergeValue(object, key, newValue);
	}

	module.exports = baseMergeDeep;


/***/ },
/* 257 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(45),
	    getPrototype = __webpack_require__(202),
	    isObjectLike = __webpack_require__(51);

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
	    funcToString.call(Ctor) == objectCtorString;
	}

	module.exports = isPlainObject;


/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(189),
	    keysIn = __webpack_require__(191);

	/**
	 * Converts `value` to a plain object flattening inherited enumerable string
	 * keyed properties of `value` to own properties of the plain object.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Object} Returns the converted plain object.
	 * @example
	 *
	 * function Foo() {
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.assign({ 'a': 1 }, new Foo);
	 * // => { 'a': 1, 'b': 2 }
	 *
	 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	 * // => { 'a': 1, 'b': 2, 'c': 3 }
	 */
	function toPlainObject(value) {
	  return copyObject(value, keysIn(value));
	}

	module.exports = toPlainObject;


/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var map = __webpack_require__(179);
	var isArray = __webpack_require__(52);
	var isNumber = __webpack_require__(232);
	var isString = __webpack_require__(236);
	function valToNumber(v) {
	  if (isNumber(v)) {
	    return v;
	  } else if (isString(v)) {
	    return parseFloat(v);
	  } else if (isArray(v)) {
	    return map(v, valToNumber);
	  }

	  throw new Error('The value should be a number, a parseable string or an array of those.');
	}

	module.exports = valToNumber;


/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var forEach = __webpack_require__(128);
	var filter = __webpack_require__(132);
	var map = __webpack_require__(179);
	var isEmpty = __webpack_require__(233);
	var indexOf = __webpack_require__(227);

	function filterState(state, filters) {
	  var partialState = {};
	  var attributeFilters = filter(filters, function(f) { return f.indexOf('attribute:') !== -1; });
	  var attributes = map(attributeFilters, function(aF) { return aF.split(':')[1]; });

	  if (indexOf(attributes, '*') === -1) {
	    forEach(attributes, function(attr) {
	      if (state.isConjunctiveFacet(attr) && state.isFacetRefined(attr)) {
	        if (!partialState.facetsRefinements) partialState.facetsRefinements = {};
	        partialState.facetsRefinements[attr] = state.facetsRefinements[attr];
	      }

	      if (state.isDisjunctiveFacet(attr) && state.isDisjunctiveFacetRefined(attr)) {
	        if (!partialState.disjunctiveFacetsRefinements) partialState.disjunctiveFacetsRefinements = {};
	        partialState.disjunctiveFacetsRefinements[attr] = state.disjunctiveFacetsRefinements[attr];
	      }

	      if (state.isHierarchicalFacet(attr) && state.isHierarchicalFacetRefined(attr)) {
	        if (!partialState.hierarchicalFacetsRefinements) partialState.hierarchicalFacetsRefinements = {};
	        partialState.hierarchicalFacetsRefinements[attr] = state.hierarchicalFacetsRefinements[attr];
	      }

	      var numericRefinements = state.getNumericRefinements(attr);
	      if (!isEmpty(numericRefinements)) {
	        if (!partialState.numericRefinements) partialState.numericRefinements = {};
	        partialState.numericRefinements[attr] = state.numericRefinements[attr];
	      }
	    });
	  } else {
	    if (!isEmpty(state.numericRefinements)) {
	      partialState.numericRefinements = state.numericRefinements;
	    }
	    if (!isEmpty(state.facetsRefinements)) partialState.facetsRefinements = state.facetsRefinements;
	    if (!isEmpty(state.disjunctiveFacetsRefinements)) {
	      partialState.disjunctiveFacetsRefinements = state.disjunctiveFacetsRefinements;
	    }
	    if (!isEmpty(state.hierarchicalFacetsRefinements)) {
	      partialState.hierarchicalFacetsRefinements = state.hierarchicalFacetsRefinements;
	    }
	  }

	  var searchParameters = filter(
	    filters,
	    function(f) {
	      return f.indexOf('attribute:') === -1;
	    }
	  );

	  forEach(
	    searchParameters,
	    function(parameterKey) {
	      partialState[parameterKey] = state[parameterKey];
	    }
	  );

	  return partialState;
	}

	module.exports = filterState;


/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Functions to manipulate refinement lists
	 *
	 * The RefinementList is not formally defined through a prototype but is based
	 * on a specific structure.
	 *
	 * @module SearchParameters.refinementList
	 *
	 * @typedef {string[]} SearchParameters.refinementList.Refinements
	 * @typedef {Object.<string, SearchParameters.refinementList.Refinements>} SearchParameters.refinementList.RefinementList
	 */

	var isUndefined = __webpack_require__(235);
	var isString = __webpack_require__(236);
	var isFunction = __webpack_require__(67);
	var isEmpty = __webpack_require__(233);
	var defaults = __webpack_require__(248);

	var reduce = __webpack_require__(181);
	var filter = __webpack_require__(132);
	var omit = __webpack_require__(184);

	var lib = {
	  /**
	   * Adds a refinement to a RefinementList
	   * @param {RefinementList} refinementList the initial list
	   * @param {string} attribute the attribute to refine
	   * @param {string} value the value of the refinement, if the value is not a string it will be converted
	   * @return {RefinementList} a new and updated prefinement list
	   */
	  addRefinement: function addRefinement(refinementList, attribute, value) {
	    if (lib.isRefined(refinementList, attribute, value)) {
	      return refinementList;
	    }

	    var valueAsString = '' + value;

	    var facetRefinement = !refinementList[attribute] ?
	      [valueAsString] :
	      refinementList[attribute].concat(valueAsString);

	    var mod = {};

	    mod[attribute] = facetRefinement;

	    return defaults({}, mod, refinementList);
	  },
	  /**
	   * Removes refinement(s) for an attribute:
	   *  - if the value is specified removes the refinement for the value on the attribute
	   *  - if no value is specified removes all the refinements for this attribute
	   * @param {RefinementList} refinementList the initial list
	   * @param {string} attribute the attribute to refine
	   * @param {string} [value] the value of the refinement
	   * @return {RefinementList} a new and updated refinement lst
	   */
	  removeRefinement: function removeRefinement(refinementList, attribute, value) {
	    if (isUndefined(value)) {
	      return lib.clearRefinement(refinementList, attribute);
	    }

	    var valueAsString = '' + value;

	    return lib.clearRefinement(refinementList, function(v, f) {
	      return attribute === f && valueAsString === v;
	    });
	  },
	  /**
	   * Toggles the refinement value for an attribute.
	   * @param {RefinementList} refinementList the initial list
	   * @param {string} attribute the attribute to refine
	   * @param {string} value the value of the refinement
	   * @return {RefinementList} a new and updated list
	   */
	  toggleRefinement: function toggleRefinement(refinementList, attribute, value) {
	    if (isUndefined(value)) throw new Error('toggleRefinement should be used with a value');

	    if (lib.isRefined(refinementList, attribute, value)) {
	      return lib.removeRefinement(refinementList, attribute, value);
	    }

	    return lib.addRefinement(refinementList, attribute, value);
	  },
	  /**
	   * Clear all or parts of a RefinementList. Depending on the arguments, three
	   * behaviors can happen:
	   *  - if no attribute is provided: clears the whole list
	   *  - if an attribute is provided as a string: clears the list for the specific attribute
	   *  - if an attribute is provided as a function: discards the elements for which the function returns true
	   * @param {RefinementList} refinementList the initial list
	   * @param {string} [attribute] the attribute or function to discard
	   * @param {string} [refinementType] optionnal parameter to give more context to the attribute function
	   * @return {RefinementList} a new and updated refinement list
	   */
	  clearRefinement: function clearRefinement(refinementList, attribute, refinementType) {
	    if (isUndefined(attribute)) {
	      return {};
	    } else if (isString(attribute)) {
	      return omit(refinementList, attribute);
	    } else if (isFunction(attribute)) {
	      return reduce(refinementList, function(memo, values, key) {
	        var facetList = filter(values, function(value) {
	          return !attribute(value, key, refinementType);
	        });

	        if (!isEmpty(facetList)) memo[key] = facetList;

	        return memo;
	      }, {});
	    }
	  },
	  /**
	   * Test if the refinement value is used for the attribute. If no refinement value
	   * is provided, test if the refinementList contains any refinement for the
	   * given attribute.
	   * @param {RefinementList} refinementList the list of refinement
	   * @param {string} attribute name of the attribute
	   * @param {string} [refinementValue] value of the filter/refinement
	   * @return {boolean}
	   */
	  isRefined: function isRefined(refinementList, attribute, refinementValue) {
	    var indexOf = __webpack_require__(227);

	    var containsRefinements = !!refinementList[attribute] &&
	      refinementList[attribute].length > 0;

	    if (isUndefined(refinementValue) || !containsRefinements) {
	      return containsRefinements;
	    }

	    var refinementValueAsString = '' + refinementValue;

	    return indexOf(refinementList[attribute], refinementValueAsString) !== -1;
	  }
	};

	module.exports = lib;


/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var forEach = __webpack_require__(128);
	var compact = __webpack_require__(263);
	var indexOf = __webpack_require__(227);
	var findIndex = __webpack_require__(239);
	var get = __webpack_require__(162);

	var sumBy = __webpack_require__(264);
	var find = __webpack_require__(237);
	var includes = __webpack_require__(266);
	var map = __webpack_require__(179);
	var orderBy = __webpack_require__(269);

	var defaults = __webpack_require__(248);
	var merge = __webpack_require__(253);

	var isArray = __webpack_require__(52);
	var isFunction = __webpack_require__(67);

	var partial = __webpack_require__(274);
	var partialRight = __webpack_require__(306);

	var formatSort = __webpack_require__(307);

	var generateHierarchicalTree = __webpack_require__(310);

	/**
	 * @typedef SearchResults.Facet
	 * @type {object}
	 * @property {string} name name of the attribute in the record
	 * @property {object} data the facetting data: value, number of entries
	 * @property {object} stats undefined unless facet_stats is retrieved from algolia
	 */

	/**
	 * @typedef SearchResults.HierarchicalFacet
	 * @type {object}
	 * @property {string} name name of the current value given the hierarchical level, trimmed.
	 * If root node, you get the facet name
	 * @property {number} count number of objets matching this hierarchical value
	 * @property {string} path the current hierarchical value full path
	 * @property {boolean} isRefined `true` if the current value was refined, `false` otherwise
	 * @property {HierarchicalFacet[]} data sub values for the current level
	 */

	/**
	 * @typedef SearchResults.FacetValue
	 * @type {object}
	 * @property {string} value the facet value itself
	 * @property {number} count times this facet appears in the results
	 * @property {boolean} isRefined is the facet currently selected
	 * @property {boolean} isExcluded is the facet currently excluded (only for conjunctive facets)
	 */

	/**
	 * @typedef Refinement
	 * @type {object}
	 * @property {string} type the type of filter used:
	 * `numeric`, `facet`, `exclude`, `disjunctive`, `hierarchical`
	 * @property {string} attributeName name of the attribute used for filtering
	 * @property {string} name the value of the filter
	 * @property {number} numericValue the value as a number. Only for numeric fitlers.
	 * @property {string} operator the operator used. Only for numeric filters.
	 * @property {number} count the number of computed hits for this filter. Only on facets.
	 * @property {boolean} exhaustive if the count is exhaustive
	 */

	function getIndices(obj) {
	  var indices = {};

	  forEach(obj, function(val, idx) { indices[val] = idx; });

	  return indices;
	}

	function assignFacetStats(dest, facetStats, key) {
	  if (facetStats && facetStats[key]) {
	    dest.stats = facetStats[key];
	  }
	}

	function findMatchingHierarchicalFacetFromAttributeName(hierarchicalFacets, hierarchicalAttributeName) {
	  return find(
	    hierarchicalFacets,
	    function facetKeyMatchesAttribute(hierarchicalFacet) {
	      return includes(hierarchicalFacet.attributes, hierarchicalAttributeName);
	    }
	  );
	}

	/*eslint-disable */
	/**
	 * Constructor for SearchResults
	 * @class
	 * @classdesc SearchResults contains the results of a query to Algolia using the
	 * {@link AlgoliaSearchHelper}.
	 * @param {SearchParameters} state state that led to the response
	 * @param {object} algoliaResponse the response from algolia client
	 * @example <caption>SearchResults of the first query in
	 * <a href="http://demos.algolia.com/instant-search-demo">the instant search demo</a></caption>
	{
	   "hitsPerPage": 10,
	   "processingTimeMS": 2,
	   "facets": [
	      {
	         "name": "type",
	         "data": {
	            "HardGood": 6627,
	            "BlackTie": 550,
	            "Music": 665,
	            "Software": 131,
	            "Game": 456,
	            "Movie": 1571
	         },
	         "exhaustive": false
	      },
	      {
	         "exhaustive": false,
	         "data": {
	            "Free shipping": 5507
	         },
	         "name": "shipping"
	      }
	  ],
	   "hits": [
	      {
	         "thumbnailImage": "http://img.bbystatic.com/BestBuy_US/images/products/1688/1688832_54x108_s.gif",
	         "_highlightResult": {
	            "shortDescription": {
	               "matchLevel": "none",
	               "value": "Safeguard your PC, Mac, Android and iOS devices with comprehensive Internet protection",
	               "matchedWords": []
	            },
	            "category": {
	               "matchLevel": "none",
	               "value": "Computer Security Software",
	               "matchedWords": []
	            },
	            "manufacturer": {
	               "matchedWords": [],
	               "value": "Webroot",
	               "matchLevel": "none"
	            },
	            "name": {
	               "value": "Webroot SecureAnywhere Internet Security (3-Device) (1-Year Subscription) - Mac/Windows",
	               "matchedWords": [],
	               "matchLevel": "none"
	            }
	         },
	         "image": "http://img.bbystatic.com/BestBuy_US/images/products/1688/1688832_105x210_sc.jpg",
	         "shipping": "Free shipping",
	         "bestSellingRank": 4,
	         "shortDescription": "Safeguard your PC, Mac, Android and iOS devices with comprehensive Internet protection",
	         "url": "http://www.bestbuy.com/site/webroot-secureanywhere-internet-security-3-devi…d=1219060687969&skuId=1688832&cmp=RMX&ky=2d3GfEmNIzjA0vkzveHdZEBgpPCyMnLTJ",
	         "name": "Webroot SecureAnywhere Internet Security (3-Device) (1-Year Subscription) - Mac/Windows",
	         "category": "Computer Security Software",
	         "salePrice_range": "1 - 50",
	         "objectID": "1688832",
	         "type": "Software",
	         "customerReviewCount": 5980,
	         "salePrice": 49.99,
	         "manufacturer": "Webroot"
	      },
	      ....
	  ],
	   "nbHits": 10000,
	   "disjunctiveFacets": [
	      {
	         "exhaustive": false,
	         "data": {
	            "5": 183,
	            "12": 112,
	            "7": 149,
	            ...
	         },
	         "name": "customerReviewCount",
	         "stats": {
	            "max": 7461,
	            "avg": 157.939,
	            "min": 1
	         }
	      },
	      {
	         "data": {
	            "Printer Ink": 142,
	            "Wireless Speakers": 60,
	            "Point & Shoot Cameras": 48,
	            ...
	         },
	         "name": "category",
	         "exhaustive": false
	      },
	      {
	         "exhaustive": false,
	         "data": {
	            "> 5000": 2,
	            "1 - 50": 6524,
	            "501 - 2000": 566,
	            "201 - 500": 1501,
	            "101 - 200": 1360,
	            "2001 - 5000": 47
	         },
	         "name": "salePrice_range"
	      },
	      {
	         "data": {
	            "Dynex™": 202,
	            "Insignia™": 230,
	            "PNY": 72,
	            ...
	         },
	         "name": "manufacturer",
	         "exhaustive": false
	      }
	  ],
	   "query": "",
	   "nbPages": 100,
	   "page": 0,
	   "index": "bestbuy"
	}
	 **/
	/*eslint-enable */
	function SearchResults(state, algoliaResponse) {
	  var mainSubResponse = algoliaResponse.results[0];

	  /**
	   * query used to generate the results
	   * @member {string}
	   */
	  this.query = mainSubResponse.query;
	  /**
	   * The query as parsed by the engine given all the rules.
	   * @member {string}
	   */
	  this.parsedQuery = mainSubResponse.parsedQuery;
	  /**
	   * all the records that match the search parameters. Each record is
	   * augmented with a new attribute `_highlightResult`
	   * which is an object keyed by attribute and with the following properties:
	   *  - `value` : the value of the facet highlighted (html)
	   *  - `matchLevel`: full, partial or none depending on how the query terms match
	   * @member {object[]}
	   */
	  this.hits = mainSubResponse.hits;
	  /**
	   * index where the results come from
	   * @member {string}
	   */
	  this.index = mainSubResponse.index;
	  /**
	   * number of hits per page requested
	   * @member {number}
	   */
	  this.hitsPerPage = mainSubResponse.hitsPerPage;
	  /**
	   * total number of hits of this query on the index
	   * @member {number}
	   */
	  this.nbHits = mainSubResponse.nbHits;
	  /**
	   * total number of pages with respect to the number of hits per page and the total number of hits
	   * @member {number}
	   */
	  this.nbPages = mainSubResponse.nbPages;
	  /**
	   * current page
	   * @member {number}
	   */
	  this.page = mainSubResponse.page;
	  /**
	   * sum of the processing time of all the queries
	   * @member {number}
	   */
	  this.processingTimeMS = sumBy(algoliaResponse.results, 'processingTimeMS');
	  /**
	   * The position if the position was guessed by IP.
	   * @member {string}
	   * @example "48.8637,2.3615",
	   */
	  this.aroundLatLng = mainSubResponse.aroundLatLng;
	  /**
	   * The radius computed by Algolia.
	   * @member {string}
	   * @example "126792922",
	   */
	  this.automaticRadius = mainSubResponse.automaticRadius;
	  /**
	   * String identifying the server used to serve this request.
	   * @member {string}
	   * @example "c7-use-2.algolia.net",
	   */
	  this.serverUsed = mainSubResponse.serverUsed;
	  /**
	   * Boolean that indicates if the computation of the counts did time out.
	   * @member {boolean}
	   */
	  this.timeoutCounts = mainSubResponse.timeoutCounts;
	  /**
	   * Boolean that indicates if the computation of the hits did time out.
	   * @member {boolean}
	   */
	  this.timeoutHits = mainSubResponse.timeoutHits;

	  /**
	   * disjunctive facets results
	   * @member {SearchResults.Facet[]}
	   */
	  this.disjunctiveFacets = [];
	  /**
	   * disjunctive facets results
	   * @member {SearchResults.HierarchicalFacet[]}
	   */
	  this.hierarchicalFacets = map(state.hierarchicalFacets, function initFutureTree() {
	    return [];
	  });
	  /**
	   * other facets results
	   * @member {SearchResults.Facet[]}
	   */
	  this.facets = [];

	  var disjunctiveFacets = state.getRefinedDisjunctiveFacets();

	  var facetsIndices = getIndices(state.facets);
	  var disjunctiveFacetsIndices = getIndices(state.disjunctiveFacets);
	  var nextDisjunctiveResult = 1;

	  var self = this;
	  // Since we send request only for disjunctive facets that have been refined,
	  // we get the facets informations from the first, general, response.
	  forEach(mainSubResponse.facets, function(facetValueObject, facetKey) {
	    var hierarchicalFacet = findMatchingHierarchicalFacetFromAttributeName(
	      state.hierarchicalFacets,
	      facetKey
	    );

	    if (hierarchicalFacet) {
	      // Place the hierarchicalFacet data at the correct index depending on
	      // the attributes order that was defined at the helper initialization
	      var facetIndex = hierarchicalFacet.attributes.indexOf(facetKey);
	      var idxAttributeName = findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name});
	      self.hierarchicalFacets[idxAttributeName][facetIndex] = {
	        attribute: facetKey,
	        data: facetValueObject,
	        exhaustive: mainSubResponse.exhaustiveFacetsCount
	      };
	    } else {
	      var isFacetDisjunctive = indexOf(state.disjunctiveFacets, facetKey) !== -1;
	      var isFacetConjunctive = indexOf(state.facets, facetKey) !== -1;
	      var position;

	      if (isFacetDisjunctive) {
	        position = disjunctiveFacetsIndices[facetKey];
	        self.disjunctiveFacets[position] = {
	          name: facetKey,
	          data: facetValueObject,
	          exhaustive: mainSubResponse.exhaustiveFacetsCount
	        };
	        assignFacetStats(self.disjunctiveFacets[position], mainSubResponse.facets_stats, facetKey);
	      }
	      if (isFacetConjunctive) {
	        position = facetsIndices[facetKey];
	        self.facets[position] = {
	          name: facetKey,
	          data: facetValueObject,
	          exhaustive: mainSubResponse.exhaustiveFacetsCount
	        };
	        assignFacetStats(self.facets[position], mainSubResponse.facets_stats, facetKey);
	      }
	    }
	  });

	  // Make sure we do not keep holes within the hierarchical facets
	  this.hierarchicalFacets = compact(this.hierarchicalFacets);

	  // aggregate the refined disjunctive facets
	  forEach(disjunctiveFacets, function(disjunctiveFacet) {
	    var result = algoliaResponse.results[nextDisjunctiveResult];
	    var hierarchicalFacet = state.getHierarchicalFacetByName(disjunctiveFacet);

	    // There should be only item in facets.
	    forEach(result.facets, function(facetResults, dfacet) {
	      var position;

	      if (hierarchicalFacet) {
	        position = findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name});
	        var attributeIndex = findIndex(self.hierarchicalFacets[position], {attribute: dfacet});

	        // previous refinements and no results so not able to find it
	        if (attributeIndex === -1) {
	          return;
	        }

	        self.hierarchicalFacets[position][attributeIndex].data = merge(
	          {},
	          self.hierarchicalFacets[position][attributeIndex].data,
	          facetResults
	        );
	      } else {
	        position = disjunctiveFacetsIndices[dfacet];

	        var dataFromMainRequest = mainSubResponse.facets && mainSubResponse.facets[dfacet] || {};

	        self.disjunctiveFacets[position] = {
	          name: dfacet,
	          data: defaults({}, facetResults, dataFromMainRequest),
	          exhaustive: result.exhaustiveFacetsCount
	        };
	        assignFacetStats(self.disjunctiveFacets[position], result.facets_stats, dfacet);

	        if (state.disjunctiveFacetsRefinements[dfacet]) {
	          forEach(state.disjunctiveFacetsRefinements[dfacet], function(refinementValue) {
	            // add the disjunctive refinements if it is no more retrieved
	            if (!self.disjunctiveFacets[position].data[refinementValue] &&
	              indexOf(state.disjunctiveFacetsRefinements[dfacet], refinementValue) > -1) {
	              self.disjunctiveFacets[position].data[refinementValue] = 0;
	            }
	          });
	        }
	      }
	    });
	    nextDisjunctiveResult++;
	  });

	  // if we have some root level values for hierarchical facets, merge them
	  forEach(state.getRefinedHierarchicalFacets(), function(refinedFacet) {
	    var hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);
	    var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);

	    var currentRefinement = state.getHierarchicalRefinement(refinedFacet);
	    // if we are already at a root refinement (or no refinement at all), there is no
	    // root level values request
	    if (currentRefinement.length === 0 || currentRefinement[0].split(separator).length < 2) {
	      return;
	    }

	    var result = algoliaResponse.results[nextDisjunctiveResult];

	    forEach(result.facets, function(facetResults, dfacet) {
	      var position = findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name});
	      var attributeIndex = findIndex(self.hierarchicalFacets[position], {attribute: dfacet});

	      // previous refinements and no results so not able to find it
	      if (attributeIndex === -1) {
	        return;
	      }

	      // when we always get root levels, if the hits refinement is `beers > IPA` (count: 5),
	      // then the disjunctive values will be `beers` (count: 100),
	      // but we do not want to display
	      //   | beers (100)
	      //     > IPA (5)
	      // We want
	      //   | beers (5)
	      //     > IPA (5)
	      var defaultData = {};

	      if (currentRefinement.length > 0) {
	        var root = currentRefinement[0].split(separator)[0];
	        defaultData[root] = self.hierarchicalFacets[position][attributeIndex].data[root];
	      }

	      self.hierarchicalFacets[position][attributeIndex].data = defaults(
	        defaultData,
	        facetResults,
	        self.hierarchicalFacets[position][attributeIndex].data
	      );
	    });

	    nextDisjunctiveResult++;
	  });

	  // add the excludes
	  forEach(state.facetsExcludes, function(excludes, facetName) {
	    var position = facetsIndices[facetName];

	    self.facets[position] = {
	      name: facetName,
	      data: mainSubResponse.facets[facetName],
	      exhaustive: mainSubResponse.exhaustiveFacetsCount
	    };
	    forEach(excludes, function(facetValue) {
	      self.facets[position] = self.facets[position] || {name: facetName};
	      self.facets[position].data = self.facets[position].data || {};
	      self.facets[position].data[facetValue] = 0;
	    });
	  });

	  this.hierarchicalFacets = map(this.hierarchicalFacets, generateHierarchicalTree(state));

	  this.facets = compact(this.facets);
	  this.disjunctiveFacets = compact(this.disjunctiveFacets);

	  this._state = state;
	}

	/**
	 * Get a facet object with its name
	 * @deprecated
	 * @param {string} name name of the attribute facetted
	 * @return {SearchResults.Facet} the facet object
	 */
	SearchResults.prototype.getFacetByName = function(name) {
	  var predicate = {name: name};

	  return find(this.facets, predicate) ||
	    find(this.disjunctiveFacets, predicate) ||
	    find(this.hierarchicalFacets, predicate);
	};

	/**
	 * Get the facet values of a specified attribute from a SearchResults object.
	 * @private
	 * @param {SearchResults} results the search results to search in
	 * @param {string} attribute name of the facetted attribute to search for
	 * @return {array|object} facet values. For the hierarchical facets it is an object.
	 */
	function extractNormalizedFacetValues(results, attribute) {
	  var predicate = {name: attribute};
	  if (results._state.isConjunctiveFacet(attribute)) {
	    var facet = find(results.facets, predicate);
	    if (!facet) return [];

	    return map(facet.data, function(v, k) {
	      return {
	        name: k,
	        count: v,
	        isRefined: results._state.isFacetRefined(attribute, k),
	        isExcluded: results._state.isExcludeRefined(attribute, k)
	      };
	    });
	  } else if (results._state.isDisjunctiveFacet(attribute)) {
	    var disjunctiveFacet = find(results.disjunctiveFacets, predicate);
	    if (!disjunctiveFacet) return [];

	    return map(disjunctiveFacet.data, function(v, k) {
	      return {
	        name: k,
	        count: v,
	        isRefined: results._state.isDisjunctiveFacetRefined(attribute, k)
	      };
	    });
	  } else if (results._state.isHierarchicalFacet(attribute)) {
	    return find(results.hierarchicalFacets, predicate);
	  }
	}

	/**
	 * Sort nodes of a hierarchical facet results
	 * @private
	 * @param {HierarchicalFacet} node node to upon which we want to apply the sort
	 */
	function recSort(sortFn, node) {
	  if (!node.data || node.data.length === 0) {
	    return node;
	  }
	  var children = map(node.data, partial(recSort, sortFn));
	  var sortedChildren = sortFn(children);
	  var newNode = merge({}, node, {data: sortedChildren});
	  return newNode;
	}

	SearchResults.DEFAULT_SORT = ['isRefined:desc', 'count:desc', 'name:asc'];

	function vanillaSortFn(order, data) {
	  return data.sort(order);
	}

	/**
	 * Get a the list of values for a given facet attribute. Those values are sorted
	 * refinement first, descending count (bigger value on top), and name ascending
	 * (alphabetical order). The sort formula can overridden using either string based
	 * predicates or a function.
	 *
	 * This method will return all the values returned by the Algolia engine plus all
	 * the values already refined. This means that it can happen that the
	 * `maxValuesPerFacet` [configuration](https://www.algolia.com/doc/rest-api/search#param-maxValuesPerFacet)
	 * might not be respected if you have facet values that are already refined.
	 * @param {string} attribute attribute name
	 * @param {object} opts configuration options.
	 * @param {Array.<string> | function} opts.sortBy
	 * When using strings, it consists of
	 * the name of the [FacetValue](#SearchResults.FacetValue) or the
	 * [HierarchicalFacet](#SearchResults.HierarchicalFacet) attributes with the
	 * order (`asc` or `desc`). For example to order the value by count, the
	 * argument would be `['count:asc']`.
	 *
	 * If only the attribute name is specified, the ordering defaults to the one
	 * specified in the default value for this attribute.
	 *
	 * When not specified, the order is
	 * ascending.  This parameter can also be a function which takes two facet
	 * values and should return a number, 0 if equal, 1 if the first argument is
	 * bigger or -1 otherwise.
	 *
	 * The default value for this attribute `['isRefined:desc', 'count:desc', 'name:asc']`
	 * @return {FacetValue[]|HierarchicalFacet} depending on the type of facet of
	 * the attribute requested (hierarchical, disjunctive or conjunctive)
	 * @example
	 * helper.on('results', function(content){
	 *   //get values ordered only by name ascending using the string predicate
	 *   content.getFacetValues('city', {sortBy: ['name:asc']);
	 *   //get values  ordered only by count ascending using a function
	 *   content.getFacetValues('city', {
	 *     // this is equivalent to ['count:asc']
	 *     sortBy: function(a, b) {
	 *       if (a.count === b.count) return 0;
	 *       if (a.count > b.count)   return 1;
	 *       if (b.count > a.count)   return -1;
	 *     }
	 *   });
	 * });
	 */
	SearchResults.prototype.getFacetValues = function(attribute, opts) {
	  var facetValues = extractNormalizedFacetValues(this, attribute);
	  if (!facetValues) throw new Error(attribute + ' is not a retrieved facet.');

	  var options = defaults({}, opts, {sortBy: SearchResults.DEFAULT_SORT});

	  if (isArray(options.sortBy)) {
	    var order = formatSort(options.sortBy, SearchResults.DEFAULT_SORT);
	    if (isArray(facetValues)) {
	      return orderBy(facetValues, order[0], order[1]);
	    }
	    // If facetValues is not an array, it's an object thus a hierarchical facet object
	    return recSort(partialRight(orderBy, order[0], order[1]), facetValues);
	  } else if (isFunction(options.sortBy)) {
	    if (isArray(facetValues)) {
	      return facetValues.sort(options.sortBy);
	    }
	    // If facetValues is not an array, it's an object thus a hierarchical facet object
	    return recSort(partial(vanillaSortFn, options.sortBy), facetValues);
	  }
	  throw new Error(
	    'options.sortBy is optional but if defined it must be ' +
	    'either an array of string (predicates) or a sorting function'
	  );
	};

	/**
	 * Returns the facet stats if attribute is defined and the facet contains some.
	 * Otherwise returns undefined.
	 * @param {string} attribute name of the facetted attribute
	 * @return {object} The stats of the facet
	 */
	SearchResults.prototype.getFacetStats = function(attribute) {
	  if (this._state.isConjunctiveFacet(attribute)) {
	    return getFacetStatsIfAvailable(this.facets, attribute);
	  } else if (this._state.isDisjunctiveFacet(attribute)) {
	    return getFacetStatsIfAvailable(this.disjunctiveFacets, attribute);
	  }

	  throw new Error(attribute + ' is not present in `facets` or `disjunctiveFacets`');
	};

	function getFacetStatsIfAvailable(facetList, facetName) {
	  var data = find(facetList, {name: facetName});
	  return data && data.stats;
	}

	/**
	 * Returns all refinements for all filters + tags. It also provides
	 * additional information: count and exhausistivity for each filter.
	 *
	 * See the [refinement type](#Refinement) for an exhaustive view of the available
	 * data.
	 *
	 * @return {Array.<Refinement>} all the refinements
	 */
	SearchResults.prototype.getRefinements = function() {
	  var state = this._state;
	  var results = this;
	  var res = [];

	  forEach(state.facetsRefinements, function(refinements, attributeName) {
	    forEach(refinements, function(name) {
	      res.push(getRefinement(state, 'facet', attributeName, name, results.facets));
	    });
	  });

	  forEach(state.facetsExcludes, function(refinements, attributeName) {
	    forEach(refinements, function(name) {
	      res.push(getRefinement(state, 'exclude', attributeName, name, results.facets));
	    });
	  });

	  forEach(state.disjunctiveFacetsRefinements, function(refinements, attributeName) {
	    forEach(refinements, function(name) {
	      res.push(getRefinement(state, 'disjunctive', attributeName, name, results.disjunctiveFacets));
	    });
	  });

	  forEach(state.hierarchicalFacetsRefinements, function(refinements, attributeName) {
	    forEach(refinements, function(name) {
	      res.push(getHierarchicalRefinement(state, attributeName, name, results.hierarchicalFacets));
	    });
	  });

	  forEach(state.numericRefinements, function(operators, attributeName) {
	    forEach(operators, function(values, operator) {
	      forEach(values, function(value) {
	        res.push({
	          type: 'numeric',
	          attributeName: attributeName,
	          name: value,
	          numericValue: value,
	          operator: operator
	        });
	      });
	    });
	  });

	  forEach(state.tagRefinements, function(name) {
	    res.push({type: 'tag', attributeName: '_tags', name: name});
	  });

	  return res;
	};

	function getRefinement(state, type, attributeName, name, resultsFacets) {
	  var facet = find(resultsFacets, {name: attributeName});
	  var count = get(facet, 'data[' + name + ']');
	  var exhaustive = get(facet, 'exhaustive');
	  return {
	    type: type,
	    attributeName: attributeName,
	    name: name,
	    count: count || 0,
	    exhaustive: exhaustive || false
	  };
	}

	function getHierarchicalRefinement(state, attributeName, name, resultsFacets) {
	  var facet = find(resultsFacets, {name: attributeName});
	  var facetDeclaration = state.getHierarchicalFacetByName(attributeName);
	  var splitted = name.split(facetDeclaration.separator);
	  var configuredName = splitted[splitted.length - 1];
	  for (var i = 0; facet !== undefined && i < splitted.length; ++i) {
	    facet = find(facet.data, {name: splitted[i]});
	  }
	  var count = get(facet, 'count');
	  var exhaustive = get(facet, 'exhaustive');
	  return {
	    type: 'hierarchical',
	    attributeName: attributeName,
	    name: configuredName,
	    count: count || 0,
	    exhaustive: exhaustive || false
	  };
	}

	module.exports = SearchResults;


/***/ },
/* 263 */
/***/ function(module, exports) {

	/**
	 * Creates an array with all falsey values removed. The values `false`, `null`,
	 * `0`, `""`, `undefined`, and `NaN` are falsey.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to compact.
	 * @returns {Array} Returns the new array of filtered values.
	 * @example
	 *
	 * _.compact([0, 1, false, 2, '', 3]);
	 * // => [1, 2, 3]
	 */
	function compact(array) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (value) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	module.exports = compact;


/***/ },
/* 264 */
/***/ function(module, exports, __webpack_require__) {

	var baseIteratee = __webpack_require__(135),
	    baseSum = __webpack_require__(265);

	/**
	 * This method is like `_.sum` except that it accepts `iteratee` which is
	 * invoked for each element in `array` to generate the value to be summed.
	 * The iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Math
	 * @param {Array} array The array to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	 * @returns {number} Returns the sum.
	 * @example
	 *
	 * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
	 *
	 * _.sumBy(objects, function(o) { return o.n; });
	 * // => 20
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.sumBy(objects, 'n');
	 * // => 20
	 */
	function sumBy(array, iteratee) {
	  return (array && array.length)
	    ? baseSum(array, baseIteratee(iteratee, 2))
	    : 0;
	}

	module.exports = sumBy;


/***/ },
/* 265 */
/***/ function(module, exports) {

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

	module.exports = baseSum;


/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(106),
	    isArrayLike = __webpack_require__(66),
	    isString = __webpack_require__(236),
	    toInteger = __webpack_require__(228),
	    values = __webpack_require__(267);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Checks if `value` is in `collection`. If `collection` is a string, it's
	 * checked for a substring of `value`, otherwise
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * is used for equality comparisons. If `fromIndex` is negative, it's used as
	 * the offset from the end of `collection`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	 * @returns {boolean} Returns `true` if `value` is found, else `false`.
	 * @example
	 *
	 * _.includes([1, 2, 3], 1);
	 * // => true
	 *
	 * _.includes([1, 2, 3], 1, 2);
	 * // => false
	 *
	 * _.includes({ 'a': 1, 'b': 2 }, 1);
	 * // => true
	 *
	 * _.includes('abcd', 'bc');
	 * // => true
	 */
	function includes(collection, value, fromIndex, guard) {
	  collection = isArrayLike(collection) ? collection : values(collection);
	  fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

	  var length = collection.length;
	  if (fromIndex < 0) {
	    fromIndex = nativeMax(length + fromIndex, 0);
	  }
	  return isString(collection)
	    ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
	    : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
	}

	module.exports = includes;


/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

	var baseValues = __webpack_require__(268),
	    keys = __webpack_require__(40);

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
	  return object == null ? [] : baseValues(object, keys(object));
	}

	module.exports = values;


/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(70);

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
	  return arrayMap(props, function(key) {
	    return object[key];
	  });
	}

	module.exports = baseValues;


/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

	var baseOrderBy = __webpack_require__(270),
	    isArray = __webpack_require__(52);

	/**
	 * This method is like `_.sortBy` except that it allows specifying the sort
	 * orders of the iteratees to sort by. If `orders` is unspecified, all values
	 * are sorted in ascending order. Otherwise, specify an order of "desc" for
	 * descending or "asc" for ascending sort order of corresponding values.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
	 *  The iteratees to sort by.
	 * @param {string[]} [orders] The sort orders of `iteratees`.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	 * @returns {Array} Returns the new sorted array.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'fred',   'age': 48 },
	 *   { 'user': 'barney', 'age': 34 },
	 *   { 'user': 'fred',   'age': 40 },
	 *   { 'user': 'barney', 'age': 36 }
	 * ];
	 *
	 * // Sort by `user` in ascending order and by `age` in descending order.
	 * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
	 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
	 */
	function orderBy(collection, iteratees, orders, guard) {
	  if (collection == null) {
	    return [];
	  }
	  if (!isArray(iteratees)) {
	    iteratees = iteratees == null ? [] : [iteratees];
	  }
	  orders = guard ? undefined : orders;
	  if (!isArray(orders)) {
	    orders = orders == null ? [] : [orders];
	  }
	  return baseOrderBy(collection, iteratees, orders);
	}

	module.exports = orderBy;


/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(70),
	    baseIteratee = __webpack_require__(135),
	    baseMap = __webpack_require__(180),
	    baseSortBy = __webpack_require__(271),
	    baseUnary = __webpack_require__(60),
	    compareMultiple = __webpack_require__(272),
	    identity = __webpack_require__(113);

	/**
	 * The base implementation of `_.orderBy` without param guards.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	 * @param {string[]} orders The sort orders of `iteratees`.
	 * @returns {Array} Returns the new sorted array.
	 */
	function baseOrderBy(collection, iteratees, orders) {
	  var index = -1;
	  iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

	  var result = baseMap(collection, function(value, key, collection) {
	    var criteria = arrayMap(iteratees, function(iteratee) {
	      return iteratee(value);
	    });
	    return { 'criteria': criteria, 'index': ++index, 'value': value };
	  });

	  return baseSortBy(result, function(object, other) {
	    return compareMultiple(object, other, orders);
	  });
	}

	module.exports = baseOrderBy;


/***/ },
/* 271 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.sortBy` which uses `comparer` to define the
	 * sort order of `array` and replaces criteria objects with their corresponding
	 * values.
	 *
	 * @private
	 * @param {Array} array The array to sort.
	 * @param {Function} comparer The function to define sort order.
	 * @returns {Array} Returns `array`.
	 */
	function baseSortBy(array, comparer) {
	  var length = array.length;

	  array.sort(comparer);
	  while (length--) {
	    array[length] = array[length].value;
	  }
	  return array;
	}

	module.exports = baseSortBy;


/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	var compareAscending = __webpack_require__(273);

	/**
	 * Used by `_.orderBy` to compare multiple properties of a value to another
	 * and stable sort them.
	 *
	 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
	 * specify an order of "desc" for descending or "asc" for ascending sort order
	 * of corresponding values.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {boolean[]|string[]} orders The order to sort by for each property.
	 * @returns {number} Returns the sort order indicator for `object`.
	 */
	function compareMultiple(object, other, orders) {
	  var index = -1,
	      objCriteria = object.criteria,
	      othCriteria = other.criteria,
	      length = objCriteria.length,
	      ordersLength = orders.length;

	  while (++index < length) {
	    var result = compareAscending(objCriteria[index], othCriteria[index]);
	    if (result) {
	      if (index >= ordersLength) {
	        return result;
	      }
	      var order = orders[index];
	      return result * (order == 'desc' ? -1 : 1);
	    }
	  }
	  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	  // that causes it, under certain circumstances, to provide the same value for
	  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
	  // for more details.
	  //
	  // This also ensures a stable sort in V8 and other engines.
	  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
	  return object.index - other.index;
	}

	module.exports = compareMultiple;


/***/ },
/* 273 */
/***/ function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(166);

	/**
	 * Compares values to sort them in ascending order.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {number} Returns the sort order indicator for `value`.
	 */
	function compareAscending(value, other) {
	  if (value !== other) {
	    var valIsDefined = value !== undefined,
	        valIsNull = value === null,
	        valIsReflexive = value === value,
	        valIsSymbol = isSymbol(value);

	    var othIsDefined = other !== undefined,
	        othIsNull = other === null,
	        othIsReflexive = other === other,
	        othIsSymbol = isSymbol(other);

	    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
	        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
	        (valIsNull && othIsDefined && othIsReflexive) ||
	        (!valIsDefined && othIsReflexive) ||
	        !valIsReflexive) {
	      return 1;
	    }
	    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
	        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
	        (othIsNull && valIsDefined && valIsReflexive) ||
	        (!othIsDefined && valIsReflexive) ||
	        !othIsReflexive) {
	      return -1;
	    }
	  }
	  return 0;
	}

	module.exports = compareAscending;


/***/ },
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(112),
	    createWrap = __webpack_require__(275),
	    getHolder = __webpack_require__(301),
	    replaceHolders = __webpack_require__(303);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_PARTIAL_FLAG = 32;

	/**
	 * Creates a function that invokes `func` with `partials` prepended to the
	 * arguments it receives. This method is like `_.bind` except it does **not**
	 * alter the `this` binding.
	 *
	 * The `_.partial.placeholder` value, which defaults to `_` in monolithic
	 * builds, may be used as a placeholder for partially applied arguments.
	 *
	 * **Note:** This method doesn't set the "length" property of partially
	 * applied functions.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.2.0
	 * @category Function
	 * @param {Function} func The function to partially apply arguments to.
	 * @param {...*} [partials] The arguments to be partially applied.
	 * @returns {Function} Returns the new partially applied function.
	 * @example
	 *
	 * function greet(greeting, name) {
	 *   return greeting + ' ' + name;
	 * }
	 *
	 * var sayHelloTo = _.partial(greet, 'hello');
	 * sayHelloTo('fred');
	 * // => 'hello fred'
	 *
	 * // Partially applied with placeholders.
	 * var greetFred = _.partial(greet, _, 'fred');
	 * greetFred('hi');
	 * // => 'hi fred'
	 */
	var partial = baseRest(function(func, partials) {
	  var holders = replaceHolders(partials, getHolder(partial));
	  return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
	});

	// Assign default placeholders.
	partial.placeholder = {};

	module.exports = partial;


/***/ },
/* 275 */
/***/ function(module, exports, __webpack_require__) {

	var baseSetData = __webpack_require__(276),
	    createBind = __webpack_require__(278),
	    createCurry = __webpack_require__(280),
	    createHybrid = __webpack_require__(281),
	    createPartial = __webpack_require__(304),
	    getData = __webpack_require__(289),
	    mergeData = __webpack_require__(305),
	    setData = __webpack_require__(296),
	    setWrapToString = __webpack_require__(297),
	    toInteger = __webpack_require__(228);

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_CURRY_RIGHT_FLAG = 16,
	    WRAP_PARTIAL_FLAG = 32,
	    WRAP_PARTIAL_RIGHT_FLAG = 64;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that either curries or invokes `func` with optional
	 * `this` binding and partially applied arguments.
	 *
	 * @private
	 * @param {Function|string} func The function or method name to wrap.
	 * @param {number} bitmask The bitmask flags.
	 *    1 - `_.bind`
	 *    2 - `_.bindKey`
	 *    4 - `_.curry` or `_.curryRight` of a bound function
	 *    8 - `_.curry`
	 *   16 - `_.curryRight`
	 *   32 - `_.partial`
	 *   64 - `_.partialRight`
	 *  128 - `_.rearg`
	 *  256 - `_.ary`
	 *  512 - `_.flip`
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to be partially applied.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
	  var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
	  if (!isBindKey && typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var length = partials ? partials.length : 0;
	  if (!length) {
	    bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
	    partials = holders = undefined;
	  }
	  ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
	  arity = arity === undefined ? arity : toInteger(arity);
	  length -= holders ? holders.length : 0;

	  if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
	    var partialsRight = partials,
	        holdersRight = holders;

	    partials = holders = undefined;
	  }
	  var data = isBindKey ? undefined : getData(func);

	  var newData = [
	    func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
	    argPos, ary, arity
	  ];

	  if (data) {
	    mergeData(newData, data);
	  }
	  func = newData[0];
	  bitmask = newData[1];
	  thisArg = newData[2];
	  partials = newData[3];
	  holders = newData[4];
	  arity = newData[9] = newData[9] == null
	    ? (isBindKey ? 0 : func.length)
	    : nativeMax(newData[9] - length, 0);

	  if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
	    bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
	  }
	  if (!bitmask || bitmask == WRAP_BIND_FLAG) {
	    var result = createBind(func, bitmask, thisArg);
	  } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
	    result = createCurry(func, bitmask, arity);
	  } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
	    result = createPartial(func, bitmask, thisArg, partials);
	  } else {
	    result = createHybrid.apply(undefined, newData);
	  }
	  var setter = data ? baseSetData : setData;
	  return setWrapToString(setter(result, newData), func, bitmask);
	}

	module.exports = createWrap;


/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(113),
	    metaMap = __webpack_require__(277);

	/**
	 * The base implementation of `setData` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to associate metadata with.
	 * @param {*} data The metadata.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetData = !metaMap ? identity : function(func, data) {
	  metaMap.set(func, data);
	  return func;
	};

	module.exports = baseSetData;


/***/ },
/* 277 */
/***/ function(module, exports, __webpack_require__) {

	var WeakMap = __webpack_require__(157);

	/** Used to store function metadata. */
	var metaMap = WeakMap && new WeakMap;

	module.exports = metaMap;


/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {

	var createCtor = __webpack_require__(279),
	    root = __webpack_require__(47);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1;

	/**
	 * Creates a function that wraps `func` to invoke it with the optional `this`
	 * binding of `thisArg`.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createBind(func, bitmask, thisArg) {
	  var isBind = bitmask & WRAP_BIND_FLAG,
	      Ctor = createCtor(func);

	  function wrapper() {
	    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	    return fn.apply(isBind ? thisArg : this, arguments);
	  }
	  return wrapper;
	}

	module.exports = createBind;


/***/ },
/* 279 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(218),
	    isObject = __webpack_require__(68);

	/**
	 * Creates a function that produces an instance of `Ctor` regardless of
	 * whether it was invoked as part of a `new` expression or by `call` or `apply`.
	 *
	 * @private
	 * @param {Function} Ctor The constructor to wrap.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createCtor(Ctor) {
	  return function() {
	    // Use a `switch` statement to work with class constructors. See
	    // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
	    // for more details.
	    var args = arguments;
	    switch (args.length) {
	      case 0: return new Ctor;
	      case 1: return new Ctor(args[0]);
	      case 2: return new Ctor(args[0], args[1]);
	      case 3: return new Ctor(args[0], args[1], args[2]);
	      case 4: return new Ctor(args[0], args[1], args[2], args[3]);
	      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
	      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
	      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	    }
	    var thisBinding = baseCreate(Ctor.prototype),
	        result = Ctor.apply(thisBinding, args);

	    // Mimic the constructor's `return` behavior.
	    // See https://es5.github.io/#x13.2.2 for more details.
	    return isObject(result) ? result : thisBinding;
	  };
	}

	module.exports = createCtor;


/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(115),
	    createCtor = __webpack_require__(279),
	    createHybrid = __webpack_require__(281),
	    createRecurry = __webpack_require__(285),
	    getHolder = __webpack_require__(301),
	    replaceHolders = __webpack_require__(303),
	    root = __webpack_require__(47);

	/**
	 * Creates a function that wraps `func` to enable currying.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {number} arity The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createCurry(func, bitmask, arity) {
	  var Ctor = createCtor(func);

	  function wrapper() {
	    var length = arguments.length,
	        args = Array(length),
	        index = length,
	        placeholder = getHolder(wrapper);

	    while (index--) {
	      args[index] = arguments[index];
	    }
	    var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
	      ? []
	      : replaceHolders(args, placeholder);

	    length -= holders.length;
	    if (length < arity) {
	      return createRecurry(
	        func, bitmask, createHybrid, wrapper.placeholder, undefined,
	        args, holders, undefined, undefined, arity - length);
	    }
	    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	    return apply(fn, this, args);
	  }
	  return wrapper;
	}

	module.exports = createCurry;


/***/ },
/* 281 */
/***/ function(module, exports, __webpack_require__) {

	var composeArgs = __webpack_require__(282),
	    composeArgsRight = __webpack_require__(283),
	    countHolders = __webpack_require__(284),
	    createCtor = __webpack_require__(279),
	    createRecurry = __webpack_require__(285),
	    getHolder = __webpack_require__(301),
	    reorder = __webpack_require__(302),
	    replaceHolders = __webpack_require__(303),
	    root = __webpack_require__(47);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_CURRY_RIGHT_FLAG = 16,
	    WRAP_ARY_FLAG = 128,
	    WRAP_FLIP_FLAG = 512;

	/**
	 * Creates a function that wraps `func` to invoke it with optional `this`
	 * binding of `thisArg`, partial application, and currying.
	 *
	 * @private
	 * @param {Function|string} func The function or method name to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to prepend to those provided to
	 *  the new function.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [partialsRight] The arguments to append to those provided
	 *  to the new function.
	 * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
	  var isAry = bitmask & WRAP_ARY_FLAG,
	      isBind = bitmask & WRAP_BIND_FLAG,
	      isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
	      isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
	      isFlip = bitmask & WRAP_FLIP_FLAG,
	      Ctor = isBindKey ? undefined : createCtor(func);

	  function wrapper() {
	    var length = arguments.length,
	        args = Array(length),
	        index = length;

	    while (index--) {
	      args[index] = arguments[index];
	    }
	    if (isCurried) {
	      var placeholder = getHolder(wrapper),
	          holdersCount = countHolders(args, placeholder);
	    }
	    if (partials) {
	      args = composeArgs(args, partials, holders, isCurried);
	    }
	    if (partialsRight) {
	      args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
	    }
	    length -= holdersCount;
	    if (isCurried && length < arity) {
	      var newHolders = replaceHolders(args, placeholder);
	      return createRecurry(
	        func, bitmask, createHybrid, wrapper.placeholder, thisArg,
	        args, newHolders, argPos, ary, arity - length
	      );
	    }
	    var thisBinding = isBind ? thisArg : this,
	        fn = isBindKey ? thisBinding[func] : func;

	    length = args.length;
	    if (argPos) {
	      args = reorder(args, argPos);
	    } else if (isFlip && length > 1) {
	      args.reverse();
	    }
	    if (isAry && ary < length) {
	      args.length = ary;
	    }
	    if (this && this !== root && this instanceof wrapper) {
	      fn = Ctor || createCtor(fn);
	    }
	    return fn.apply(thisBinding, args);
	  }
	  return wrapper;
	}

	module.exports = createHybrid;


/***/ },
/* 282 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates an array that is the composition of partially applied arguments,
	 * placeholders, and provided arguments into a single array of arguments.
	 *
	 * @private
	 * @param {Array} args The provided arguments.
	 * @param {Array} partials The arguments to prepend to those provided.
	 * @param {Array} holders The `partials` placeholder indexes.
	 * @params {boolean} [isCurried] Specify composing for a curried function.
	 * @returns {Array} Returns the new array of composed arguments.
	 */
	function composeArgs(args, partials, holders, isCurried) {
	  var argsIndex = -1,
	      argsLength = args.length,
	      holdersLength = holders.length,
	      leftIndex = -1,
	      leftLength = partials.length,
	      rangeLength = nativeMax(argsLength - holdersLength, 0),
	      result = Array(leftLength + rangeLength),
	      isUncurried = !isCurried;

	  while (++leftIndex < leftLength) {
	    result[leftIndex] = partials[leftIndex];
	  }
	  while (++argsIndex < holdersLength) {
	    if (isUncurried || argsIndex < argsLength) {
	      result[holders[argsIndex]] = args[argsIndex];
	    }
	  }
	  while (rangeLength--) {
	    result[leftIndex++] = args[argsIndex++];
	  }
	  return result;
	}

	module.exports = composeArgs;


/***/ },
/* 283 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * This function is like `composeArgs` except that the arguments composition
	 * is tailored for `_.partialRight`.
	 *
	 * @private
	 * @param {Array} args The provided arguments.
	 * @param {Array} partials The arguments to append to those provided.
	 * @param {Array} holders The `partials` placeholder indexes.
	 * @params {boolean} [isCurried] Specify composing for a curried function.
	 * @returns {Array} Returns the new array of composed arguments.
	 */
	function composeArgsRight(args, partials, holders, isCurried) {
	  var argsIndex = -1,
	      argsLength = args.length,
	      holdersIndex = -1,
	      holdersLength = holders.length,
	      rightIndex = -1,
	      rightLength = partials.length,
	      rangeLength = nativeMax(argsLength - holdersLength, 0),
	      result = Array(rangeLength + rightLength),
	      isUncurried = !isCurried;

	  while (++argsIndex < rangeLength) {
	    result[argsIndex] = args[argsIndex];
	  }
	  var offset = argsIndex;
	  while (++rightIndex < rightLength) {
	    result[offset + rightIndex] = partials[rightIndex];
	  }
	  while (++holdersIndex < holdersLength) {
	    if (isUncurried || argsIndex < argsLength) {
	      result[offset + holders[holdersIndex]] = args[argsIndex++];
	    }
	  }
	  return result;
	}

	module.exports = composeArgsRight;


/***/ },
/* 284 */
/***/ function(module, exports) {

	/**
	 * Gets the number of `placeholder` occurrences in `array`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} placeholder The placeholder to search for.
	 * @returns {number} Returns the placeholder count.
	 */
	function countHolders(array, placeholder) {
	  var length = array.length,
	      result = 0;

	  while (length--) {
	    if (array[length] === placeholder) {
	      ++result;
	    }
	  }
	  return result;
	}

	module.exports = countHolders;


/***/ },
/* 285 */
/***/ function(module, exports, __webpack_require__) {

	var isLaziable = __webpack_require__(286),
	    setData = __webpack_require__(296),
	    setWrapToString = __webpack_require__(297);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_BOUND_FLAG = 4,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_PARTIAL_FLAG = 32,
	    WRAP_PARTIAL_RIGHT_FLAG = 64;

	/**
	 * Creates a function that wraps `func` to continue currying.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {Function} wrapFunc The function to create the `func` wrapper.
	 * @param {*} placeholder The placeholder value.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to prepend to those provided to
	 *  the new function.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
	  var isCurry = bitmask & WRAP_CURRY_FLAG,
	      newHolders = isCurry ? holders : undefined,
	      newHoldersRight = isCurry ? undefined : holders,
	      newPartials = isCurry ? partials : undefined,
	      newPartialsRight = isCurry ? undefined : partials;

	  bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
	  bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);

	  if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
	    bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
	  }
	  var newData = [
	    func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
	    newHoldersRight, argPos, ary, arity
	  ];

	  var result = wrapFunc.apply(undefined, newData);
	  if (isLaziable(func)) {
	    setData(result, newData);
	  }
	  result.placeholder = placeholder;
	  return setWrapToString(result, func, bitmask);
	}

	module.exports = createRecurry;


/***/ },
/* 286 */
/***/ function(module, exports, __webpack_require__) {

	var LazyWrapper = __webpack_require__(287),
	    getData = __webpack_require__(289),
	    getFuncName = __webpack_require__(291),
	    lodash = __webpack_require__(293);

	/**
	 * Checks if `func` has a lazy counterpart.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
	 *  else `false`.
	 */
	function isLaziable(func) {
	  var funcName = getFuncName(func),
	      other = lodash[funcName];

	  if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
	    return false;
	  }
	  if (func === other) {
	    return true;
	  }
	  var data = getData(other);
	  return !!data && func === data[0];
	}

	module.exports = isLaziable;


/***/ },
/* 287 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(218),
	    baseLodash = __webpack_require__(288);

	/** Used as references for the maximum length and index of an array. */
	var MAX_ARRAY_LENGTH = 4294967295;

	/**
	 * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
	 *
	 * @private
	 * @constructor
	 * @param {*} value The value to wrap.
	 */
	function LazyWrapper(value) {
	  this.__wrapped__ = value;
	  this.__actions__ = [];
	  this.__dir__ = 1;
	  this.__filtered__ = false;
	  this.__iteratees__ = [];
	  this.__takeCount__ = MAX_ARRAY_LENGTH;
	  this.__views__ = [];
	}

	// Ensure `LazyWrapper` is an instance of `baseLodash`.
	LazyWrapper.prototype = baseCreate(baseLodash.prototype);
	LazyWrapper.prototype.constructor = LazyWrapper;

	module.exports = LazyWrapper;


/***/ },
/* 288 */
/***/ function(module, exports) {

	/**
	 * The function whose prototype chain sequence wrappers inherit from.
	 *
	 * @private
	 */
	function baseLodash() {
	  // No operation performed.
	}

	module.exports = baseLodash;


/***/ },
/* 289 */
/***/ function(module, exports, __webpack_require__) {

	var metaMap = __webpack_require__(277),
	    noop = __webpack_require__(290);

	/**
	 * Gets metadata for `func`.
	 *
	 * @private
	 * @param {Function} func The function to query.
	 * @returns {*} Returns the metadata for `func`.
	 */
	var getData = !metaMap ? noop : function(func) {
	  return metaMap.get(func);
	};

	module.exports = getData;


/***/ },
/* 290 */
/***/ function(module, exports) {

	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop() {
	  // No operation performed.
	}

	module.exports = noop;


/***/ },
/* 291 */
/***/ function(module, exports, __webpack_require__) {

	var realNames = __webpack_require__(292);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Gets the name of `func`.
	 *
	 * @private
	 * @param {Function} func The function to query.
	 * @returns {string} Returns the function name.
	 */
	function getFuncName(func) {
	  var result = (func.name + ''),
	      array = realNames[result],
	      length = hasOwnProperty.call(realNames, result) ? array.length : 0;

	  while (length--) {
	    var data = array[length],
	        otherFunc = data.func;
	    if (otherFunc == null || otherFunc == func) {
	      return data.name;
	    }
	  }
	  return result;
	}

	module.exports = getFuncName;


/***/ },
/* 292 */
/***/ function(module, exports) {

	/** Used to lookup unminified function names. */
	var realNames = {};

	module.exports = realNames;


/***/ },
/* 293 */
/***/ function(module, exports, __webpack_require__) {

	var LazyWrapper = __webpack_require__(287),
	    LodashWrapper = __webpack_require__(294),
	    baseLodash = __webpack_require__(288),
	    isArray = __webpack_require__(52),
	    isObjectLike = __webpack_require__(51),
	    wrapperClone = __webpack_require__(295);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates a `lodash` object which wraps `value` to enable implicit method
	 * chain sequences. Methods that operate on and return arrays, collections,
	 * and functions can be chained together. Methods that retrieve a single value
	 * or may return a primitive value will automatically end the chain sequence
	 * and return the unwrapped value. Otherwise, the value must be unwrapped
	 * with `_#value`.
	 *
	 * Explicit chain sequences, which must be unwrapped with `_#value`, may be
	 * enabled using `_.chain`.
	 *
	 * The execution of chained methods is lazy, that is, it's deferred until
	 * `_#value` is implicitly or explicitly called.
	 *
	 * Lazy evaluation allows several methods to support shortcut fusion.
	 * Shortcut fusion is an optimization to merge iteratee calls; this avoids
	 * the creation of intermediate arrays and can greatly reduce the number of
	 * iteratee executions. Sections of a chain sequence qualify for shortcut
	 * fusion if the section is applied to an array of at least `200` elements
	 * and any iteratees accept only one argument. The heuristic for whether a
	 * section qualifies for shortcut fusion is subject to change.
	 *
	 * Chaining is supported in custom builds as long as the `_#value` method is
	 * directly or indirectly included in the build.
	 *
	 * In addition to lodash methods, wrappers have `Array` and `String` methods.
	 *
	 * The wrapper `Array` methods are:
	 * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
	 *
	 * The wrapper `String` methods are:
	 * `replace` and `split`
	 *
	 * The wrapper methods that support shortcut fusion are:
	 * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
	 * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
	 * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
	 *
	 * The chainable wrapper methods are:
	 * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
	 * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
	 * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
	 * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
	 * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
	 * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
	 * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
	 * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
	 * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
	 * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
	 * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
	 * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
	 * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
	 * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
	 * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
	 * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
	 * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
	 * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
	 * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
	 * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
	 * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
	 * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
	 * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
	 * `zipObject`, `zipObjectDeep`, and `zipWith`
	 *
	 * The wrapper methods that are **not** chainable by default are:
	 * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
	 * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
	 * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
	 * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
	 * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
	 * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
	 * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
	 * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
	 * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
	 * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
	 * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
	 * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
	 * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
	 * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
	 * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
	 * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
	 * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
	 * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
	 * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
	 * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
	 * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
	 * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
	 * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
	 * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
	 * `upperFirst`, `value`, and `words`
	 *
	 * @name _
	 * @constructor
	 * @category Seq
	 * @param {*} value The value to wrap in a `lodash` instance.
	 * @returns {Object} Returns the new `lodash` wrapper instance.
	 * @example
	 *
	 * function square(n) {
	 *   return n * n;
	 * }
	 *
	 * var wrapped = _([1, 2, 3]);
	 *
	 * // Returns an unwrapped value.
	 * wrapped.reduce(_.add);
	 * // => 6
	 *
	 * // Returns a wrapped value.
	 * var squares = wrapped.map(square);
	 *
	 * _.isArray(squares);
	 * // => false
	 *
	 * _.isArray(squares.value());
	 * // => true
	 */
	function lodash(value) {
	  if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
	    if (value instanceof LodashWrapper) {
	      return value;
	    }
	    if (hasOwnProperty.call(value, '__wrapped__')) {
	      return wrapperClone(value);
	    }
	  }
	  return new LodashWrapper(value);
	}

	// Ensure wrappers are instances of `baseLodash`.
	lodash.prototype = baseLodash.prototype;
	lodash.prototype.constructor = lodash;

	module.exports = lodash;


/***/ },
/* 294 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(218),
	    baseLodash = __webpack_require__(288);

	/**
	 * The base constructor for creating `lodash` wrapper objects.
	 *
	 * @private
	 * @param {*} value The value to wrap.
	 * @param {boolean} [chainAll] Enable explicit method chain sequences.
	 */
	function LodashWrapper(value, chainAll) {
	  this.__wrapped__ = value;
	  this.__actions__ = [];
	  this.__chain__ = !!chainAll;
	  this.__index__ = 0;
	  this.__values__ = undefined;
	}

	LodashWrapper.prototype = baseCreate(baseLodash.prototype);
	LodashWrapper.prototype.constructor = LodashWrapper;

	module.exports = LodashWrapper;


/***/ },
/* 295 */
/***/ function(module, exports, __webpack_require__) {

	var LazyWrapper = __webpack_require__(287),
	    LodashWrapper = __webpack_require__(294),
	    copyArray = __webpack_require__(195);

	/**
	 * Creates a clone of `wrapper`.
	 *
	 * @private
	 * @param {Object} wrapper The wrapper to clone.
	 * @returns {Object} Returns the cloned wrapper.
	 */
	function wrapperClone(wrapper) {
	  if (wrapper instanceof LazyWrapper) {
	    return wrapper.clone();
	  }
	  var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
	  result.__actions__ = copyArray(wrapper.__actions__);
	  result.__index__  = wrapper.__index__;
	  result.__values__ = wrapper.__values__;
	  return result;
	}

	module.exports = wrapperClone;


/***/ },
/* 296 */
/***/ function(module, exports, __webpack_require__) {

	var baseSetData = __webpack_require__(276),
	    shortOut = __webpack_require__(120);

	/**
	 * Sets metadata for `func`.
	 *
	 * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
	 * period of time, it will trip its breaker and transition to an identity
	 * function to avoid garbage collection pauses in V8. See
	 * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
	 * for more details.
	 *
	 * @private
	 * @param {Function} func The function to associate metadata with.
	 * @param {*} data The metadata.
	 * @returns {Function} Returns `func`.
	 */
	var setData = shortOut(baseSetData);

	module.exports = setData;


/***/ },
/* 297 */
/***/ function(module, exports, __webpack_require__) {

	var getWrapDetails = __webpack_require__(298),
	    insertWrapDetails = __webpack_require__(299),
	    setToString = __webpack_require__(116),
	    updateWrapDetails = __webpack_require__(300);

	/**
	 * Sets the `toString` method of `wrapper` to mimic the source of `reference`
	 * with wrapper details in a comment at the top of the source body.
	 *
	 * @private
	 * @param {Function} wrapper The function to modify.
	 * @param {Function} reference The reference function.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @returns {Function} Returns `wrapper`.
	 */
	function setWrapToString(wrapper, reference, bitmask) {
	  var source = (reference + '');
	  return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
	}

	module.exports = setWrapToString;


/***/ },
/* 298 */
/***/ function(module, exports) {

	/** Used to match wrap detail comments. */
	var reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
	    reSplitDetails = /,? & /;

	/**
	 * Extracts wrapper details from the `source` body comment.
	 *
	 * @private
	 * @param {string} source The source to inspect.
	 * @returns {Array} Returns the wrapper details.
	 */
	function getWrapDetails(source) {
	  var match = source.match(reWrapDetails);
	  return match ? match[1].split(reSplitDetails) : [];
	}

	module.exports = getWrapDetails;


/***/ },
/* 299 */
/***/ function(module, exports) {

	/** Used to match wrap detail comments. */
	var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/;

	/**
	 * Inserts wrapper `details` in a comment at the top of the `source` body.
	 *
	 * @private
	 * @param {string} source The source to modify.
	 * @returns {Array} details The details to insert.
	 * @returns {string} Returns the modified source.
	 */
	function insertWrapDetails(source, details) {
	  var length = details.length;
	  if (!length) {
	    return source;
	  }
	  var lastIndex = length - 1;
	  details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
	  details = details.join(length > 2 ? ', ' : ' ');
	  return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
	}

	module.exports = insertWrapDetails;


/***/ },
/* 300 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(129),
	    arrayIncludes = __webpack_require__(105);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_CURRY_RIGHT_FLAG = 16,
	    WRAP_PARTIAL_FLAG = 32,
	    WRAP_PARTIAL_RIGHT_FLAG = 64,
	    WRAP_ARY_FLAG = 128,
	    WRAP_REARG_FLAG = 256,
	    WRAP_FLIP_FLAG = 512;

	/** Used to associate wrap methods with their bit flags. */
	var wrapFlags = [
	  ['ary', WRAP_ARY_FLAG],
	  ['bind', WRAP_BIND_FLAG],
	  ['bindKey', WRAP_BIND_KEY_FLAG],
	  ['curry', WRAP_CURRY_FLAG],
	  ['curryRight', WRAP_CURRY_RIGHT_FLAG],
	  ['flip', WRAP_FLIP_FLAG],
	  ['partial', WRAP_PARTIAL_FLAG],
	  ['partialRight', WRAP_PARTIAL_RIGHT_FLAG],
	  ['rearg', WRAP_REARG_FLAG]
	];

	/**
	 * Updates wrapper `details` based on `bitmask` flags.
	 *
	 * @private
	 * @returns {Array} details The details to modify.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @returns {Array} Returns `details`.
	 */
	function updateWrapDetails(details, bitmask) {
	  arrayEach(wrapFlags, function(pair) {
	    var value = '_.' + pair[0];
	    if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
	      details.push(value);
	    }
	  });
	  return details.sort();
	}

	module.exports = updateWrapDetails;


/***/ },
/* 301 */
/***/ function(module, exports) {

	/**
	 * Gets the argument placeholder value for `func`.
	 *
	 * @private
	 * @param {Function} func The function to inspect.
	 * @returns {*} Returns the placeholder value.
	 */
	function getHolder(func) {
	  var object = func;
	  return object.placeholder;
	}

	module.exports = getHolder;


/***/ },
/* 302 */
/***/ function(module, exports, __webpack_require__) {

	var copyArray = __webpack_require__(195),
	    isIndex = __webpack_require__(56);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;

	/**
	 * Reorder `array` according to the specified indexes where the element at
	 * the first index is assigned as the first element, the element at
	 * the second index is assigned as the second element, and so on.
	 *
	 * @private
	 * @param {Array} array The array to reorder.
	 * @param {Array} indexes The arranged array indexes.
	 * @returns {Array} Returns `array`.
	 */
	function reorder(array, indexes) {
	  var arrLength = array.length,
	      length = nativeMin(indexes.length, arrLength),
	      oldArray = copyArray(array);

	  while (length--) {
	    var index = indexes[length];
	    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
	  }
	  return array;
	}

	module.exports = reorder;


/***/ },
/* 303 */
/***/ function(module, exports) {

	/** Used as the internal argument placeholder. */
	var PLACEHOLDER = '__lodash_placeholder__';

	/**
	 * Replaces all `placeholder` elements in `array` with an internal placeholder
	 * and returns an array of their indexes.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {*} placeholder The placeholder to replace.
	 * @returns {Array} Returns the new array of placeholder indexes.
	 */
	function replaceHolders(array, placeholder) {
	  var index = -1,
	      length = array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (value === placeholder || value === PLACEHOLDER) {
	      array[index] = PLACEHOLDER;
	      result[resIndex++] = index;
	    }
	  }
	  return result;
	}

	module.exports = replaceHolders;


/***/ },
/* 304 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(115),
	    createCtor = __webpack_require__(279),
	    root = __webpack_require__(47);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1;

	/**
	 * Creates a function that wraps `func` to invoke it with the `this` binding
	 * of `thisArg` and `partials` prepended to the arguments it receives.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} partials The arguments to prepend to those provided to
	 *  the new function.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createPartial(func, bitmask, thisArg, partials) {
	  var isBind = bitmask & WRAP_BIND_FLAG,
	      Ctor = createCtor(func);

	  function wrapper() {
	    var argsIndex = -1,
	        argsLength = arguments.length,
	        leftIndex = -1,
	        leftLength = partials.length,
	        args = Array(leftLength + argsLength),
	        fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

	    while (++leftIndex < leftLength) {
	      args[leftIndex] = partials[leftIndex];
	    }
	    while (argsLength--) {
	      args[leftIndex++] = arguments[++argsIndex];
	    }
	    return apply(fn, isBind ? thisArg : this, args);
	  }
	  return wrapper;
	}

	module.exports = createPartial;


/***/ },
/* 305 */
/***/ function(module, exports, __webpack_require__) {

	var composeArgs = __webpack_require__(282),
	    composeArgsRight = __webpack_require__(283),
	    replaceHolders = __webpack_require__(303);

	/** Used as the internal argument placeholder. */
	var PLACEHOLDER = '__lodash_placeholder__';

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_BIND_KEY_FLAG = 2,
	    WRAP_CURRY_BOUND_FLAG = 4,
	    WRAP_CURRY_FLAG = 8,
	    WRAP_ARY_FLAG = 128,
	    WRAP_REARG_FLAG = 256;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;

	/**
	 * Merges the function metadata of `source` into `data`.
	 *
	 * Merging metadata reduces the number of wrappers used to invoke a function.
	 * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
	 * may be applied regardless of execution order. Methods like `_.ary` and
	 * `_.rearg` modify function arguments, making the order in which they are
	 * executed important, preventing the merging of metadata. However, we make
	 * an exception for a safe combined case where curried functions have `_.ary`
	 * and or `_.rearg` applied.
	 *
	 * @private
	 * @param {Array} data The destination metadata.
	 * @param {Array} source The source metadata.
	 * @returns {Array} Returns `data`.
	 */
	function mergeData(data, source) {
	  var bitmask = data[1],
	      srcBitmask = source[1],
	      newBitmask = bitmask | srcBitmask,
	      isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);

	  var isCombo =
	    ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) ||
	    ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) ||
	    ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));

	  // Exit early if metadata can't be merged.
	  if (!(isCommon || isCombo)) {
	    return data;
	  }
	  // Use source `thisArg` if available.
	  if (srcBitmask & WRAP_BIND_FLAG) {
	    data[2] = source[2];
	    // Set when currying a bound function.
	    newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
	  }
	  // Compose partial arguments.
	  var value = source[3];
	  if (value) {
	    var partials = data[3];
	    data[3] = partials ? composeArgs(partials, value, source[4]) : value;
	    data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
	  }
	  // Compose partial right arguments.
	  value = source[5];
	  if (value) {
	    partials = data[5];
	    data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
	    data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
	  }
	  // Use source `argPos` if available.
	  value = source[7];
	  if (value) {
	    data[7] = value;
	  }
	  // Use source `ary` if it's smaller.
	  if (srcBitmask & WRAP_ARY_FLAG) {
	    data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
	  }
	  // Use source `arity` if one is not provided.
	  if (data[9] == null) {
	    data[9] = source[9];
	  }
	  // Use source `func` and merge bitmasks.
	  data[0] = source[0];
	  data[1] = newBitmask;

	  return data;
	}

	module.exports = mergeData;


/***/ },
/* 306 */
/***/ function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(112),
	    createWrap = __webpack_require__(275),
	    getHolder = __webpack_require__(301),
	    replaceHolders = __webpack_require__(303);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_PARTIAL_RIGHT_FLAG = 64;

	/**
	 * This method is like `_.partial` except that partially applied arguments
	 * are appended to the arguments it receives.
	 *
	 * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
	 * builds, may be used as a placeholder for partially applied arguments.
	 *
	 * **Note:** This method doesn't set the "length" property of partially
	 * applied functions.
	 *
	 * @static
	 * @memberOf _
	 * @since 1.0.0
	 * @category Function
	 * @param {Function} func The function to partially apply arguments to.
	 * @param {...*} [partials] The arguments to be partially applied.
	 * @returns {Function} Returns the new partially applied function.
	 * @example
	 *
	 * function greet(greeting, name) {
	 *   return greeting + ' ' + name;
	 * }
	 *
	 * var greetFred = _.partialRight(greet, 'fred');
	 * greetFred('hi');
	 * // => 'hi fred'
	 *
	 * // Partially applied with placeholders.
	 * var sayHelloTo = _.partialRight(greet, 'hello', _);
	 * sayHelloTo('fred');
	 * // => 'hello fred'
	 */
	var partialRight = baseRest(function(func, partials) {
	  var holders = replaceHolders(partials, getHolder(partialRight));
	  return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined, partials, holders);
	});

	// Assign default placeholders.
	partialRight.placeholder = {};

	module.exports = partialRight;


/***/ },
/* 307 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var reduce = __webpack_require__(181);
	var find = __webpack_require__(237);
	var startsWith = __webpack_require__(308);

	/**
	 * Transform sort format from user friendly notation to lodash format
	 * @param {string[]} sortBy array of predicate of the form "attribute:order"
	 * @return {array.<string[]>} array containing 2 elements : attributes, orders
	 */
	module.exports = function formatSort(sortBy, defaults) {
	  return reduce(sortBy, function preparePredicate(out, sortInstruction) {
	    var sortInstructions = sortInstruction.split(':');
	    if (defaults && sortInstructions.length === 1) {
	      var similarDefault = find(defaults, function(predicate) {
	        return startsWith(predicate, sortInstruction[0]);
	      });
	      if (similarDefault) {
	        sortInstructions = similarDefault.split(':');
	      }
	    }
	    out[0].push(sortInstructions[0]);
	    out[1].push(sortInstructions[1]);
	    return out;
	  }, [[], []]);
	};


/***/ },
/* 308 */
/***/ function(module, exports, __webpack_require__) {

	var baseClamp = __webpack_require__(309),
	    baseToString = __webpack_require__(171),
	    toInteger = __webpack_require__(228),
	    toString = __webpack_require__(170);

	/**
	 * Checks if `string` starts with the given target string.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to inspect.
	 * @param {string} [target] The string to search for.
	 * @param {number} [position=0] The position to search from.
	 * @returns {boolean} Returns `true` if `string` starts with `target`,
	 *  else `false`.
	 * @example
	 *
	 * _.startsWith('abc', 'a');
	 * // => true
	 *
	 * _.startsWith('abc', 'b');
	 * // => false
	 *
	 * _.startsWith('abc', 'b', 1);
	 * // => true
	 */
	function startsWith(string, target, position) {
	  string = toString(string);
	  position = baseClamp(toInteger(position), 0, string.length);
	  target = baseToString(target);
	  return string.slice(position, position + target.length) == target;
	}

	module.exports = startsWith;


/***/ },
/* 309 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.clamp` which doesn't coerce arguments.
	 *
	 * @private
	 * @param {number} number The number to clamp.
	 * @param {number} [lower] The lower bound.
	 * @param {number} upper The upper bound.
	 * @returns {number} Returns the clamped number.
	 */
	function baseClamp(number, lower, upper) {
	  if (number === number) {
	    if (upper !== undefined) {
	      number = number <= upper ? number : upper;
	    }
	    if (lower !== undefined) {
	      number = number >= lower ? number : lower;
	    }
	  }
	  return number;
	}

	module.exports = baseClamp;


/***/ },
/* 310 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = generateTrees;

	var last = __webpack_require__(220);
	var map = __webpack_require__(179);
	var reduce = __webpack_require__(181);
	var orderBy = __webpack_require__(269);
	var trim = __webpack_require__(240);
	var find = __webpack_require__(237);
	var pickBy = __webpack_require__(311);

	var prepareHierarchicalFacetSortBy = __webpack_require__(307);

	function generateTrees(state) {
	  return function generate(hierarchicalFacetResult, hierarchicalFacetIndex) {
	    var hierarchicalFacet = state.hierarchicalFacets[hierarchicalFacetIndex];
	    var hierarchicalFacetRefinement = state.hierarchicalFacetsRefinements[hierarchicalFacet.name] &&
	      state.hierarchicalFacetsRefinements[hierarchicalFacet.name][0] || '';
	    var hierarchicalSeparator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
	    var hierarchicalRootPath = state._getHierarchicalRootPath(hierarchicalFacet);
	    var hierarchicalShowParentLevel = state._getHierarchicalShowParentLevel(hierarchicalFacet);
	    var sortBy = prepareHierarchicalFacetSortBy(state._getHierarchicalFacetSortBy(hierarchicalFacet));

	    var generateTreeFn = generateHierarchicalTree(sortBy, hierarchicalSeparator, hierarchicalRootPath,
	      hierarchicalShowParentLevel, hierarchicalFacetRefinement);

	    var results = hierarchicalFacetResult;

	    if (hierarchicalRootPath) {
	      results = hierarchicalFacetResult.slice(hierarchicalRootPath.split(hierarchicalSeparator).length);
	    }

	    return reduce(results, generateTreeFn, {
	      name: state.hierarchicalFacets[hierarchicalFacetIndex].name,
	      count: null, // root level, no count
	      isRefined: true, // root level, always refined
	      path: null, // root level, no path
	      data: null
	    });
	  };
	}

	function generateHierarchicalTree(sortBy, hierarchicalSeparator, hierarchicalRootPath,
	                                  hierarchicalShowParentLevel, currentRefinement) {
	  return function generateTree(hierarchicalTree, hierarchicalFacetResult, currentHierarchicalLevel) {
	    var parent = hierarchicalTree;

	    if (currentHierarchicalLevel > 0) {
	      var level = 0;

	      parent = hierarchicalTree;

	      while (level < currentHierarchicalLevel) {
	        parent = parent && find(parent.data, {isRefined: true});
	        level++;
	      }
	    }

	    // we found a refined parent, let's add current level data under it
	    if (parent) {
	      // filter values in case an object has multiple categories:
	      //   {
	      //     categories: {
	      //       level0: ['beers', 'bières'],
	      //       level1: ['beers > IPA', 'bières > Belges']
	      //     }
	      //   }
	      //
	      // If parent refinement is `beers`, then we do not want to have `bières > Belges`
	      // showing up

	      var onlyMatchingValuesFn = filterFacetValues(parent.path || hierarchicalRootPath,
	        currentRefinement, hierarchicalSeparator, hierarchicalRootPath, hierarchicalShowParentLevel);

	      parent.data = orderBy(
	        map(
	          pickBy(hierarchicalFacetResult.data, onlyMatchingValuesFn),
	          formatHierarchicalFacetValue(hierarchicalSeparator, currentRefinement)
	        ),
	        sortBy[0], sortBy[1]
	      );
	    }

	    return hierarchicalTree;
	  };
	}

	function filterFacetValues(parentPath, currentRefinement, hierarchicalSeparator, hierarchicalRootPath,
	                           hierarchicalShowParentLevel) {
	  return function(facetCount, facetValue) {
	    // we want the facetValue is a child of hierarchicalRootPath
	    if (hierarchicalRootPath &&
	      (facetValue.indexOf(hierarchicalRootPath) !== 0 || hierarchicalRootPath === facetValue)) {
	      return false;
	    }

	    // we always want root levels (only when there is no prefix path)
	    return !hierarchicalRootPath && facetValue.indexOf(hierarchicalSeparator) === -1 ||
	      // if there is a rootPath, being root level mean 1 level under rootPath
	      hierarchicalRootPath &&
	      facetValue.split(hierarchicalSeparator).length - hierarchicalRootPath.split(hierarchicalSeparator).length === 1 ||
	      // if current refinement is a root level and current facetValue is a root level,
	      // keep the facetValue
	      facetValue.indexOf(hierarchicalSeparator) === -1 &&
	      currentRefinement.indexOf(hierarchicalSeparator) === -1 ||
	      // currentRefinement is a child of the facet value
	      currentRefinement.indexOf(facetValue) === 0 ||
	      // facetValue is a child of the current parent, add it
	      facetValue.indexOf(parentPath + hierarchicalSeparator) === 0 &&
	      (hierarchicalShowParentLevel || facetValue.indexOf(currentRefinement) === 0);
	  };
	}

	function formatHierarchicalFacetValue(hierarchicalSeparator, currentRefinement) {
	  return function format(facetCount, facetValue) {
	    return {
	      name: trim(last(facetValue.split(hierarchicalSeparator))),
	      path: facetValue,
	      count: facetCount,
	      isRefined: currentRefinement === facetValue || currentRefinement.indexOf(facetValue + hierarchicalSeparator) === 0,
	      data: null
	    };
	  };
	}


/***/ },
/* 311 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(70),
	    baseIteratee = __webpack_require__(135),
	    basePickBy = __webpack_require__(312),
	    getAllKeysIn = __webpack_require__(205);

	/**
	 * Creates an object composed of the `object` properties `predicate` returns
	 * truthy for. The predicate is invoked with two arguments: (value, key).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {Function} [predicate=_.identity] The function invoked per property.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pickBy(object, _.isNumber);
	 * // => { 'a': 1, 'c': 3 }
	 */
	function pickBy(object, predicate) {
	  if (object == null) {
	    return {};
	  }
	  var props = arrayMap(getAllKeysIn(object), function(prop) {
	    return [prop];
	  });
	  predicate = baseIteratee(predicate);
	  return basePickBy(object, props, function(value, path) {
	    return predicate(value, path[0]);
	  });
	}

	module.exports = pickBy;


/***/ },
/* 312 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(163),
	    baseSet = __webpack_require__(313),
	    castPath = __webpack_require__(164);

	/**
	 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @param {Function} predicate The function invoked per property.
	 * @returns {Object} Returns the new object.
	 */
	function basePickBy(object, paths, predicate) {
	  var index = -1,
	      length = paths.length,
	      result = {};

	  while (++index < length) {
	    var path = paths[index],
	        value = baseGet(object, path);

	    if (predicate(value, path)) {
	      baseSet(result, castPath(path, object), value);
	    }
	  }
	  return result;
	}

	module.exports = basePickBy;


/***/ },
/* 313 */
/***/ function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(186),
	    castPath = __webpack_require__(164),
	    isIndex = __webpack_require__(56),
	    isObject = __webpack_require__(68),
	    toKey = __webpack_require__(172);

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
	  if (!isObject(object)) {
	    return object;
	  }
	  path = castPath(path, object);

	  var index = -1,
	      length = path.length,
	      lastIndex = length - 1,
	      nested = object;

	  while (nested != null && ++index < length) {
	    var key = toKey(path[index]),
	        newValue = value;

	    if (index != lastIndex) {
	      var objValue = nested[key];
	      newValue = customizer ? customizer(objValue, key, nested) : undefined;
	      if (newValue === undefined) {
	        newValue = isObject(objValue)
	          ? objValue
	          : (isIndex(path[index + 1]) ? [] : {});
	      }
	    }
	    assignValue(nested, key, newValue);
	    nested = nested[key];
	  }
	  return object;
	}

	module.exports = baseSet;


/***/ },
/* 314 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var forEach = __webpack_require__(128);
	var map = __webpack_require__(179);
	var reduce = __webpack_require__(181);
	var merge = __webpack_require__(253);
	var isArray = __webpack_require__(52);

	var requestBuilder = {
	  /**
	   * Get all the queries to send to the client, those queries can used directly
	   * with the Algolia client.
	   * @private
	   * @return {object[]} The queries
	   */
	  _getQueries: function getQueries(index, state) {
	    var queries = [];

	    // One query for the hits
	    queries.push({
	      indexName: index,
	      params: requestBuilder._getHitsSearchParams(state)
	    });

	    // One for each disjunctive facets
	    forEach(state.getRefinedDisjunctiveFacets(), function(refinedFacet) {
	      queries.push({
	        indexName: index,
	        params: requestBuilder._getDisjunctiveFacetSearchParams(state, refinedFacet)
	      });
	    });

	    // maybe more to get the root level of hierarchical facets when activated
	    forEach(state.getRefinedHierarchicalFacets(), function(refinedFacet) {
	      var hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);

	      var currentRefinement = state.getHierarchicalRefinement(refinedFacet);
	      // if we are deeper than level 0 (starting from `beer > IPA`)
	      // we want to get the root values
	      var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
	      if (currentRefinement.length > 0 && currentRefinement[0].split(separator).length > 1) {
	        queries.push({
	          indexName: index,
	          params: requestBuilder._getDisjunctiveFacetSearchParams(state, refinedFacet, true)
	        });
	      }
	    });

	    return queries;
	  },

	  /**
	   * Build search parameters used to fetch hits
	   * @private
	   * @return {object.<string, any>}
	   */
	  _getHitsSearchParams: function(state) {
	    var facets = state.facets
	      .concat(state.disjunctiveFacets)
	      .concat(requestBuilder._getHitsHierarchicalFacetsAttributes(state));


	    var facetFilters = requestBuilder._getFacetFilters(state);
	    var numericFilters = requestBuilder._getNumericFilters(state);
	    var tagFilters = requestBuilder._getTagFilters(state);
	    var additionalParams = {
	      facets: facets,
	      tagFilters: tagFilters
	    };

	    if (facetFilters.length > 0) {
	      additionalParams.facetFilters = facetFilters;
	    }

	    if (numericFilters.length > 0) {
	      additionalParams.numericFilters = numericFilters;
	    }

	    return merge(state.getQueryParams(), additionalParams);
	  },

	  /**
	   * Build search parameters used to fetch a disjunctive facet
	   * @private
	   * @param  {string} facet the associated facet name
	   * @param  {boolean} hierarchicalRootLevel ?? FIXME
	   * @return {object}
	   */
	  _getDisjunctiveFacetSearchParams: function(state, facet, hierarchicalRootLevel) {
	    var facetFilters = requestBuilder._getFacetFilters(state, facet, hierarchicalRootLevel);
	    var numericFilters = requestBuilder._getNumericFilters(state, facet);
	    var tagFilters = requestBuilder._getTagFilters(state);
	    var additionalParams = {
	      hitsPerPage: 1,
	      page: 0,
	      attributesToRetrieve: [],
	      attributesToHighlight: [],
	      attributesToSnippet: [],
	      tagFilters: tagFilters
	    };

	    var hierarchicalFacet = state.getHierarchicalFacetByName(facet);

	    if (hierarchicalFacet) {
	      additionalParams.facets = requestBuilder._getDisjunctiveHierarchicalFacetAttribute(
	        state,
	        hierarchicalFacet,
	        hierarchicalRootLevel
	      );
	    } else {
	      additionalParams.facets = facet;
	    }

	    if (numericFilters.length > 0) {
	      additionalParams.numericFilters = numericFilters;
	    }

	    if (facetFilters.length > 0) {
	      additionalParams.facetFilters = facetFilters;
	    }

	    return merge(state.getQueryParams(), additionalParams);
	  },

	  /**
	   * Return the numeric filters in an algolia request fashion
	   * @private
	   * @param {string} [facetName] the name of the attribute for which the filters should be excluded
	   * @return {string[]} the numeric filters in the algolia format
	   */
	  _getNumericFilters: function(state, facetName) {
	    if (state.numericFilters) {
	      return state.numericFilters;
	    }

	    var numericFilters = [];

	    forEach(state.numericRefinements, function(operators, attribute) {
	      forEach(operators, function(values, operator) {
	        if (facetName !== attribute) {
	          forEach(values, function(value) {
	            if (isArray(value)) {
	              var vs = map(value, function(v) {
	                return attribute + operator + v;
	              });
	              numericFilters.push(vs);
	            } else {
	              numericFilters.push(attribute + operator + value);
	            }
	          });
	        }
	      });
	    });

	    return numericFilters;
	  },

	  /**
	   * Return the tags filters depending
	   * @private
	   * @return {string}
	   */
	  _getTagFilters: function(state) {
	    if (state.tagFilters) {
	      return state.tagFilters;
	    }

	    return state.tagRefinements.join(',');
	  },


	  /**
	   * Build facetFilters parameter based on current refinements. The array returned
	   * contains strings representing the facet filters in the algolia format.
	   * @private
	   * @param  {string} [facet] if set, the current disjunctive facet
	   * @return {array.<string>}
	   */
	  _getFacetFilters: function(state, facet, hierarchicalRootLevel) {
	    var facetFilters = [];

	    forEach(state.facetsRefinements, function(facetValues, facetName) {
	      forEach(facetValues, function(facetValue) {
	        facetFilters.push(facetName + ':' + facetValue);
	      });
	    });

	    forEach(state.facetsExcludes, function(facetValues, facetName) {
	      forEach(facetValues, function(facetValue) {
	        facetFilters.push(facetName + ':-' + facetValue);
	      });
	    });

	    forEach(state.disjunctiveFacetsRefinements, function(facetValues, facetName) {
	      if (facetName === facet || !facetValues || facetValues.length === 0) return;
	      var orFilters = [];

	      forEach(facetValues, function(facetValue) {
	        orFilters.push(facetName + ':' + facetValue);
	      });

	      facetFilters.push(orFilters);
	    });

	    forEach(state.hierarchicalFacetsRefinements, function(facetValues, facetName) {
	      var facetValue = facetValues[0];

	      if (facetValue === undefined) {
	        return;
	      }

	      var hierarchicalFacet = state.getHierarchicalFacetByName(facetName);
	      var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
	      var rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
	      var attributeToRefine;
	      var attributesIndex;

	      // we ask for parent facet values only when the `facet` is the current hierarchical facet
	      if (facet === facetName) {
	        // if we are at the root level already, no need to ask for facet values, we get them from
	        // the hits query
	        if (facetValue.indexOf(separator) === -1 || (!rootPath && hierarchicalRootLevel === true) ||
	          (rootPath && rootPath.split(separator).length === facetValue.split(separator).length)) {
	          return;
	        }

	        if (!rootPath) {
	          attributesIndex = facetValue.split(separator).length - 2;
	          facetValue = facetValue.slice(0, facetValue.lastIndexOf(separator));
	        } else {
	          attributesIndex = rootPath.split(separator).length - 1;
	          facetValue = rootPath;
	        }

	        attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
	      } else {
	        attributesIndex = facetValue.split(separator).length - 1;

	        attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
	      }

	      if (attributeToRefine) {
	        facetFilters.push([attributeToRefine + ':' + facetValue]);
	      }
	    });

	    return facetFilters;
	  },

	  _getHitsHierarchicalFacetsAttributes: function(state) {
	    var out = [];

	    return reduce(
	      state.hierarchicalFacets,
	      // ask for as much levels as there's hierarchical refinements
	      function getHitsAttributesForHierarchicalFacet(allAttributes, hierarchicalFacet) {
	        var hierarchicalRefinement = state.getHierarchicalRefinement(hierarchicalFacet.name)[0];

	        // if no refinement, ask for root level
	        if (!hierarchicalRefinement) {
	          allAttributes.push(hierarchicalFacet.attributes[0]);
	          return allAttributes;
	        }

	        var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
	        var level = hierarchicalRefinement.split(separator).length;
	        var newAttributes = hierarchicalFacet.attributes.slice(0, level + 1);

	        return allAttributes.concat(newAttributes);
	      }, out);
	  },

	  _getDisjunctiveHierarchicalFacetAttribute: function(state, hierarchicalFacet, rootLevel) {
	    var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
	    if (rootLevel === true) {
	      var rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
	      var attributeIndex = 0;

	      if (rootPath) {
	        attributeIndex = rootPath.split(separator).length;
	      }
	      return [hierarchicalFacet.attributes[attributeIndex]];
	    }

	    var hierarchicalRefinement = state.getHierarchicalRefinement(hierarchicalFacet.name)[0] || '';
	    // if refinement is 'beers > IPA > Flying dog',
	    // then we want `facets: ['beers > IPA']` as disjunctive facet (parent level values)

	    var parentLevel = hierarchicalRefinement.split(separator).length - 1;
	    return hierarchicalFacet.attributes.slice(0, parentLevel + 1);
	  },

	  getSearchForFacetQuery: function(facetName, query, state) {
	    var stateForSearchForFacetValues = state.isDisjunctiveFacet(facetName) ?
	      state.clearRefinements(facetName) :
	      state;
	    var queries = merge(requestBuilder._getHitsSearchParams(stateForSearchForFacetValues), {
	      facetQuery: query,
	      facetName: facetName
	    });
	    return queries;
	  }
	};

	module.exports = requestBuilder;


/***/ },
/* 315 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(316);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(317);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(24)))

/***/ },
/* 316 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 317 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 318 */
/***/ function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(112),
	    createWrap = __webpack_require__(275),
	    getHolder = __webpack_require__(301),
	    replaceHolders = __webpack_require__(303);

	/** Used to compose bitmasks for function metadata. */
	var WRAP_BIND_FLAG = 1,
	    WRAP_PARTIAL_FLAG = 32;

	/**
	 * Creates a function that invokes `func` with the `this` binding of `thisArg`
	 * and `partials` prepended to the arguments it receives.
	 *
	 * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
	 * may be used as a placeholder for partially applied arguments.
	 *
	 * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
	 * property of bound functions.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {...*} [partials] The arguments to be partially applied.
	 * @returns {Function} Returns the new bound function.
	 * @example
	 *
	 * function greet(greeting, punctuation) {
	 *   return greeting + ' ' + this.user + punctuation;
	 * }
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * var bound = _.bind(greet, object, 'hi');
	 * bound('!');
	 * // => 'hi fred!'
	 *
	 * // Bound with placeholders.
	 * var bound = _.bind(greet, object, _, '!');
	 * bound('hi');
	 * // => 'hi fred!'
	 */
	var bind = baseRest(function(func, thisArg, partials) {
	  var bitmask = WRAP_BIND_FLAG;
	  if (partials.length) {
	    var holders = replaceHolders(partials, getHolder(bind));
	    bitmask |= WRAP_PARTIAL_FLAG;
	  }
	  return createWrap(func, bitmask, thisArg, partials, holders);
	});

	// Assign default placeholders.
	bind.placeholder = {};

	module.exports = bind;


/***/ },
/* 319 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Module containing the functions to serialize and deserialize
	 * {SearchParameters} in the query string format
	 * @module algoliasearchHelper.url
	 */

	var shortener = __webpack_require__(320);
	var SearchParameters = __webpack_require__(39);

	var qs = __webpack_require__(324);

	var bind = __webpack_require__(318);
	var forEach = __webpack_require__(128);
	var pick = __webpack_require__(328);
	var map = __webpack_require__(179);
	var mapKeys = __webpack_require__(330);
	var mapValues = __webpack_require__(331);
	var isString = __webpack_require__(236);
	var isPlainObject = __webpack_require__(257);
	var isArray = __webpack_require__(52);
	var invert = __webpack_require__(321);

	var encode = __webpack_require__(326).encode;

	function recursiveEncode(input) {
	  if (isPlainObject(input)) {
	    return mapValues(input, recursiveEncode);
	  }
	  if (isArray(input)) {
	    return map(input, recursiveEncode);
	  }
	  if (isString(input)) {
	    return encode(input);
	  }
	  return input;
	}

	var refinementsParameters = ['dFR', 'fR', 'nR', 'hFR', 'tR'];
	var stateKeys = shortener.ENCODED_PARAMETERS;
	function sortQueryStringValues(prefixRegexp, invertedMapping, a, b) {
	  if (prefixRegexp !== null) {
	    a = a.replace(prefixRegexp, '');
	    b = b.replace(prefixRegexp, '');
	  }

	  a = invertedMapping[a] || a;
	  b = invertedMapping[b] || b;

	  if (stateKeys.indexOf(a) !== -1 || stateKeys.indexOf(b) !== -1) {
	    if (a === 'q') return -1;
	    if (b === 'q') return 1;

	    var isARefinements = refinementsParameters.indexOf(a) !== -1;
	    var isBRefinements = refinementsParameters.indexOf(b) !== -1;
	    if (isARefinements && !isBRefinements) {
	      return 1;
	    } else if (isBRefinements && !isARefinements) {
	      return -1;
	    }
	  }

	  return a.localeCompare(b);
	}

	/**
	 * Read a query string and return an object containing the state
	 * @param {string} queryString the query string that will be decoded
	 * @param {object} [options] accepted options :
	 *   - prefix : the prefix used for the saved attributes, you have to provide the
	 *     same that was used for serialization
	 *   - mapping : map short attributes to another value e.g. {q: 'query'}
	 * @return {object} partial search parameters object (same properties than in the
	 * SearchParameters but not exhaustive)
	 */
	exports.getStateFromQueryString = function(queryString, options) {
	  var prefixForParameters = options && options.prefix || '';
	  var mapping = options && options.mapping || {};
	  var invertedMapping = invert(mapping);

	  var partialStateWithPrefix = qs.parse(queryString);
	  var prefixRegexp = new RegExp('^' + prefixForParameters);
	  var partialState = mapKeys(
	    partialStateWithPrefix,
	    function(v, k) {
	      var hasPrefix = prefixForParameters && prefixRegexp.test(k);
	      var unprefixedKey = hasPrefix ? k.replace(prefixRegexp, '') : k;
	      var decodedKey = shortener.decode(invertedMapping[unprefixedKey] || unprefixedKey);
	      return decodedKey || unprefixedKey;
	    }
	  );

	  var partialStateWithParsedNumbers = SearchParameters._parseNumbers(partialState);

	  return pick(partialStateWithParsedNumbers, SearchParameters.PARAMETERS);
	};

	/**
	 * Retrieve an object of all the properties that are not understandable as helper
	 * parameters.
	 * @param {string} queryString the query string to read
	 * @param {object} [options] the options
	 *   - prefixForParameters : prefix used for the helper configuration keys
	 *   - mapping : map short attributes to another value e.g. {q: 'query'}
	 * @return {object} the object containing the parsed configuration that doesn't
	 * to the helper
	 */
	exports.getUnrecognizedParametersInQueryString = function(queryString, options) {
	  var prefixForParameters = options && options.prefix;
	  var mapping = options && options.mapping || {};
	  var invertedMapping = invert(mapping);

	  var foreignConfig = {};
	  var config = qs.parse(queryString);
	  if (prefixForParameters) {
	    var prefixRegexp = new RegExp('^' + prefixForParameters);
	    forEach(config, function(v, key) {
	      if (!prefixRegexp.test(key)) foreignConfig[key] = v;
	    });
	  } else {
	    forEach(config, function(v, key) {
	      if (!shortener.decode(invertedMapping[key] || key)) foreignConfig[key] = v;
	    });
	  }

	  return foreignConfig;
	};

	/**
	 * Generate a query string for the state passed according to the options
	 * @param {SearchParameters} state state to serialize
	 * @param {object} [options] May contain the following parameters :
	 *  - prefix : prefix in front of the keys
	 *  - mapping : map short attributes to another value e.g. {q: 'query'}
	 *  - moreAttributes : more values to be added in the query string. Those values
	 *    won't be prefixed.
	 *  - safe : get safe urls for use in emails, chat apps or any application auto linking urls.
	 *  All parameters and values will be encoded in a way that it's safe to share them.
	 *  Default to false for legacy reasons ()
	 * @return {string} the query string
	 */
	exports.getQueryStringFromState = function(state, options) {
	  var moreAttributes = options && options.moreAttributes;
	  var prefixForParameters = options && options.prefix || '';
	  var mapping = options && options.mapping || {};
	  var safe = options && options.safe || false;
	  var invertedMapping = invert(mapping);

	  var stateForUrl = safe ? state : recursiveEncode(state);

	  var encodedState = mapKeys(
	    stateForUrl,
	    function(v, k) {
	      var shortK = shortener.encode(k);
	      return prefixForParameters + (mapping[shortK] || shortK);
	    }
	  );

	  var prefixRegexp = prefixForParameters === '' ? null : new RegExp('^' + prefixForParameters);
	  var sort = bind(sortQueryStringValues, null, prefixRegexp, invertedMapping);
	  if (moreAttributes) {
	    var stateQs = qs.stringify(encodedState, {encode: safe, sort: sort});
	    var moreQs = qs.stringify(moreAttributes, {encode: safe});
	    if (!stateQs) return moreQs;
	    return stateQs + '&' + moreQs;
	  }

	  return qs.stringify(encodedState, {encode: safe, sort: sort});
	};


/***/ },
/* 320 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var invert = __webpack_require__(321);
	var keys = __webpack_require__(40);

	var keys2Short = {
	  advancedSyntax: 'aS',
	  allowTyposOnNumericTokens: 'aTONT',
	  analyticsTags: 'aT',
	  analytics: 'a',
	  aroundLatLngViaIP: 'aLLVIP',
	  aroundLatLng: 'aLL',
	  aroundPrecision: 'aP',
	  aroundRadius: 'aR',
	  attributesToHighlight: 'aTH',
	  attributesToRetrieve: 'aTR',
	  attributesToSnippet: 'aTS',
	  disjunctiveFacetsRefinements: 'dFR',
	  disjunctiveFacets: 'dF',
	  distinct: 'd',
	  facetsExcludes: 'fE',
	  facetsRefinements: 'fR',
	  facets: 'f',
	  getRankingInfo: 'gRI',
	  hierarchicalFacetsRefinements: 'hFR',
	  hierarchicalFacets: 'hF',
	  highlightPostTag: 'hPoT',
	  highlightPreTag: 'hPrT',
	  hitsPerPage: 'hPP',
	  ignorePlurals: 'iP',
	  index: 'idx',
	  insideBoundingBox: 'iBB',
	  insidePolygon: 'iPg',
	  length: 'l',
	  maxValuesPerFacet: 'mVPF',
	  minimumAroundRadius: 'mAR',
	  minProximity: 'mP',
	  minWordSizefor1Typo: 'mWS1T',
	  minWordSizefor2Typos: 'mWS2T',
	  numericFilters: 'nF',
	  numericRefinements: 'nR',
	  offset: 'o',
	  optionalWords: 'oW',
	  page: 'p',
	  queryType: 'qT',
	  query: 'q',
	  removeWordsIfNoResults: 'rWINR',
	  replaceSynonymsInHighlight: 'rSIH',
	  restrictSearchableAttributes: 'rSA',
	  synonyms: 's',
	  tagFilters: 'tF',
	  tagRefinements: 'tR',
	  typoTolerance: 'tT',
	  optionalTagFilters: 'oTF',
	  optionalFacetFilters: 'oFF',
	  snippetEllipsisText: 'sET',
	  disableExactOnAttributes: 'dEOA',
	  enableExactOnSingleWordQuery: 'eEOSWQ'
	};

	var short2Keys = invert(keys2Short);

	module.exports = {
	  /**
	   * All the keys of the state, encoded.
	   * @const
	   */
	  ENCODED_PARAMETERS: keys(short2Keys),
	  /**
	   * Decode a shorten attribute
	   * @param {string} shortKey the shorten attribute
	   * @return {string} the decoded attribute, undefined otherwise
	   */
	  decode: function(shortKey) {
	    return short2Keys[shortKey];
	  },
	  /**
	   * Encode an attribute into a short version
	   * @param {string} key the attribute
	   * @return {string} the shorten attribute
	   */
	  encode: function(key) {
	    return keys2Short[key];
	  }
	};


/***/ },
/* 321 */
/***/ function(module, exports, __webpack_require__) {

	var constant = __webpack_require__(118),
	    createInverter = __webpack_require__(322),
	    identity = __webpack_require__(113);

	/**
	 * Creates an object composed of the inverted keys and values of `object`.
	 * If `object` contains duplicate values, subsequent values overwrite
	 * property assignments of previous values.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.7.0
	 * @category Object
	 * @param {Object} object The object to invert.
	 * @returns {Object} Returns the new inverted object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2, 'c': 1 };
	 *
	 * _.invert(object);
	 * // => { '1': 'c', '2': 'b' }
	 */
	var invert = createInverter(function(result, value, key) {
	  result[value] = key;
	}, constant(identity));

	module.exports = invert;


/***/ },
/* 322 */
/***/ function(module, exports, __webpack_require__) {

	var baseInverter = __webpack_require__(323);

	/**
	 * Creates a function like `_.invertBy`.
	 *
	 * @private
	 * @param {Function} setter The function to set accumulator values.
	 * @param {Function} toIteratee The function to resolve iteratees.
	 * @returns {Function} Returns the new inverter function.
	 */
	function createInverter(setter, toIteratee) {
	  return function(object, iteratee) {
	    return baseInverter(object, setter, toIteratee(iteratee), {});
	  };
	}

	module.exports = createInverter;


/***/ },
/* 323 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(124);

	/**
	 * The base implementation of `_.invert` and `_.invertBy` which inverts
	 * `object` with values transformed by `iteratee` and set by `setter`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform values.
	 * @param {Object} accumulator The initial inverted object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function baseInverter(object, setter, iteratee, accumulator) {
	  baseForOwn(object, function(value, key, object) {
	    setter(accumulator, iteratee(value), key, object);
	  });
	  return accumulator;
	}

	module.exports = baseInverter;


/***/ },
/* 324 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Stringify = __webpack_require__(325);
	var Parse = __webpack_require__(327);

	module.exports = {
	    stringify: Stringify,
	    parse: Parse
	};


/***/ },
/* 325 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Utils = __webpack_require__(326);

	var arrayPrefixGenerators = {
	    brackets: function brackets(prefix) {
	        return prefix + '[]';
	    },
	    indices: function indices(prefix, key) {
	        return prefix + '[' + key + ']';
	    },
	    repeat: function repeat(prefix) {
	        return prefix;
	    }
	};

	var defaults = {
	    delimiter: '&',
	    strictNullHandling: false,
	    skipNulls: false,
	    encode: true,
	    encoder: Utils.encode
	};

	var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots) {
	    var obj = object;
	    if (typeof filter === 'function') {
	        obj = filter(prefix, obj);
	    } else if (obj instanceof Date) {
	        obj = obj.toISOString();
	    } else if (obj === null) {
	        if (strictNullHandling) {
	            return encoder ? encoder(prefix) : prefix;
	        }

	        obj = '';
	    }

	    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || Utils.isBuffer(obj)) {
	        if (encoder) {
	            return [encoder(prefix) + '=' + encoder(obj)];
	        }
	        return [prefix + '=' + String(obj)];
	    }

	    var values = [];

	    if (typeof obj === 'undefined') {
	        return values;
	    }

	    var objKeys;
	    if (Array.isArray(filter)) {
	        objKeys = filter;
	    } else {
	        var keys = Object.keys(obj);
	        objKeys = sort ? keys.sort(sort) : keys;
	    }

	    for (var i = 0; i < objKeys.length; ++i) {
	        var key = objKeys[i];

	        if (skipNulls && obj[key] === null) {
	            continue;
	        }

	        if (Array.isArray(obj)) {
	            values = values.concat(stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots));
	        } else {
	            values = values.concat(stringify(obj[key], prefix + (allowDots ? '.' + key : '[' + key + ']'), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots));
	        }
	    }

	    return values;
	};

	module.exports = function (object, opts) {
	    var obj = object;
	    var options = opts || {};
	    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
	    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
	    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
	    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
	    var encoder = encode ? (typeof options.encoder === 'function' ? options.encoder : defaults.encoder) : null;
	    var sort = typeof options.sort === 'function' ? options.sort : null;
	    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
	    var objKeys;
	    var filter;

	    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
	        throw new TypeError('Encoder has to be a function.');
	    }

	    if (typeof options.filter === 'function') {
	        filter = options.filter;
	        obj = filter('', obj);
	    } else if (Array.isArray(options.filter)) {
	        objKeys = filter = options.filter;
	    }

	    var keys = [];

	    if (typeof obj !== 'object' || obj === null) {
	        return '';
	    }

	    var arrayFormat;
	    if (options.arrayFormat in arrayPrefixGenerators) {
	        arrayFormat = options.arrayFormat;
	    } else if ('indices' in options) {
	        arrayFormat = options.indices ? 'indices' : 'repeat';
	    } else {
	        arrayFormat = 'indices';
	    }

	    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

	    if (!objKeys) {
	        objKeys = Object.keys(obj);
	    }

	    if (sort) {
	        objKeys.sort(sort);
	    }

	    for (var i = 0; i < objKeys.length; ++i) {
	        var key = objKeys[i];

	        if (skipNulls && obj[key] === null) {
	            continue;
	        }

	        keys = keys.concat(stringify(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots));
	    }

	    return keys.join(delimiter);
	};


/***/ },
/* 326 */
/***/ function(module, exports) {

	'use strict';

	var hexTable = (function () {
	    var array = new Array(256);
	    for (var i = 0; i < 256; ++i) {
	        array[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
	    }

	    return array;
	}());

	exports.arrayToObject = function (source, options) {
	    var obj = options.plainObjects ? Object.create(null) : {};
	    for (var i = 0; i < source.length; ++i) {
	        if (typeof source[i] !== 'undefined') {
	            obj[i] = source[i];
	        }
	    }

	    return obj;
	};

	exports.merge = function (target, source, options) {
	    if (!source) {
	        return target;
	    }

	    if (typeof source !== 'object') {
	        if (Array.isArray(target)) {
	            target.push(source);
	        } else if (typeof target === 'object') {
	            target[source] = true;
	        } else {
	            return [target, source];
	        }

	        return target;
	    }

	    if (typeof target !== 'object') {
	        return [target].concat(source);
	    }

	    var mergeTarget = target;
	    if (Array.isArray(target) && !Array.isArray(source)) {
	        mergeTarget = exports.arrayToObject(target, options);
	    }

	    return Object.keys(source).reduce(function (acc, key) {
	        var value = source[key];

	        if (Object.prototype.hasOwnProperty.call(acc, key)) {
	            acc[key] = exports.merge(acc[key], value, options);
	        } else {
	            acc[key] = value;
	        }
	        return acc;
	    }, mergeTarget);
	};

	exports.decode = function (str) {
	    try {
	        return decodeURIComponent(str.replace(/\+/g, ' '));
	    } catch (e) {
	        return str;
	    }
	};

	exports.encode = function (str) {
	    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
	    // It has been adapted here for stricter adherence to RFC 3986
	    if (str.length === 0) {
	        return str;
	    }

	    var string = typeof str === 'string' ? str : String(str);

	    var out = '';
	    for (var i = 0; i < string.length; ++i) {
	        var c = string.charCodeAt(i);

	        if (
	            c === 0x2D || // -
	            c === 0x2E || // .
	            c === 0x5F || // _
	            c === 0x7E || // ~
	            (c >= 0x30 && c <= 0x39) || // 0-9
	            (c >= 0x41 && c <= 0x5A) || // a-z
	            (c >= 0x61 && c <= 0x7A) // A-Z
	        ) {
	            out += string.charAt(i);
	            continue;
	        }

	        if (c < 0x80) {
	            out = out + hexTable[c];
	            continue;
	        }

	        if (c < 0x800) {
	            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
	            continue;
	        }

	        if (c < 0xD800 || c >= 0xE000) {
	            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
	            continue;
	        }

	        i += 1;
	        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
	        out += hexTable[0xF0 | (c >> 18)] + hexTable[0x80 | ((c >> 12) & 0x3F)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)];
	    }

	    return out;
	};

	exports.compact = function (obj, references) {
	    if (typeof obj !== 'object' || obj === null) {
	        return obj;
	    }

	    var refs = references || [];
	    var lookup = refs.indexOf(obj);
	    if (lookup !== -1) {
	        return refs[lookup];
	    }

	    refs.push(obj);

	    if (Array.isArray(obj)) {
	        var compacted = [];

	        for (var i = 0; i < obj.length; ++i) {
	            if (obj[i] && typeof obj[i] === 'object') {
	                compacted.push(exports.compact(obj[i], refs));
	            } else if (typeof obj[i] !== 'undefined') {
	                compacted.push(obj[i]);
	            }
	        }

	        return compacted;
	    }

	    var keys = Object.keys(obj);
	    for (var j = 0; j < keys.length; ++j) {
	        var key = keys[j];
	        obj[key] = exports.compact(obj[key], refs);
	    }

	    return obj;
	};

	exports.isRegExp = function (obj) {
	    return Object.prototype.toString.call(obj) === '[object RegExp]';
	};

	exports.isBuffer = function (obj) {
	    if (obj === null || typeof obj === 'undefined') {
	        return false;
	    }

	    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
	};


/***/ },
/* 327 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Utils = __webpack_require__(326);

	var has = Object.prototype.hasOwnProperty;

	var defaults = {
	    delimiter: '&',
	    depth: 5,
	    arrayLimit: 20,
	    parameterLimit: 1000,
	    strictNullHandling: false,
	    plainObjects: false,
	    allowPrototypes: false,
	    allowDots: false,
	    decoder: Utils.decode
	};

	var parseValues = function parseValues(str, options) {
	    var obj = {};
	    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

	    for (var i = 0; i < parts.length; ++i) {
	        var part = parts[i];
	        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

	        var key, val;
	        if (pos === -1) {
	            key = options.decoder(part);
	            val = options.strictNullHandling ? null : '';
	        } else {
	            key = options.decoder(part.slice(0, pos));
	            val = options.decoder(part.slice(pos + 1));
	        }
	        if (has.call(obj, key)) {
	            obj[key] = [].concat(obj[key]).concat(val);
	        } else {
	            obj[key] = val;
	        }
	    }

	    return obj;
	};

	var parseObject = function parseObject(chain, val, options) {
	    if (!chain.length) {
	        return val;
	    }

	    var root = chain.shift();

	    var obj;
	    if (root === '[]') {
	        obj = [];
	        obj = obj.concat(parseObject(chain, val, options));
	    } else {
	        obj = options.plainObjects ? Object.create(null) : {};
	        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
	        var index = parseInt(cleanRoot, 10);
	        if (
	            !isNaN(index) &&
	            root !== cleanRoot &&
	            String(index) === cleanRoot &&
	            index >= 0 &&
	            (options.parseArrays && index <= options.arrayLimit)
	        ) {
	            obj = [];
	            obj[index] = parseObject(chain, val, options);
	        } else {
	            obj[cleanRoot] = parseObject(chain, val, options);
	        }
	    }

	    return obj;
	};

	var parseKeys = function parseKeys(givenKey, val, options) {
	    if (!givenKey) {
	        return;
	    }

	    // Transform dot notation to bracket notation
	    var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, '[$1]') : givenKey;

	    // The regex chunks

	    var parent = /^([^\[\]]*)/;
	    var child = /(\[[^\[\]]*\])/g;

	    // Get the parent

	    var segment = parent.exec(key);

	    // Stash the parent if it exists

	    var keys = [];
	    if (segment[1]) {
	        // If we aren't using plain objects, optionally prefix keys
	        // that would overwrite object prototype properties
	        if (!options.plainObjects && has.call(Object.prototype, segment[1])) {
	            if (!options.allowPrototypes) {
	                return;
	            }
	        }

	        keys.push(segment[1]);
	    }

	    // Loop through children appending to the array until we hit depth

	    var i = 0;
	    while ((segment = child.exec(key)) !== null && i < options.depth) {
	        i += 1;
	        if (!options.plainObjects && has.call(Object.prototype, segment[1].replace(/\[|\]/g, ''))) {
	            if (!options.allowPrototypes) {
	                continue;
	            }
	        }
	        keys.push(segment[1]);
	    }

	    // If there's a remainder, just add whatever is left

	    if (segment) {
	        keys.push('[' + key.slice(segment.index) + ']');
	    }

	    return parseObject(keys, val, options);
	};

	module.exports = function (str, opts) {
	    var options = opts || {};

	    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
	        throw new TypeError('Decoder has to be a function.');
	    }

	    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
	    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
	    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
	    options.parseArrays = options.parseArrays !== false;
	    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
	    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
	    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
	    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
	    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
	    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

	    if (str === '' || str === null || typeof str === 'undefined') {
	        return options.plainObjects ? Object.create(null) : {};
	    }

	    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
	    var obj = options.plainObjects ? Object.create(null) : {};

	    // Iterate over the keys and setup the new object

	    var keys = Object.keys(tempObj);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var newObj = parseKeys(key, tempObj[key], options);
	        obj = Utils.merge(obj, newObj, options);
	    }

	    return Utils.compact(obj);
	};


/***/ },
/* 328 */
/***/ function(module, exports, __webpack_require__) {

	var basePick = __webpack_require__(329),
	    flatRest = __webpack_require__(223);

	/**
	 * Creates an object composed of the picked `object` properties.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [paths] The property paths to pick.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pick(object, ['a', 'c']);
	 * // => { 'a': 1, 'c': 3 }
	 */
	var pick = flatRest(function(object, paths) {
	  return object == null ? {} : basePick(object, paths);
	});

	module.exports = pick;


/***/ },
/* 329 */
/***/ function(module, exports, __webpack_require__) {

	var basePickBy = __webpack_require__(312),
	    hasIn = __webpack_require__(173);

	/**
	 * The base implementation of `_.pick` without support for individual
	 * property identifiers.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @returns {Object} Returns the new object.
	 */
	function basePick(object, paths) {
	  object = Object(object);
	  return basePickBy(object, paths, function(value, path) {
	    return hasIn(object, path);
	  });
	}

	module.exports = basePick;


/***/ },
/* 330 */
/***/ function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(187),
	    baseForOwn = __webpack_require__(124),
	    baseIteratee = __webpack_require__(135);

	/**
	 * The opposite of `_.mapValues`; this method creates an object with the
	 * same values as `object` and keys generated by running each own enumerable
	 * string keyed property of `object` thru `iteratee`. The iteratee is invoked
	 * with three arguments: (value, key, object).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.8.0
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Object} Returns the new mapped object.
	 * @see _.mapValues
	 * @example
	 *
	 * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
	 *   return key + value;
	 * });
	 * // => { 'a1': 1, 'b2': 2 }
	 */
	function mapKeys(object, iteratee) {
	  var result = {};
	  iteratee = baseIteratee(iteratee, 3);

	  baseForOwn(object, function(value, key, object) {
	    baseAssignValue(result, iteratee(value, key, object), value);
	  });
	  return result;
	}

	module.exports = mapKeys;


/***/ },
/* 331 */
/***/ function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(187),
	    baseForOwn = __webpack_require__(124),
	    baseIteratee = __webpack_require__(135);

	/**
	 * Creates an object with the same keys as `object` and values generated
	 * by running each own enumerable string keyed property of `object` thru
	 * `iteratee`. The iteratee is invoked with three arguments:
	 * (value, key, object).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Object} Returns the new mapped object.
	 * @see _.mapKeys
	 * @example
	 *
	 * var users = {
	 *   'fred':    { 'user': 'fred',    'age': 40 },
	 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
	 * };
	 *
	 * _.mapValues(users, function(o) { return o.age; });
	 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.mapValues(users, 'age');
	 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	 */
	function mapValues(object, iteratee) {
	  var result = {};
	  iteratee = baseIteratee(iteratee, 3);

	  baseForOwn(object, function(value, key, object) {
	    baseAssignValue(result, key, iteratee(value, key, object));
	  });
	  return result;
	}

	module.exports = mapValues;


/***/ },
/* 332 */
/***/ function(module, exports) {

	'use strict';

	module.exports = '2.16.0';


/***/ },
/* 333 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	// This file is for use with Node.js. See dist/ for browser files.

	var Hogan = __webpack_require__(334);
	Hogan.Template = __webpack_require__(335).Template;
	Hogan.template = Hogan.Template;
	module.exports = Hogan;


/***/ },
/* 334 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	(function (Hogan) {
	  // Setup regex  assignments
	  // remove whitespace according to Mustache spec
	  var rIsWhitespace = /\S/,
	      rQuot = /\"/g,
	      rNewline =  /\n/g,
	      rCr = /\r/g,
	      rSlash = /\\/g,
	      rLineSep = /\u2028/,
	      rParagraphSep = /\u2029/;

	  Hogan.tags = {
	    '#': 1, '^': 2, '<': 3, '$': 4,
	    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
	    '{': 10, '&': 11, '_t': 12
	  };

	  Hogan.scan = function scan(text, delimiters) {
	    var len = text.length,
	        IN_TEXT = 0,
	        IN_TAG_TYPE = 1,
	        IN_TAG = 2,
	        state = IN_TEXT,
	        tagType = null,
	        tag = null,
	        buf = '',
	        tokens = [],
	        seenTag = false,
	        i = 0,
	        lineStart = 0,
	        otag = '{{',
	        ctag = '}}';

	    function addBuf() {
	      if (buf.length > 0) {
	        tokens.push({tag: '_t', text: new String(buf)});
	        buf = '';
	      }
	    }

	    function lineIsWhitespace() {
	      var isAllWhitespace = true;
	      for (var j = lineStart; j < tokens.length; j++) {
	        isAllWhitespace =
	          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
	          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
	        if (!isAllWhitespace) {
	          return false;
	        }
	      }

	      return isAllWhitespace;
	    }

	    function filterLine(haveSeenTag, noNewLine) {
	      addBuf();

	      if (haveSeenTag && lineIsWhitespace()) {
	        for (var j = lineStart, next; j < tokens.length; j++) {
	          if (tokens[j].text) {
	            if ((next = tokens[j+1]) && next.tag == '>') {
	              // set indent to token value
	              next.indent = tokens[j].text.toString()
	            }
	            tokens.splice(j, 1);
	          }
	        }
	      } else if (!noNewLine) {
	        tokens.push({tag:'\n'});
	      }

	      seenTag = false;
	      lineStart = tokens.length;
	    }

	    function changeDelimiters(text, index) {
	      var close = '=' + ctag,
	          closeIndex = text.indexOf(close, index),
	          delimiters = trim(
	            text.substring(text.indexOf('=', index) + 1, closeIndex)
	          ).split(' ');

	      otag = delimiters[0];
	      ctag = delimiters[delimiters.length - 1];

	      return closeIndex + close.length - 1;
	    }

	    if (delimiters) {
	      delimiters = delimiters.split(' ');
	      otag = delimiters[0];
	      ctag = delimiters[1];
	    }

	    for (i = 0; i < len; i++) {
	      if (state == IN_TEXT) {
	        if (tagChange(otag, text, i)) {
	          --i;
	          addBuf();
	          state = IN_TAG_TYPE;
	        } else {
	          if (text.charAt(i) == '\n') {
	            filterLine(seenTag);
	          } else {
	            buf += text.charAt(i);
	          }
	        }
	      } else if (state == IN_TAG_TYPE) {
	        i += otag.length - 1;
	        tag = Hogan.tags[text.charAt(i + 1)];
	        tagType = tag ? text.charAt(i + 1) : '_v';
	        if (tagType == '=') {
	          i = changeDelimiters(text, i);
	          state = IN_TEXT;
	        } else {
	          if (tag) {
	            i++;
	          }
	          state = IN_TAG;
	        }
	        seenTag = i;
	      } else {
	        if (tagChange(ctag, text, i)) {
	          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
	                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
	          buf = '';
	          i += ctag.length - 1;
	          state = IN_TEXT;
	          if (tagType == '{') {
	            if (ctag == '}}') {
	              i++;
	            } else {
	              cleanTripleStache(tokens[tokens.length - 1]);
	            }
	          }
	        } else {
	          buf += text.charAt(i);
	        }
	      }
	    }

	    filterLine(seenTag, true);

	    return tokens;
	  }

	  function cleanTripleStache(token) {
	    if (token.n.substr(token.n.length - 1) === '}') {
	      token.n = token.n.substring(0, token.n.length - 1);
	    }
	  }

	  function trim(s) {
	    if (s.trim) {
	      return s.trim();
	    }

	    return s.replace(/^\s*|\s*$/g, '');
	  }

	  function tagChange(tag, text, index) {
	    if (text.charAt(index) != tag.charAt(0)) {
	      return false;
	    }

	    for (var i = 1, l = tag.length; i < l; i++) {
	      if (text.charAt(index + i) != tag.charAt(i)) {
	        return false;
	      }
	    }

	    return true;
	  }

	  // the tags allowed inside super templates
	  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

	  function buildTree(tokens, kind, stack, customTags) {
	    var instructions = [],
	        opener = null,
	        tail = null,
	        token = null;

	    tail = stack[stack.length - 1];

	    while (tokens.length > 0) {
	      token = tokens.shift();

	      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
	        throw new Error('Illegal content in < super tag.');
	      }

	      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
	        stack.push(token);
	        token.nodes = buildTree(tokens, token.tag, stack, customTags);
	      } else if (token.tag == '/') {
	        if (stack.length === 0) {
	          throw new Error('Closing tag without opener: /' + token.n);
	        }
	        opener = stack.pop();
	        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
	          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
	        }
	        opener.end = token.i;
	        return instructions;
	      } else if (token.tag == '\n') {
	        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
	      }

	      instructions.push(token);
	    }

	    if (stack.length > 0) {
	      throw new Error('missing closing tag: ' + stack.pop().n);
	    }

	    return instructions;
	  }

	  function isOpener(token, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].o == token.n) {
	        token.tag = '#';
	        return true;
	      }
	    }
	  }

	  function isCloser(close, open, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].c == close && tags[i].o == open) {
	        return true;
	      }
	    }
	  }

	  function stringifySubstitutions(obj) {
	    var items = [];
	    for (var key in obj) {
	      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
	    }
	    return "{ " + items.join(",") + " }";
	  }

	  function stringifyPartials(codeObj) {
	    var partials = [];
	    for (var key in codeObj.partials) {
	      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
	    }
	    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
	  }

	  Hogan.stringify = function(codeObj, text, options) {
	    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
	  }

	  var serialNo = 0;
	  Hogan.generate = function(tree, text, options) {
	    serialNo = 0;
	    var context = { code: '', subs: {}, partials: {} };
	    Hogan.walk(tree, context);

	    if (options.asString) {
	      return this.stringify(context, text, options);
	    }

	    return this.makeTemplate(context, text, options);
	  }

	  Hogan.wrapMain = function(code) {
	    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
	  }

	  Hogan.template = Hogan.Template;

	  Hogan.makeTemplate = function(codeObj, text, options) {
	    var template = this.makePartials(codeObj);
	    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
	    return new this.template(template, text, this, options);
	  }

	  Hogan.makePartials = function(codeObj) {
	    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
	    for (key in template.partials) {
	      template.partials[key] = this.makePartials(template.partials[key]);
	    }
	    for (key in codeObj.subs) {
	      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
	    }
	    return template;
	  }

	  function esc(s) {
	    return s.replace(rSlash, '\\\\')
	            .replace(rQuot, '\\\"')
	            .replace(rNewline, '\\n')
	            .replace(rCr, '\\r')
	            .replace(rLineSep, '\\u2028')
	            .replace(rParagraphSep, '\\u2029');
	  }

	  function chooseMethod(s) {
	    return (~s.indexOf('.')) ? 'd' : 'f';
	  }

	  function createPartial(node, context) {
	    var prefix = "<" + (context.prefix || "");
	    var sym = prefix + node.n + serialNo++;
	    context.partials[sym] = {name: node.n, partials: {}};
	    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
	    return sym;
	  }

	  Hogan.codegen = {
	    '#': function(node, context) {
	      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
	                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
	                      't.rs(c,p,' + 'function(c,p,t){';
	      Hogan.walk(node.nodes, context);
	      context.code += '});c.pop();}';
	    },

	    '^': function(node, context) {
	      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
	      Hogan.walk(node.nodes, context);
	      context.code += '};';
	    },

	    '>': createPartial,
	    '<': function(node, context) {
	      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
	      Hogan.walk(node.nodes, ctx);
	      var template = context.partials[createPartial(node, context)];
	      template.subs = ctx.subs;
	      template.partials = ctx.partials;
	    },

	    '$': function(node, context) {
	      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
	      Hogan.walk(node.nodes, ctx);
	      context.subs[node.n] = ctx.code;
	      if (!context.inPartial) {
	        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
	      }
	    },

	    '\n': function(node, context) {
	      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
	    },

	    '_v': function(node, context) {
	      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	    },

	    '_t': function(node, context) {
	      context.code += write('"' + esc(node.text) + '"');
	    },

	    '{': tripleStache,

	    '&': tripleStache
	  }

	  function tripleStache(node, context) {
	    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	  }

	  function write(s) {
	    return 't.b(' + s + ');';
	  }

	  Hogan.walk = function(nodelist, context) {
	    var func;
	    for (var i = 0, l = nodelist.length; i < l; i++) {
	      func = Hogan.codegen[nodelist[i].tag];
	      func && func(nodelist[i], context);
	    }
	    return context;
	  }

	  Hogan.parse = function(tokens, text, options) {
	    options = options || {};
	    return buildTree(tokens, '', [], options.sectionTags || []);
	  }

	  Hogan.cache = {};

	  Hogan.cacheKey = function(text, options) {
	    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
	  }

	  Hogan.compile = function(text, options) {
	    options = options || {};
	    var key = Hogan.cacheKey(text, options);
	    var template = this.cache[key];

	    if (template) {
	      var partials = template.partials;
	      for (var name in partials) {
	        delete partials[name].instance;
	      }
	      return template;
	    }

	    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
	    return this.cache[key] = template;
	  }
	})( true ? exports : Hogan);


/***/ },
/* 335 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	var Hogan = {};

	(function (Hogan) {
	  Hogan.Template = function (codeObj, text, compiler, options) {
	    codeObj = codeObj || {};
	    this.r = codeObj.code || this.r;
	    this.c = compiler;
	    this.options = options || {};
	    this.text = text || '';
	    this.partials = codeObj.partials || {};
	    this.subs = codeObj.subs || {};
	    this.buf = '';
	  }

	  Hogan.Template.prototype = {
	    // render: replaced by generated code.
	    r: function (context, partials, indent) { return ''; },

	    // variable escaping
	    v: hoganEscape,

	    // triple stache
	    t: coerceToString,

	    render: function render(context, partials, indent) {
	      return this.ri([context], partials || {}, indent);
	    },

	    // render internal -- a hook for overrides that catches partials too
	    ri: function (context, partials, indent) {
	      return this.r(context, partials, indent);
	    },

	    // ensurePartial
	    ep: function(symbol, partials) {
	      var partial = this.partials[symbol];

	      // check to see that if we've instantiated this partial before
	      var template = partials[partial.name];
	      if (partial.instance && partial.base == template) {
	        return partial.instance;
	      }

	      if (typeof template == 'string') {
	        if (!this.c) {
	          throw new Error("No compiler available.");
	        }
	        template = this.c.compile(template, this.options);
	      }

	      if (!template) {
	        return null;
	      }

	      // We use this to check whether the partials dictionary has changed
	      this.partials[symbol].base = template;

	      if (partial.subs) {
	        // Make sure we consider parent template now
	        if (!partials.stackText) partials.stackText = {};
	        for (key in partial.subs) {
	          if (!partials.stackText[key]) {
	            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
	          }
	        }
	        template = createSpecializedPartial(template, partial.subs, partial.partials,
	          this.stackSubs, this.stackPartials, partials.stackText);
	      }
	      this.partials[symbol].instance = template;

	      return template;
	    },

	    // tries to find a partial in the current scope and render it
	    rp: function(symbol, context, partials, indent) {
	      var partial = this.ep(symbol, partials);
	      if (!partial) {
	        return '';
	      }

	      return partial.ri(context, partials, indent);
	    },

	    // render a section
	    rs: function(context, partials, section) {
	      var tail = context[context.length - 1];

	      if (!isArray(tail)) {
	        section(context, partials, this);
	        return;
	      }

	      for (var i = 0; i < tail.length; i++) {
	        context.push(tail[i]);
	        section(context, partials, this);
	        context.pop();
	      }
	    },

	    // maybe start a section
	    s: function(val, ctx, partials, inverted, start, end, tags) {
	      var pass;

	      if (isArray(val) && val.length === 0) {
	        return false;
	      }

	      if (typeof val == 'function') {
	        val = this.ms(val, ctx, partials, inverted, start, end, tags);
	      }

	      pass = !!val;

	      if (!inverted && pass && ctx) {
	        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
	      }

	      return pass;
	    },

	    // find values with dotted names
	    d: function(key, ctx, partials, returnFound) {
	      var found,
	          names = key.split('.'),
	          val = this.f(names[0], ctx, partials, returnFound),
	          doModelGet = this.options.modelGet,
	          cx = null;

	      if (key === '.' && isArray(ctx[ctx.length - 2])) {
	        val = ctx[ctx.length - 1];
	      } else {
	        for (var i = 1; i < names.length; i++) {
	          found = findInScope(names[i], val, doModelGet);
	          if (found !== undefined) {
	            cx = val;
	            val = found;
	          } else {
	            val = '';
	          }
	        }
	      }

	      if (returnFound && !val) {
	        return false;
	      }

	      if (!returnFound && typeof val == 'function') {
	        ctx.push(cx);
	        val = this.mv(val, ctx, partials);
	        ctx.pop();
	      }

	      return val;
	    },

	    // find values with normal names
	    f: function(key, ctx, partials, returnFound) {
	      var val = false,
	          v = null,
	          found = false,
	          doModelGet = this.options.modelGet;

	      for (var i = ctx.length - 1; i >= 0; i--) {
	        v = ctx[i];
	        val = findInScope(key, v, doModelGet);
	        if (val !== undefined) {
	          found = true;
	          break;
	        }
	      }

	      if (!found) {
	        return (returnFound) ? false : "";
	      }

	      if (!returnFound && typeof val == 'function') {
	        val = this.mv(val, ctx, partials);
	      }

	      return val;
	    },

	    // higher order templates
	    ls: function(func, cx, partials, text, tags) {
	      var oldTags = this.options.delimiters;

	      this.options.delimiters = tags;
	      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
	      this.options.delimiters = oldTags;

	      return false;
	    },

	    // compile text
	    ct: function(text, cx, partials) {
	      if (this.options.disableLambda) {
	        throw new Error('Lambda features disabled.');
	      }
	      return this.c.compile(text, this.options).render(cx, partials);
	    },

	    // template result buffering
	    b: function(s) { this.buf += s; },

	    fl: function() { var r = this.buf; this.buf = ''; return r; },

	    // method replace section
	    ms: function(func, ctx, partials, inverted, start, end, tags) {
	      var textSource,
	          cx = ctx[ctx.length - 1],
	          result = func.call(cx);

	      if (typeof result == 'function') {
	        if (inverted) {
	          return true;
	        } else {
	          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
	          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
	        }
	      }

	      return result;
	    },

	    // method replace variable
	    mv: function(func, ctx, partials) {
	      var cx = ctx[ctx.length - 1];
	      var result = func.call(cx);

	      if (typeof result == 'function') {
	        return this.ct(coerceToString(result.call(cx)), cx, partials);
	      }

	      return result;
	    },

	    sub: function(name, context, partials, indent) {
	      var f = this.subs[name];
	      if (f) {
	        this.activeSub = name;
	        f(context, partials, this, indent);
	        this.activeSub = false;
	      }
	    }

	  };

	  //Find a key in an object
	  function findInScope(key, scope, doModelGet) {
	    var val;

	    if (scope && typeof scope == 'object') {

	      if (scope[key] !== undefined) {
	        val = scope[key];

	      // try lookup with get for backbone or similar model data
	      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
	        val = scope.get(key);
	      }
	    }

	    return val;
	  }

	  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
	    function PartialTemplate() {};
	    PartialTemplate.prototype = instance;
	    function Substitutions() {};
	    Substitutions.prototype = instance.subs;
	    var key;
	    var partial = new PartialTemplate();
	    partial.subs = new Substitutions();
	    partial.subsText = {};  //hehe. substext.
	    partial.buf = '';

	    stackSubs = stackSubs || {};
	    partial.stackSubs = stackSubs;
	    partial.subsText = stackText;
	    for (key in subs) {
	      if (!stackSubs[key]) stackSubs[key] = subs[key];
	    }
	    for (key in stackSubs) {
	      partial.subs[key] = stackSubs[key];
	    }

	    stackPartials = stackPartials || {};
	    partial.stackPartials = stackPartials;
	    for (key in partials) {
	      if (!stackPartials[key]) stackPartials[key] = partials[key];
	    }
	    for (key in stackPartials) {
	      partial.partials[key] = stackPartials[key];
	    }

	    return partial;
	  }

	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;

	  function coerceToString(val) {
	    return String((val === null || val === undefined) ? '' : val);
	  }

	  function hoganEscape(str) {
	    str = coerceToString(str);
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }

	  var isArray = Array.isArray || function(a) {
	    return Object.prototype.toString.call(a) === '[object Array]';
	  };

	})( true ? exports : Hogan);


/***/ }
/******/ ]);
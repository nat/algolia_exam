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
/***/ function(module, exports) {

	'use strict';

	$(function () {
		var APPLICATION_ID = '0OCVIREAOB';
		var SEARCH_ONLY_API_KEY = 'a4a59fd80b0436442ed0e8dbaf48e449';
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
		var algolia = algoliasearch(APPLICATION_ID, SEARCH_ONLY_API_KEY);
		var algoliaHelper = algoliasearchHelper(algolia, INDEX_NAME, PARAMS);

		// DOM BINDING
		$searchInput = $('#search-input');
		$main = $('#main');
		// $sortBySelect = $('#sort-by-select');
		$hits = $('#hits');
		$stats = $('#stats');
		$facets = $('#facets');
		$pagination = $('#pagination');

		// Hogan templates binding
		var hitTemplate = Hogan.compile($('#hit-template').text());
		var statsTemplate = Hogan.compile($('#stats-template').text());
		var facetTemplate = Hogan.compile($('#facet-template').text());
		var paginationTemplate = Hogan.compile($('#pagination-template').text());
		var noResultsTemplate = Hogan.compile($('#no-results-template').text());

		// Input binding
		$searchInput.on('keyup', function () {
			var query = $(this).val();
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
			console.log(content);
			for (var i = 0; i < numHits; i++) {
				// normalize stars so they always consistently show a single decimal place
				stars_count_fixed = parseFloat(content.hits[i].stars_count).toFixed(1);
				content.hits[i]['stars_count_fixed'] = parseFloat(content.hits[i].stars_count).toFixed(1);
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
					disjunctive: $.inArray(facetName, PARAMS.disjunctiveFacets) !== -1
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

		$(document).on('click', '.go-to-page', function (e) {
			e.preventDefault();
			$('html, body').animate({ scrollTop: 0 }, '500', 'swing');
			algoliaHelper.setCurrentPage(+$(this).data('page') - 1).search();
		});
		$(document).on('click', '.toggle-refine', function (e) {
			e.preventDefault();
			algoliaHelper.toggleRefine($(this).data('facet'), $(this).data('value')).search();
		});
	});

/***/ }
/******/ ]);
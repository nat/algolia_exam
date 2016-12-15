console.log('Hello World!');
import $ from 'jquery';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import Hogan from 'hogan.js';
$(function () {
	const APPLICATION_ID = 'XFR58PCS2L';
	const SEARCH_ONLY_API_KEY = 'e9c56390c8795d4c2835ce70d9f28e76';
	const INDEX_NAME = 'poc_restaurants';
	const PARAMS = {
  		hitsPerPage: 3,
  		maxValuesPerFacet: 7,
  		index: INDEX_NAME,
  		facets: ['food_type']
	};
	const FACETS_ORDER_OF_DISPLAY = ['food_type'];
	const FACETS_LABELS = {food_type: 'Cuisine / Food Type'};

	// Client + Helper initialization
	var algolia = algoliasearch(APPLICATION_ID, SEARCH_ONLY_API_KEY);
	var algoliaHelper = algoliasearchHelper(algolia, INDEX_NAME, PARAMS);

	// DOM BINDING
	var $searchInput = $('#search-input');

	var $main = $('#main');
	// $sortBySelect = $('#sort-by-select');
	var $hits = $('#hits');
	var $stats = $('#stats');
	var $facets = $('#facets');
	var $pagination = $('#pagination');

	// Hogan templates binding
	var hitTemplate = Hogan.compile($('#hit-template').text());
	var statsTemplate = Hogan.compile($('#stats-template').text());
	var facetTemplate = Hogan.compile($('#facet-template').text());
	var paginationTemplate = Hogan.compile($('#pagination-template').text());
	var noResultsTemplate = Hogan.compile($('#no-results-template').text());

	// Input binding
	$searchInput
	.on('keyup', function() {
	  var query = $(this).val();
	  algoliaHelper.setQuery(query).search();
	})
	.focus();

	// Search results
	algoliaHelper.on('result', function(content, state) {
  		renderHits(content);
		renderStats(content);
		renderFacets(content, state);
		renderPagination(content);
	});

	function renderHits(content) {
		$hits.html(hitTemplate.render(addMetadataToHits(content)));
	}

	function addMetadataToHits(content){
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
				values: content.getFacetValues(facetName, {sortBy: ['isRefined:desc', 'count:desc']}),
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
			pages.push({current: false, number: 1});
			pages.push({current: false, number: '...', disabled: true});
		}
		for (var p = content.page - 3; p < content.page + 3; ++p) {
			if (p < 0 || p >= content.nbPages) continue;
			pages.push({current: content.page === p, number: p + 1});
		}
		if (content.page + 3 < content.nbPages) {
			pages.push({current: false, number: '...', disabled: true});
			pages.push({current: false, number: content.nbPages});
		}
		var pagination = {
			pages: pages,
			prev_page: content.page > 0 ? content.page : false,
			next_page: content.page + 1 < content.nbPages ? content.page + 2 : false
		};
		$pagination.html(paginationTemplate.render(pagination));
	}

	$(document).on('click', '.go-to-page', function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: 0}, '500', 'swing');
		algoliaHelper.setCurrentPage(+$(this).data('page') - 1).search();
	});
	$(document).on('click', '.toggle-refine', function(e) {
  		e.preventDefault();
  		algoliaHelper.toggleRefine($(this).data('facet'), $(this).data('value')).search();
	});

});

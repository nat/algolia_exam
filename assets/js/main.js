$(function () {
	var APPLICATION_ID = '0OCVIREAOB';
	var SEARCH_ONLY_API_KEY = 'a4a59fd80b0436442ed0e8dbaf48e449';
	var INDEX_NAME = 'poc_restaurants';
	var PARAMS = {
  		hitsPerPage: 3,
  		maxValuesPerFacet: 8,
  		index: INDEX_NAME
	};
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
	$searchInput
	.on('keyup', function() {
	  var query = $(this).val();
	  algoliaHelper.setQuery(query).search();
	})
	.focus();

	// Search results
	algoliaHelper.on('result', function(content, state) {
  		renderHits(content);
	});

	function renderHits(content) {
		$hits.html(hitTemplate.render(content));
	}

});

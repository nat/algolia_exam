import React from 'react';
import {render} from 'react-dom';
import $ from 'jquery';
import Hogan from 'hogan.js';
import App from './components/App';
import {algoliaHelper, ALGOLIA_QUERY_PARAMS} from './AlgoliaClient';

render(<App/>, document.getElementById('app'));

$(function () {
	const FACETS_ORDER_OF_DISPLAY = ['food_type'];
	const FACETS_LABELS = {food_type: 'Cuisine / Food Type'};

	// DOM BINDING
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

	// Search results
	algoliaHelper.on('result', (content, state) => {
		renderHits(content);
		renderFacets(content, state);
		renderPagination(content);
	});

	function renderHits(content) {
		// console.log(content);
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
				disjunctive: $.inArray(facetName, ALGOLIA_QUERY_PARAMS.disjunctiveFacets) !== -1
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
		console.log('got here');
		algoliaHelper.toggleRefine($(this).data('facet'), $(this).data('value')).search();
	});

});

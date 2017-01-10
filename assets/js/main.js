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
	// var $hits = $('#hits');
	// var $stats = $('#stats');
	var $facets = $('#facets');
	// var $pagination = $('#pagination');

	// Hogan templates binding
	// var hitTemplate = Hogan.compile($('#hit-template').text());
	// var statsTemplate = Hogan.compile($('#stats-template').text());
	var facetTemplate = Hogan.compile($('#facet-template').text());

	// Search results
	algoliaHelper.on('result', (content, state) => {
		renderFacet(content, state, 'food_type');
	});

	function renderFacet(content, state, facetName) {
		// console.log(content, state);
		let facetsHtml = '';
		const facetResult = content.getFacetByName(facetName);
		let facetContent = {};
		if (facetResult) {
			facetContent = {
				facet: facetName,
				title: FACETS_LABELS[facetName],
				values: content.getFacetValues(facetName, {sortBy: ['count:desc', 'name:asc']}),
			};

			facetsHtml += facetTemplate.render(facetContent);
		}
		$facets.html(facetsHtml);
	}

	$(document).on('click', '.toggle-refine', function(e) {
		e.preventDefault();
		// for clear UX, allow just one facet to be selected at a time (remove previous selections)
		algoliaHelper.clearRefinements();
		algoliaHelper.toggleRefine($(this).data('facet'), $(this).data('value')).search();
	});

});

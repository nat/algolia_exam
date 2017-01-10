import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import {ALGOLIA_SETTINGS} from './CustomSettings';

export const ALGOLIA_QUERY_PARAMS = {
	hitsPerPage: 3,
	maxValuesPerFacet: 7, // demo only shows 7 food types, can increase it here
	index: ALGOLIA_SETTINGS['INDEX_NAME'],
	// for clear UX, used disjunctive facets to allow displaying of sibling facets
	disjunctiveFacets: ['food_type']
};

const algoliaClient = algoliasearch(ALGOLIA_SETTINGS['APPLICATION_ID'], 
	ALGOLIA_SETTINGS['SEARCH_ONLY_API_KEY']);

export const algoliaHelper = algoliasearchHelper(algoliaClient, 
	ALGOLIA_SETTINGS['INDEX_NAME'], ALGOLIA_QUERY_PARAMS);
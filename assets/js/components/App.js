import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainColumn from './MainColumn';
import {algoliaHelper} from '../AlgoliaClient';

class App extends React.Component {
	constructor(){
		super();
		this.state = {
			searchQuery: '',
			facetFoodType: '',
			stats: {nbHits: 0, nbHitsPlural: false, processingTimeSeconds: 0},
			hits: [],
			pagination: { next_page: 0}
		};
		this.sendQuery = this.sendQuery.bind(this);
		this.setQuery = this.setQuery.bind(this);
		this.processStats = this.processStats.bind(this);
		this.processHits = this.processHits.bind(this);
		this.addMetadataToHits = this.addMetadataToHits.bind(this);
		this.goToNextPage = this.goToNextPage.bind(this);

		// register algolia result event listener
		algoliaHelper.on('result', (content, state) => {
			this.processStats(content);
			this.processPagination(content);
			this.processHits(content);
		});

	}

	processHits(content) {
		this.setState({hits: this.addMetadataToHits(content.hits)},
				// render after state is saved:
				() => {this.render;});
	}

	processStats(content) {
		const stats = {
			nbHits: content.nbHits,
			nbHitsPlural: content.nbHits !== 1,
			processingTimeSeconds: content.processingTimeMS / 1000
		};
		this.setState({ stats },
			// render after state is saved:
			() => {this.render;});
		
	}

	processPagination(content) {
		const NO_MORE_PAGES = 0; // a falsey value
		const pageNum = content.page;
		const pagination = {
			next_page: pageNum + 1 < content.nbPages ? pageNum + 2 : NO_MORE_PAGES
		};
		this.setState({pagination},
			// render after state is saved:
			() => {this.render;});
	}

	goToNextPage(nextPage){
		algoliaHelper.setCurrentPage(+nextPage - 1).search();
	}

	sendQuery(){
		algoliaHelper.setQuery(this.state.searchQuery).search();
	}

	setQuery(newSearchQuery){
		// set the search
		this.setState({ searchQuery: newSearchQuery },
			// send query after state is saved:
			this.sendQuery);
	}

	addMetadataToHits(hits){
		const numHits = hits.length;
		for (let i = 0; i < numHits; i++) {
			// normalize stars so they always consistently show a single decimal place
			const stars_count_fixed = parseFloat(hits[i].stars_count).toFixed(1);
			hits[i].stars_count_fixed = stars_count_fixed;
		}
		return hits;
	}

	render() {
		return(
			<div className="app-restaurants">
				<Header setQuery={this.setQuery}/>
				<Sidebar/>
				<MainColumn 
					hits={this.state.hits}
					stats={this.state.stats}
					pagination={this.state.pagination}
					goToNextPage={this.goToNextPage}
				/>
			</div>
		);
	}
}

export default App;

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
			stats: ''
		};
		this.sendQuery = this.sendQuery.bind(this);
		this.setQuery = this.setQuery.bind(this);
		this.processStats = this.processStats.bind(this);
		this.processHits = this.processHits.bind(this);

		// register algolia result event listener
		algoliaHelper.on('result', (content, state) => {
			this.processStats(content);
			this.processHits(content);
		});

	}

	processHits(content) {
		
	}

	processStats(content) {
		const stats = {
			nbHits: content.nbHits,
			nbHitsPlural: content.nbHits !== 1,
			processingTimeSeconds: content.processingTimeMS / 1000
		};
		this.setState({ stats: stats },
			// render after state is saved:
			() => {this.render;});
		
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

	render() {
		return(
			<div className="app-restaurants">
				<Header setQuery={this.setQuery}/>
				<Sidebar/>
				<MainColumn stats={this.state.stats}/>
			</div>
		);
	}
}

export default App;

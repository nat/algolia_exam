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
			facetFoodType: ''
		};
		this.sendQuery = this.sendQuery.bind(this);
		this.setQuery = this.setQuery.bind(this);
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
				<MainColumn/>
			</div>
		);
	}
}

export default App;

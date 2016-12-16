import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainColumn from './MainColumn';

class App extends React.Component {
	constructor(){
		super();
		this.state = {
			searchQuery: '',
			facetFoodType: ''
		};
		this.setQuery = this.setQuery.bind(this);
		this.sendQuery = this.sendQuery.bind(this);
	}

	sendQuery(){
	}

	setQuery(searchQuery){
		// set state to include the searchQuery
		this.setState({searchQuery: searchQuery});
		this.sendQuery();
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

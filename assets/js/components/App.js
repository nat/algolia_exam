import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainColumn from './MainColumn';

class App extends React.Component {
	constructor(){
		super();
		this.state = {
			searchQuery: ''
		};
	}

	render() {
		return(
			<div className="app-restaurants">
				<Header/>
				<Sidebar/>
				<MainColumn/>
			</div>
		);
	}
}

export default App;

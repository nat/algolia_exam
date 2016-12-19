import React from 'react';
import Stats from './Stats';

class MainColumn extends React.Component {
	constructor(){
		super();
	}

	render(){
		return (
			<div id="main">
				<Stats stats={this.props.stats}/>
				<div id="hits"></div>
				<div id="pagination"></div>
			</div>
		);
	}
}

export default MainColumn;
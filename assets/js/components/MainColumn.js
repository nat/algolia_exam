import React from 'react';

class MainColumn extends React.Component {
	constructor(){
		super();
	}

	render(){
		return (
			<div id="main">
				<div id="stats"></div>
				<div id="hits"></div>
				<div id="pagination"></div>
			</div>
		);
	}
}

export default MainColumn;
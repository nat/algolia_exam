import React from 'react';

class Sidebar extends React.Component {
	constructor(){
		super();
	}

	render(){
		return (
			<div id="sidebar">
				<div id="facets"></div>
			</div>
		);
	}
}

export default Sidebar;
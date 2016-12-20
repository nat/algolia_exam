import React from 'react';
import FacetFoodType from './FacetFoodType';

class Sidebar extends React.Component {
	constructor(){
		super();
	}

	render(){
		return (
			<div id="sidebar">
				<div id="facets">
					<FacetFoodType/>
				</div>
			</div>
		);
	}
}

export default Sidebar;
import React from 'react';
import FacetFoodType from './FacetFoodType';

class Sidebar extends React.Component {

	render(){
		return (
			<div id="sidebar">
				<div id="facets">
					<FacetFoodType
						facetName = {this.props.facetFoodType.facet}
						title = {this.props.facetFoodType.title}
						values = {this.props.facetFoodType.values}
					/>
				</div>
			</div>
		);
	}
}

export default Sidebar;
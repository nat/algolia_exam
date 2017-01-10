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
						refineFacet={this.props.refineFacet}
					/>
				</div>
			</div>
		);
	}
}

Sidebar.propTypes = {
	facetFoodType: React.PropTypes.shape({
		facet: React.PropTypes.string.isRequired,
		title: React.PropTypes.string.isRequired,
		values: React.PropTypes.array.isRequired
	}),
	refineFacet: React.PropTypes.func.isRequired
};

export default Sidebar;
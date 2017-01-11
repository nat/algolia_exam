import React from 'react';
import FacetValue from './FacetValue';

class FacetFoodType extends React.Component {

	render(){
		return (
			<div className="facet">
				<h5>{this.props.title}</h5>
				<ul>
					{
						this.props.values.map(facetValue => 
							<FacetValue 
								count={facetValue.count}
								facetName={this.props.facetName}
								isRefined={facetValue.isRefined}
								key={facetValue.name}
								name={facetValue.name}
								refineFacet={this.props.refineFacet}
							/>)
					}
				</ul>
			</div>
		);
	}
}

FacetFoodType.propTypes = {
	facetFoodType: React.PropTypes.shape({
		facetName: React.PropTypes.string.isRequired,
		title: React.PropTypes.string.isRequired,
		values: React.PropTypes.array.isRequired
	}),
	refineFacet: React.PropTypes.func.isRequired
};

export default FacetFoodType;
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
							/>)
					}
				</ul>
			</div>
		);
	}
}

export default FacetFoodType;
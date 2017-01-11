import React from 'react';

class FacetValue extends React.Component {

	render(){
		return (
			<a 	href="" 
				className={`facet-link toggle-refine ${this.props.isRefined ? 'facet-refined' : ''}`} 
				onClick={(e) => this.props.refineFacet(e, this.props.facetName, this.props.name)}
			>
				<li>
					{this.props.name}<span className="facet-count">{this.props.count}</span>
				</li>
			</a>
		);
	}
}

FacetValue.propTypes = {
	count: React.PropTypes.number.isRequired,
	facetName: React.PropTypes.string.isRequired,
	name: React.PropTypes.string.isRequired,
	refineFacet: React.PropTypes.func.isRequired
};

export default FacetValue;
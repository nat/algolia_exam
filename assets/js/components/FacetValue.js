import React from 'react';

class FacetValue extends React.Component {

	render(){
		return (
			<a 	href="" 
				className={`facet-link toggle-refine ${this.props.isRefined ? 'facet-refined' : ''}`} 
				data-facet={this.props.facetName} 
				data-value={this.props.name}
			>
				<li>
					{this.props.name}<span className="facet-count">{ this.props.count }</span>
				</li>
			</a>
		);
	}
}

export default FacetValue;
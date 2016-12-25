import React from 'react';

class FacetFoodType extends React.Component {

	render(){
		return (
			<div className="facet">
				<h5>Title</h5>
			</div>
		);
	}
}

export default FacetFoodType;

        // <h5>{{ title }}</h5>
        // <ul>
        //   {{#values}}
        //   <a href="" class="facet-link toggle-refine 
        //   {{#isRefined}}facet-refined{{/isRefined}}" data-facet="{{ facet }}" data-value="{{ name }}">
        //     <li>
        //       {{ name }}<span class="facet-count">{{ count }}</span>
        //     </li>
        //   </a>
        //   {{/values}}
        // </ul>
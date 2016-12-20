import React from 'react';

class Pagination extends React.Component {
	constructor(){
		super();
	}

	render(){
		return (
			<div id="pagination"/>
		);
	}
}

export default Pagination;

  // <ul>
  // {{#next_page}}
  //   <li {{^next_page}}class="disabled"{{/next_page}}><a href="#" {{#next_page}}class="go-to-page" data-page="{{ next_page }}"{{/next_page}}>Show More</a></li>
  // {{/next_page}}
  // </ul>
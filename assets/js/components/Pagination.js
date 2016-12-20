import React from 'react';

class Pagination extends React.Component {
	constructor(){
		super();
	}

	render(){
		const next_page = this.props.pagination.next_page;

		if(!next_page){ return <div id="pagination"/>;} 
		return (
			<div id="pagination">
				<ul>
					<li>
						<a 	href="#" 
							className="go-to-page" 
							data-page={ next_page }
							onClick={()=> this.props.goToNextPage(next_page)}>
							Show More
						</a>
					</li>
				</ul>
			</div>		
		);
	}
}

export default Pagination;
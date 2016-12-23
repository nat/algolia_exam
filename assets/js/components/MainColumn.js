import React from 'react';
import Stats from './Stats';
import Hit from './Hit';
import Pagination from './Pagination';

class MainColumn extends React.Component {

	render(){
		return (
			<div id="main">
				<Stats stats={this.props.stats}/>
				<div id="hits">
					{
						this.props.hits.map(hit => 
							<Hit key={hit.objectID} hit={hit} />)
					}
				</div>
				<Pagination 
					pagination={this.props.pagination}
					goToNextPage={this.props.goToNextPage}
					/>
			</div>
		);
	}
}

MainColumn.propTypes = {
	hits: React.PropTypes.array.isRequired,
	pagination: React.PropTypes.object.isRequired,
	goToNextPage: React.PropTypes.func.isRequired
};

export default MainColumn;
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
	pagination: React.PropTypes.shape({
		next_page: React.PropTypes.number.isRequired
	}),
	goToNextPage: React.PropTypes.func.isRequired,
	stats: React.PropTypes.shape({
		nbHits: React.PropTypes.number.isRequired,
		nbHitsPlural: React.PropTypes.bool.isRequired,
		processingTimeSeconds: React.PropTypes.number.isRequired
	})

};

export default MainColumn;
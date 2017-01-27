import React from 'react';

class Stats extends React.Component {

	render(){
		const nbHits = this.props.stats.nbHits;
		if (nbHits > 0){
			return (
				<div id="stats">
					<span className="results-found"> 
						{nbHits} result
						{this.props.stats.nbHitsPlural ? 's ' : ' '}
					</span>
						found&nbsp;
					<span className="found-in">
						in  {this.props.stats.processingTimeSeconds} seconds
					</span>
				</div>
			);			
		} else {
			return (
				<div id="stats">No Results found</div>
			);
		}
	}
}

Stats.propTypes = {
	stats: React.PropTypes.shape({
		nbHits: React.PropTypes.number.isRequired,
		nbHitsPlural: React.PropTypes.bool.isRequired,
		processingTimeSeconds: React.PropTypes.number.isRequired
	})
};

export default Stats;
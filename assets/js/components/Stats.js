import React from 'react';

class Stats extends React.Component {
	constructor(){
		super();
	}

	render(){
		const nbHits = this.props.stats.nbHits;
		if (nbHits && nbHits > 0){
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

export default Stats;
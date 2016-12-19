import React from 'react';

class Stats extends React.Component {
	constructor(){
		super();
	}

	render(){
		if (this.props.stats.nbHits && this.props.stats.nbHits > 0){
			return (
				<div id="stats">
					<span className="results-found"> 
						{this.props.stats.nbHits} result
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
				<div id="stats"/>
			);
		}
	}
}

export default Stats;
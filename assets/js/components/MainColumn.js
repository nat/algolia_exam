import React from 'react';
import Stats from './Stats';
import Hit from './Hit';

class MainColumn extends React.Component {
	constructor(){
		super();
	}

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
				<div id="pagination"></div>
			</div>
		);
	}
}

export default MainColumn;
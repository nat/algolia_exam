import React from 'react';

class Header extends React.Component {
	constructor(){
		super();
	}

	prepareQuery(e){
		console.log(e);
		console.log(this.searchinput.value);
	}

	render(){
		return (
			<div id="header">
				<input 
					id="search-input" 
					ref={input => this.searchinput = input}
					type="text" 
					autoComplete="off" 
					spellCheck="false" 
					autoCorrect="off" 
					placeholder="Search for Restaurants by Name, Cuisine, Location"
					onChange={(e) => this.prepareQuery(e)}
				/>
			</div>
		);
	}
}

export default Header;
import React from 'react';

class Header extends React.Component {

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
					onKeyUp={(e) => 
						this.props.setQuery(this.searchinput.value)}
				/>
			</div>
		);
	}
}

Header.propTypes = {
	setQuery: React.PropTypes.func.isRequired
};

export default Header;
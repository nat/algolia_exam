import React from 'react';

class Header extends React.Component {
	// do an initial focus into the search field for better UX
	componentDidMount(){
		this.searchinput.focus();
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
					onKeyUp={() => 
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
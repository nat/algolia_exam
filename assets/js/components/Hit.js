import React from 'react';

class Hit extends React.Component {
	constructor(){
		super();
	}

	render(){
		return (
			<div className="hit">
				<div className="hit-image">
					<img 
						src={this.props.hit.image_url} 
						alt={this.props.hit.name} />
				</div>
				<div className="hit-content">
					<div className="hit-name">{this.props.hit.name}</div>
					<div className="hit-stars-count"> {this.props.hit.stars_count_fixed} </div>
					<div className="hit-reviews-count">({this.props.hit.reviews_count} reviews)</div>
					<div className="hit-neighborhood"> {this.props.hit.food_type} | {this.props.hit.neighborhood} | {this.props.hit.price_range}</div>
				</div>
			</div>
		);
	}
}

Hit.propTypes = {
	hit: React.PropTypes.object.isRequired,
};

export default Hit;
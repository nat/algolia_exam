import React from 'react';

class Hit extends React.Component {

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

// proptypes here help debug if proper results were returned from Algolia

Hit.propTypes = {
	hit: React.PropTypes.shape({
		name: React.PropTypes.string.isRequired,
		stars_count_fixed: React.PropTypes.string.isRequired,
		image_url: React.PropTypes.string.isRequired,
		reviews_count: React.PropTypes.number.isRequired,
		food_type: React.PropTypes.string.isRequired,
		neighborhood: React.PropTypes.string.isRequired,
		price_range: React.PropTypes.string.isRequired
	})
};

export default Hit;
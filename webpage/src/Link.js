import React from 'react';
import PropTypes from 'prop-types';

const Link = ({ className, to, children }) => {
	const onClick = (event) => {
		if (event.metaKey || event.ctrlKey) {
			return;
		}

		event.preventDefault();
		window.history.pushState({}, '', to);

		const navEvent = new PopStateEvent('popstate');
		window.dispatchEvent(navEvent);
	};


	return (
		<a onClick={onClick} className={className} to={to}>
			{children}
		</a>
	);
};

// props validation
Link.propTypes = {
	className: PropTypes.string,
	to: PropTypes.string,
	children:PropTypes.object
}


export default Link;

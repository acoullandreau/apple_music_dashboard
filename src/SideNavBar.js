import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

class SideNavBar extends React.Component {

	state = { activeItem: '',  'matchPages':{'':'home', '#graphs':'chart bar', '#help':'help'} };

	componentDidMount() {
		this.onLocationChange();
	}

	componentDidUpdate() {
		window.addEventListener('popstate', this.onLocationChange);
	}

	onLocationChange = () => {
		var selectedPage = this.state.matchPages[window.location.hash];
		this.setState({ activeItem: selectedPage });
    };


	handleItemClick = (e, { name, to }) => {
		if (e.metaKey || e.ctrlKey) {
			var target = window.location.href.replace('#', to)
			window.open(target, "_blank")
			return;
		}

		this.setState({ activeItem: name });
		window.history.pushState({}, '', to);

		const navEvent = new PopStateEvent('popstate');
		window.dispatchEvent(navEvent);

	}

	render () {
		let graphsProps;
		if (this.props.showGraphs) {
			graphsProps = (
				<Icon 
					link
					to="#graphs"
					inverted={this.state.activeItem === 'chart bar' ? true : false}
					bordered
					circular
					name='chart bar' 
					size='big' 
					onClick={this.handleItemClick}
				/>
			)
		} else {
			graphsProps = (
				<Icon 
					disabled
					bordered
					circular
					name='chart bar' 
					size='big' 
				/>
			)
		}

		return (
			<React.Fragment>
				<div style={{margin:'10px'}}>
					<Icon 
						link
						to='#'
						inverted={this.state.activeItem === 'home' ? true : false}
						bordered
						circular
						name='home'
						size='big' 
						onClick={this.handleItemClick}
					/>
				</div>
				<div style={{margin:'10px'}} >
					{graphsProps}
				</div>
				<div style={{margin:'10px'}} >
					<Icon 
						link
						to='#help'
						inverted={this.state.activeItem === 'help' ? true : false}
						bordered
						circular
						name='help' 
						size='big'
						onClick={this.handleItemClick}
					/>
				</div>
			</React.Fragment>
		);

	}
}

// props validation
SideNavBar.propTypes = {
   selection: PropTypes.string,
   showGraphs:PropTypes.bool,
}


export default SideNavBar;

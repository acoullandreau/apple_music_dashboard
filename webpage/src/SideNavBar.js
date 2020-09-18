import React from 'react';
//import Link from './Link';
import { Icon } from 'semantic-ui-react';

class SideNavBar extends React.Component {

	state = { activeItem: 'home' };

	handleItemClick = (e, { name, to }) => {
		console.log(e)
		this.setState({ activeItem: name });

		if (e.metaKey || e.ctrlKey) {
			return;
		}

		e.preventDefault();
		window.history.pushState({}, '', to);

		const navEvent = new PopStateEvent('popstate');
		window.dispatchEvent(navEvent);

	}

	render () {
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

export default SideNavBar;

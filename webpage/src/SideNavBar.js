import React from 'react';
//import Link from './Link';
import { Icon, Menu } from 'semantic-ui-react';

class SideNavBar extends React.Component {

	state = { activeItem: 'home' };

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name });

	}

	render () {
		return (
			<Menu icon vertical>
				<Menu.Item
					name='home'
					active={this.state.activeItem === 'home'}
					onClick={this.handleItemClick}
				>
					<Icon name='home' />
				</Menu.Item>

				<Menu.Item
					name='chart bar'
					active={this.state.activeItem === 'chart bar'}
					onClick={this.handleItemClick}
				>
					<Icon name='chart bar' />
				</Menu.Item>

				<Menu.Item
					name='help'
					active={this.state.activeItem === 'help'}
					onClick={this.handleItemClick}
				>
					<Icon name='help' />
				</Menu.Item>
			</Menu>
		);

	}
}


			// <div className="ui secondary pointing menu">
			// <Link href="/dist/" className="item">
			// Home
			// </Link>
			// <Link href="/dist/graphs" className="item">
			// Graphs
			// </Link>
			// <Link href="/dist/help" className="item">
			// Help
			// </Link>

			// </div>
export default SideNavBar;

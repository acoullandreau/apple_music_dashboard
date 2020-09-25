import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'semantic-ui-react';

class CalendarPlotFilter extends React.Component {

	state = { 'target':'DOM' };

	handleChange = (e, selection) => {
		this.setState({ 'target': selection.value }, () => {
			this.props.onChange({ 'type': 'heatmap', 'payload': {'type': this.state.target } })
		});

	}

	render() {
		return (
			<Form className='paragraph'>
				<Button
					toggle 
					size='tiny'
					value='DOM' 
					active={this.state.target === 'DOM' ? true : false} 
					onClick={this.handleChange}
				>
					Day of the month
				</Button>
				<Button 
					toggle
					size='tiny'
					value='DOW' 
					active={this.state.target === 'DOW' ? true : false} 
					onClick={this.handleChange}
				>
					Day of the week
				</Button>
			</Form>
		)
	}
}

// props validation
CalendarPlotFilter.propTypes = {
   onChange:PropTypes.func.isRequired,
}


export default CalendarPlotFilter;
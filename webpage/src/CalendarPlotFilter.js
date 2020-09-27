import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'semantic-ui-react';

class CalendarPlotFilter extends React.Component {

	state = { 'target':'DOM' };

	handleChange = (e, selection) => {
		this.setState({ 'target': selection.value });
		this.props.onChange({ 'type': 'heatmap', 'payload': {'type': selection.value } })

	}

	render() {
		return (
			<Form className='paragraph'>
				<div>
					<p className='bold'>Choose target:</p>
					<Button
						toggle 
						size='small'
						value='DOM' 
						active={this.state.target === 'DOM' ? true : false} 
						onClick={this.handleChange}
					>
						Day of the month
					</Button>
					<Button 
						toggle
						size='small'
						value='DOW' 
						active={this.state.target === 'DOW' ? true : false} 
						onClick={this.handleChange}
					>
						Day of the week
					</Button>
				</div>
			</Form>
		)
	}
}

// props validation
CalendarPlotFilter.propTypes = {
   onChange:PropTypes.func.isRequired,
}


export default CalendarPlotFilter;
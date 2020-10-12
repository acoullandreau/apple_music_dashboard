import React from 'react';
import PropTypes from 'prop-types';
import { Form, Checkbox, Button } from 'semantic-ui-react';

class BarPlotFilter extends React.Component {

	state = { 'granularity':'month', 'unit':'count' };

	handleChange = (e, selection) => {

		if (selection.radio) {
			this.setState({ 'granularity': selection.value });
			this.props.onChange({ 'type': 'bar', 'payload': {'type': selection.value, 'unit': this.state.unit } })
		} else if (selection.toggle) {
			this.setState({ 'unit': selection.value });
			this.props.onChange({ 'type': 'bar', 'payload': {'type': this.state.granularity, 'unit': selection.value } })
		}
	}

	render() {
		return (
			<Form className='paragraph'>
				<React.Fragment>
					<p className='bold'>Choose unit:</p>
					<ul>
						<li className='button-margin'>
							<Button
								className='button-margin'
								toggle 
								value='count' 
								active={this.state.unit === 'count' ? true : false} 
								onClick={this.handleChange}
							>
								Count
							</Button>
						</li>
						<li className='button-margin'>
							<Button 
								className='button-margin'
								toggle
								value='percent' 
								active={this.state.unit === 'percent' ? true : false} 
								onClick={this.handleChange}
							>
								Percentage
							</Button>
						</li>
					</ul>
				</React.Fragment>
				<div className='button-margin-top'>
					<p className='bold'>Choose time granularity:</p>
					<Form.Field>
							<Checkbox
							radio
							label='Per month'
							name='checkboxRadioGroup'
							value='month'
							checked={this.state.granularity === 'month'}
							onChange={this.handleChange}
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							radio
							label='Per day of the month'
							name='checkboxRadioGroup'
							value='dom'
							checked={this.state.granularity === 'dom'}
							onChange={this.handleChange}
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							radio
							label='Per day of the week'
							name='checkboxRadioGroup'
							value='dow'
							checked={this.state.granularity === 'dow'}
							onChange={this.handleChange}
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							radio
							label='Per hour of the day'
							name='checkboxRadioGroup'
							value='hod'
							checked={this.state.granularity === 'hod'}
							onChange={this.handleChange}
						/>
					</Form.Field>
				</div>
			</Form>
		)
	}
}

// props validation
BarPlotFilter.propTypes = {
   onChange:PropTypes.func.isRequired,
}


export default BarPlotFilter;
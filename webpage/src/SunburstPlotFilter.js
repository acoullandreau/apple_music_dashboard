import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'semantic-ui-react';

class SunburstPlotFilter extends React.Component {
	state = { 'target':'genre', 'numItems':'5' };

	handleChange = (e, selection) => {
		var payload = { 'type' : this.state.target, 'numItems': this.state.numItems};

		if (selection) {
			// handle the type selection using buttons
			this.setState({ 'target': selection.value });
			payload['type'] = selection.value
		} else {
			// handles the number input field change
			if (e.target.validity.valid) {
				this.setState({ 'numItems': e.target.value });
				if (e.target.value !== '') {
					payload['numItems'] = e.target.value;
				}
			} else {
				this.setState({ 'numItems': '5' });
				payload['numItems'] = '5';
			}
		}
		this.props.onChange({ 'type': 'sunburst', 'payload': payload })
	}


	render() {
		return (
			<Form className='paragraph'>
				<div>
					<p className='bold'>Choose target:</p>
					<Button 
						toggle 
						size='small'
						value='genre' 
						active={this.state.target === 'genre' ? true : false} 
						onClick={this.handleChange}
					>
						Genre
					</Button>
					<Button 
						toggle 
						size='small'
						value='artist' 
						active={this.state.target === 'artist' ? true : false} 
						onClick={this.handleChange}
					>
						Artist
					</Button>
					<Button 
						toggle 
						size='small'
						value='title' 
						active={this.state.target === 'title' ? true : false} 
						onClick={this.handleChange}
					>
						Title
					</Button>
				</div>
				<div style={{width:'65%', marginTop:'10%'}}>
					<p className='bold'>Number of items ranked:</p>
					<input type="number" value={this.state.numItems} onChange={this.handleChange} />
				</div>
			</Form>


		)
	}
}

// props validation
SunburstPlotFilter.propTypes = {
   onChange:PropTypes.func.isRequired
}


export default SunburstPlotFilter;

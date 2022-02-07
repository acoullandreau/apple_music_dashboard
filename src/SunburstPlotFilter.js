import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'semantic-ui-react';

class SunburstPlotFilter extends React.Component {
	state = { 'target':'title', 'numItems':'5' };

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
			<Form className='paragraph' >
				<React.Fragment>
					<p className='bold'>Choose target:</p>
					<ul>
						<li className='button-margin'>
							<Button 
								toggle 
								size='medium'
								value='title' 
								active={this.state.target === 'title' ? true : false} 
								onClick={this.handleChange}
							>
								Title
							</Button>
						</li>
						<li className='button-margin'>
							<Button 
								toggle 
								size='medium'
								value='artist' 
								active={this.state.target === 'artist' ? true : false} 
								onClick={this.handleChange}
							>
								Artist
							</Button>
						</li>
						<li className='button-margin'>
							<Button 
								toggle 
								size='medium'
								value='genre' 
								active={this.state.target === 'genre' ? true : false} 
								onClick={this.handleChange}
							>
								Genre
							</Button>
						</li>
					</ul>
				</React.Fragment>
				<div className='button-margin-top'>
					<p className='bold'>Number of items ranked:</p>
					<input style={{backgroundColor:"#f9f9f2"}} type="number" value={this.state.numItems} onChange={this.handleChange} />
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

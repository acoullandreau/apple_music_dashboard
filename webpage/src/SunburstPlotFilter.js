import React from 'react';
import { Button } from 'semantic-ui-react';

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
        	<div>
			    <Button.Group vertical>
			      <Button toggle value='genre' active={this.state.target === 'genre' ? true : false} onClick={this.handleChange}>Genre</Button>
			      <Button toggle value='artist' active={this.state.target === 'artist' ? true : false} onClick={this.handleChange}>Artist</Button>
			      <Button toggle value='title' active={this.state.target === 'title' ? true : false} onClick={this.handleChange}>Title</Button>
			    </Button.Group>
			    <div>
				    <input type="number" value={this.state.numItems} onChange={this.handleChange} />
				</div>
			</div>
        )
    }
}

export default SunburstPlotFilter;

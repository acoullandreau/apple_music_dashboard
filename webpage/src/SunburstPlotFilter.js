import React from 'react';
import { Button } from 'semantic-ui-react';

class SunburstPlotFilter extends React.Component {
    state = { 'target':'genre' };

    handleChange = (e, selection) => {
        this.setState({ 'target': selection.value });
        this.props.onChange({ 'type': 'sunburst', 'payload': {'type': selection.value } })
    }

    render() {
        return (
		    <Button.Group vertical>
		      <Button toggle value='genre' active={this.state.target === 'genre' ? true : false} onClick={this.handleChange}>Genre</Button>
		      <Button toggle value='artist' active={this.state.target === 'artist' ? true : false} onClick={this.handleChange}>Artist</Button>
		      <Button toggle value='title' active={this.state.target === 'title' ? true : false} onClick={this.handleChange}>Title</Button>
		    </Button.Group>

        )
    }
}

export default SunburstPlotFilter;
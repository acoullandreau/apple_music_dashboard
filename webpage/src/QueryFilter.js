import React from 'react';
import Plot from 'react-plotly.js';
import { Button, Dropdown } from 'semantic-ui-react';

class QueryFilter extends React.Component {

	state = { 'target':'', 'data':{'rating':'', 'offline':'', 'origin':'', 'skipped':'', 'inlib':'', 'year':'', 'genre':'', 'artist':'', 'title':''} };

    componentDidMount() {
        this.setState({ 'target' : this.props.target });
    }

    handleChange = (e, selection) => {
        var data = {...this.state.data};
        data[selection.name] = selection.value;
        this.setState({ data });
    }

    onSubmit = () => {
        this.props.onQuery(this.state);
    }

    onReset = () => {
        var data = {...this.state.data};
        for (var filter in data) {
            data[filter] = '';
        }
        console.log(data)
        //this.setState({ data });
        //this.props.onReset(this.state);
    }

    fetchOptionsRating = () =>  {
    	var options = [
    		{ key: 1, text: 'Love', value: 'LOVE' },
    		{ key: 2, text: 'Dislike', value: 'DISLIKE' },
            { key: 3, text: 'Not rated', value: 'Unknown' }
    	];

    	return options;
    }

    fetchOptionsOffline = () =>  {
    	var options = [
    		{ key: 1, text: 'Yes', value: true },
    		{ key: 2, text: 'No', value: false }
    	];

    	return options;
    }


    fetchOptionsSkipped = () =>  {
        // column in file is 'Played Completely', so the value is the inverse than the answer to 'Skipped'
    	var options = [
    		{ key: 1, text: 'Yes', value: false },
    		{ key: 2, text: 'No', value: true }
    	];

    	return options;
    }

	fetchOptionsLibrary = () => {
    	var options = [
    		{ key: 1, text: 'Yes', value: true },
    		{ key: 2, text: 'No', value: false }
    	];

    	return options;
    }

    fetchOptionsOrigin = () => {
        var options = [];
        var k=1;
        var origins = this.props.data['origin'];
        for (var i in origins) {
            var option = { key: k, text: origins[i], value: origins[i] };
            options.push(option)
            k++;
        }

    	return options;
    }

    fetchOptionsYear = () => {
        var options = [];
        var k=1;
        var years = this.props.data['year'];
        for (var i in years) {
            var option = { key: k, text: years[i], value: years[i] };
            options.push(option)
            k++;
        }

        return options;
    }

    fetchOptionsGenre = () => {
        var options = [];
        var k=1;
        var genres = this.props.data['genre'];
        for (var i in genres) {
            var option = { key: k, text: genres[i], value: genres[i] };
            options.push(option)
            k++;
        }

        return options;
    }

    fetchOptionsArtist = () => {
        var options = [];
        var k=1;
        var artists = this.props.data['artist'];
        for (var i in artists) {
            var option = { key: k, text: artists[i], value: artists[i] };
            options.push(option)
            k++;
        }

        return options;
    }

    renderQueryHeatMap() {
        var renderingDict = {
            'rating': { 'placeholder':'Rating', 'value':this.state.data['rating'], 'multiple':false, 'options':this.fetchOptionsRating() },
            'offline': { 'placeholder':'Offline', 'value':this.state.data['offline'], 'multiple':false, 'options':this.fetchOptionsOffline() },
            'skipped': { 'placeholder':'Skipped', 'value':this.state.data['skipped'], 'multiple':false, 'options':this.fetchOptionsSkipped() },
            'origin': { 'placeholder':'Origin', 'value':this.state.data['origin'], 'multiple':true, 'options':this.fetchOptionsOrigin() },
            'inlib': { 'placeholder':'Library Track', 'value':this.state.data['inlib'], 'multiple':false, 'options':this.fetchOptionsLibrary() },
            'year': { 'placeholder':'Year', 'value':this.state.data['year'], 'multiple':true, 'options':this.fetchOptionsYear() },
        }
            // 'genre': { 'placeholder':'Genre', 'value':this.state.data['genre'], 'multiple':true, 'options':this.fetchOptionsGenre() },
            // 'artist': { 'placeholder':'Artist', 'value':this.state.data['artist'], 'multiple':true, 'options':this.fetchOptionsArtist() },

        return (
            <div>
                <ul style={{display: "inline"}}>
                  {
                    React.Children.toArray(
                        Object.keys(renderingDict).map((item, i) => {
                            if (renderingDict[item]['multiple']) {
                                return (
                                    <li style={{listStyleType:"none"}}>
                                        <Dropdown
                                            placeholder={renderingDict[item]['placeholder']}
                                            name={item}
                                            onChange={this.handleChange}
                                            clearable
                                            search
                                            multiple
                                            options={renderingDict[item]['options']}
                                        />
                                    </li>
                                )
                            } else {
                                return (
                                    <li style={{listStyleType:"none"}}>
                                        <Dropdown
                                            placeholder={renderingDict[item]['placeholder']}
                                            name={item}
                                            onChange={this.handleChange}
                                            clearable
                                            search
                                            options={renderingDict[item]['options']}
                                        />
                                    </li>
                                )
                            }
                        })
                    )
                  }
                </ul>
            </div>
        )
                  // <li>Placeholder for text input for Title keyword</li>
    }

    renderQuerySunburst() {

        var renderingDict = {
            'rating': { 'placeholder':'Rating', 'value':this.state.data['rating'], 'multiple':false, 'options':this.fetchOptionsRating() },
            'offline': { 'placeholder':'Offline', 'value':this.state.data['offline'], 'multiple':false, 'options':this.fetchOptionsOffline() },
            'skipped': { 'placeholder':'Skipped', 'value':this.state.data['skipped'], 'multiple':false, 'options':this.fetchOptionsSkipped() },
            'origin': { 'placeholder':'Origin', 'value':this.state.data['origin'], 'multiple':true, 'options':this.fetchOptionsOrigin() },
            'inlib': { 'placeholder':'Library Track', 'value':this.state.data['inlib'], 'multiple':false, 'options':this.fetchOptionsLibrary() },
        }

        return (
            <div>
                <ul style={{display: "inline"}}>
                  {
                    React.Children.toArray(
                        Object.keys(renderingDict).map((item, i) => {
                            if (renderingDict[item]['multiple']) {
                                return (
                                    <li style={{listStyleType:"none"}}>
                                        <Dropdown
                                            placeholder={renderingDict[item]['placeholder']}
                                            name={item}
                                            onChange={this.handleChange}
                                            clearable
                                            search
                                            multiple
                                            options={renderingDict[item]['options']}
                                        />
                                    </li>
                                )
                            } else {
                                return (
                                    <li style={{listStyleType:"none"}}>
                                        <Dropdown
                                            placeholder={renderingDict[item]['placeholder']}
                                            name={item}
                                            onChange={this.handleChange}
                                            clearable
                                            search
                                            options={renderingDict[item]['options']}
                                        />
                                    </li>
                                )
                            }
                        })
                    )
                  }
                </ul>
            </div>
        )
    }

    render() {
    	if (this.props.target.type === 'heatMap') {
    		return (
    			<div>
    				{this.renderQueryHeatMap()}
                    <div>
                        <Button color='red' onClick={this.onSubmit}>Refresh</Button>
                        <Button color='blue' onClick={this.onReset}>Reset</Button>
                    </div>
				</div>
    		)
    	} else if (this.props.target.type === 'sunburst') {
    		return (
    			<div>
    				{this.renderQuerySunburst()}
                    <div>
                        <Button color='red' onClick={this.onSubmit}>Refresh</Button>
                        <Button color='blue' onClick={this.onReset}>Reset</Button>
                    </div>
    			</div>
    		)
    	}

    }
}


export default QueryFilter;
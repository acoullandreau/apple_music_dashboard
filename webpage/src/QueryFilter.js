import React from 'react';
import Plot from 'react-plotly.js';
import { Button, Dropdown, Search } from 'semantic-ui-react';
//import Table from './Table.js';
import SearchList from './SearchList.js';

class QueryFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            'target':'', 
            'data':{'rating':'', 'offline':'', 'origin':'', 'skipped':'', 'inlib':'', 'year':'', 'genre':'', 'artist':'', 'title':''},
            'resetIsDisabled': true,
        };
    }

    componentDidMount() {
        this.setState({ 'target' : this.props.target });
    }

    handleChange = (e, selection) => {
        console.log(selection)
        var data = {...this.state.data};
        data[selection.name] = selection.value;
        this.setState({ data });
    }

    onSubmit = () => {
        this.setState({ 'resetIsDisabled':false }, () => {
            this.props.onQuery(this.state);
        })
    }

    onReset = () => {
        for (var ref in this.refs) {
            if (ref.includes('dropdown')) {
                this.refs[ref].clearValue();
            }
        }
        
        var data = {...this.state.data};
        for (var filter in data) {
            data[filter] = '';
        }
        this.setState({ 'data':data, 'resetIsDisabled':true }, () => {
            this.props.onReset(this.state.target);
        })
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
    		{ key: 4, text: 'Yes', value: true },
    		{ key: 5, text: 'No', value: false }
    	];

    	return options;
    }


    fetchOptionsSkipped = () =>  {
        // column in file is 'Played Completely', so the value is the inverse than the answer to 'Skipped'
    	var options = [
    		{ key: 6, text: 'Yes', value: false },
    		{ key: 7, text: 'No', value: true }
    	];

    	return options;
    }

	fetchOptionsLibrary = () => {
    	var options = [
    		{ key: 8, text: 'Yes', value: true },
    		{ key: 9, text: 'No', value: false }
    	];

    	return options;
    }

    fetchOptionsOrigin = () => {
        var options = [];
        var k=10;
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
        var k=50;
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
        var k=100;
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
        var k=1000;
        var artists = this.props.data['artist'];
        for (var i in artists) {
            var option = { key: k, title: artists[i], text: artists[i], value: artists[i] };
            options.push(option)
            k++;
        }

        return options;
    }

    fetchOptionsTitle = () => {
        var options = [];
        var k=10000;
        var titles = this.props.data['title'];
        for (var i in titles) {
            var option = { key: k, title: titles[i], text: titles[i], value: titles[i] };
            options.push(option)
            k++;
        }

        return options;
    }

    renderDropdown() {
        var renderingDict = {
            'rating': { 'placeholder':'Rating', 'multiple':false, 'options':this.fetchOptionsRating() },
            'offline': { 'placeholder':'Offline', 'multiple':false, 'options':this.fetchOptionsOffline() },
            'skipped': { 'placeholder':'Skipped', 'multiple':false, 'options':this.fetchOptionsSkipped() },
            'origin': { 'placeholder':'Origin', 'multiple':true, 'options':this.fetchOptionsOrigin() },
            'inlib': { 'placeholder':'Library Track', 'multiple':false, 'options':this.fetchOptionsLibrary() },
        }

        return (
            <div>
                <ul style={{display: "inline"}}>
                  {
                    React.Children.toArray(
                        Object.keys(renderingDict).map((item, i) => {
                            var ref = "dropdown" + i;
                            if (renderingDict[item]['multiple']) {
                                return (
                                    <li style={{listStyleType:"none"}}>
                                        <Dropdown
                                            placeholder={renderingDict[item]['placeholder']}
                                            name={item}
                                            onChange={this.handleChange}
                                            selection
                                            clearable
                                            search
                                            multiple
                                            options={renderingDict[item]['options']}
                                            ref={ref}
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
                                            selection
                                            clearable
                                            search
                                            options={renderingDict[item]['options']}
                                            ref={ref}
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

    onSelect = (selection) => {
        console.log(selection)
    }

    renderQueryHeatMap() {
        var genres = { 'placeholder':'Genre', 'checklist':true, 'multiple':true, 'options':this.fetchOptionsGenre() }
        var artists = { 'placeholder':'Artist', 'checklist':true, 'multiple':true, 'options':this.fetchOptionsArtist() }
        var titles = { 'placeholder':'Title', 'checklist':true, 'multiple':true, 'options':this.fetchOptionsArtist() }   

        return (
            <div>
                { this.renderDropdown() }
                <div>
                    <Dropdown
                        placeholder='Select genres'
                        onChange={this.handleChange}
                        selection
                        clearable
                        search
                        multiple
                        options={this.fetchOptionsGenre()}
                    />
                </div>
                <div>
                    <SearchList data={this.fetchOptionsArtist()} onSelect={this.onSelect} />
                </div>
                <div>
                    <SearchList data={this.fetchOptionsTitle()} onSelect={this.onSelect} />
                </div>
            </div>
        )
    }

    renderQuerySunburst() {
        return (
            <div>
                { this.renderDropdown() }
            </div>
        )
    }

    renderButtons() {
        if (this.state.resetIsDisabled) {
            return (
                <div>
                    <Button color='red' onClick={this.onSubmit}>Refresh</Button>
                    <Button color='blue' disabled onClick={this.onReset}>Reset</Button>
                </div>
            )
        } else {
            return(
                <div>
                    <Button color='red' onClick={this.onSubmit}>Refresh</Button>
                    <Button color='blue' onClick={this.onReset}>Reset</Button>
                </div>
            )
        }
    }

    render() {
    	if (this.props.target.type === 'heatMap') {
    		return (
    			<div>
    				{this.renderQueryHeatMap()}
                    {this.renderButtons()}
				</div>
    		)
    	} else if (this.props.target.type === 'sunburst') {
    		return (
    			<div>
    				{this.renderQuerySunburst()}
                    {this.renderButtons()}
    			</div>
    		)
    	}

    }
}


export default QueryFilter;
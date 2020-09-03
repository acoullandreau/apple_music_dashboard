import React from 'react';
import Plot from 'react-plotly.js';
import { Dropdown } from 'semantic-ui-react';

class QueryFilter extends React.Component {

	state = { 'target':'', 'data':{'rating':'', 'offline':'', 'origin':[], 'skipped':'', 'inlib':'', 'year':[], 'genre':[], 'artist':[], 'title':''} };

    handleChange = (e, selection) => {
        if (typeof(this.state.data[selection.name]) === "string") {
            this.state.data[selection.name] = selection.value;
        } else {
            this.state.data[selection.name].push(selection.value);
            // if (selection.value in this.state.data[selection.name] === false) {
            // }
        }
        console.log(this.state.data)
    }

    fetchOptionsRating = () =>  {
    	var options = [
    		{ key: 1, text: 'Love', value: 'Love' },
    		{ key: 2, text: 'Dislike', value: 'Dislike' }
    	];

    	return options;
    }

    fetchOptionsOffline = () =>  {
    	var options = [
    		{ key: 1, text: 'Offline', value: 'Offline' },
    		{ key: 2, text: 'Online', value: 'Online' }
    	];

    	return options;
    }


    fetchOptionsSkipped = () =>  {
    	var options = [
    		{ key: 1, text: 'Partial', value: 'Partial' },
    		{ key: 2, text: 'Complete', value: 'Complete' }
    	];

    	return options;
    }

	fetchOptionsLibrary = () => {
    	var options = [
    		{ key: 1, text: 'In library', value: 'InLib' },
    		{ key: 2, text: 'Not in library', value: 'NotInLib' }
    	];

    	return options;
    }

    fetchOptionsOrigin = () => {
    	var options = [
    		{ key: 1, text: 'Partial', value: 'Partial' },
    		{ key: 2, text: 'Complete', value: 'Complete' }
    	];

    	return options;
    }


    renderQueryHeatMap() {

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
    	if (this.props.target === 'heatMap') {
    		return (
    			<div>
    				{this.renderQueryHeatMap()}
				</div>
    		)
    	} else if (this.props.target === 'sunburst') {
    		return (
    			<div>
    				{this.renderQuerySunburst()}
    			</div>
    		)
    	}

    }
}


export default QueryFilter;
import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class SunburstPlot extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type, 'renderNone':false }
	}

	updatePlot(parameters) {
		if ('data' in parameters) {
			// check is there is a match to plot
			var sunburstHasUpdate = parameters.data.rankingDict.genre?Object.keys(parameters.data.rankingDict.genre):false
			if (sunburstHasUpdate.length > 0) {
				//we expect this update to concern the data (query)
				var data = parameters.data.sunburst;
				this.setState({ 'data':data });
			}
			else {
				this.setState({ 'renderNone':true });
			}
		} else {
			// it is just a new selection of the plot to render
			var data = this.state.data
			this.setState({'data':data, 'type':parameters.payload.type});
		}
	}

	resetPlot() {
		var data = this.state.initialData;
		this.setState({ data });
	}

	render() {
		var type = this.state.type;
		var targetPlot = type+'Sunburst';
		var title = plotConfig['sunburstPlot'][targetPlot]['title'];
		var data = this.state.data[type];
		// var style = plotConfig['sunburstPlot'][targetPlot]['style'];

		if (this.state.renderNone) {
			return (
				<div>
					<p>There is no match to the filters you selected. Please try another query!</p>
				</div>
			);
		} else {
			return (
				<div>
					<Plot
						data={[
							{
								values: data['values'],
								labels: data['labels'],
								ids:data['ids'],
								parents:data['parents'],
								type: "sunburst",
								branchvalues: "total",
								insidetextorientation: "radial",
							},
						]}
						layout={{title: title, autosize:true}}
					/>
				</div>
			);
		}

	}
}

export default SunburstPlot;
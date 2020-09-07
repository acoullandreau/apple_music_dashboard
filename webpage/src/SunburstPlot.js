import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class SunburstPlot extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type }
	}

	updatePlot(parameters) {
		if ('data' in parameters) {
			//we expect this update to concern the data (query)
			var data = parameters.data.sunburst;
			this.setState({ 'data':data });
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

		return (
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
		);
	}
}

export default SunburstPlot;
import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class SunburstPlot extends React.Component {

	render() {
		var type = this.props.target.type;
		// var style = targetConfig['style'];
		// var title = targetConfig['title'];
		var data = this.props.data[type];

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
				layout={{title: 'Title', autosize:true}}
			/>
		);
	}
}

export default SunburstPlot;
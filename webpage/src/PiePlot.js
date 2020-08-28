import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class PiePlot extends React.Component {


	getTitle() {
		if (this.props.target === 'year') {
			return plotConfig.piePlot['pieYear']['title'];
		} else if (this.props.target === 'device') {
			return plotConfig.piePlot['pieDevice']['title'];
		}

	}

	render() {

		return (
			<Plot
				data={[
					{
						values: this.props.data.values,
						labels: this.props.data.labels,
						type: 'pie',
						textinfo: "percent",
						insidetextorientation: "horizontal",
					},
				]}
				layout={{title: this.getTitle()}}
			/>
		);
	}
}

export default PiePlot;


			// <Plot
			//   data={[
			//     {
			//       x: [1, 2, 3],
			//       y: [2, 6, 3],
			//       type: 'scatter',
			//       mode: 'lines+markers',
			//       marker: {color: 'red'},
			//     },
			//     {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
			//   ]}
			//   layout={{width: 320, height: 240, title: 'A Fancy Plot'}}
			// />
import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class PiePlot extends React.Component {

	getTargetConfig() {
		if (this.props.target === 'year') {
			return plotConfig.piePlot['pieYear'];
		} else if (this.props.target === 'device') {
			return plotConfig.piePlot['pieDevice'];
		}

	}

	render() {
		var targetConfig = this.getTargetConfig();
		var style = targetConfig['style'];
		var title = targetConfig['title'];
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
				layout={{title: title, autosize:true}}
				style={style}
			/>
		);
	}
}

export default PiePlot;

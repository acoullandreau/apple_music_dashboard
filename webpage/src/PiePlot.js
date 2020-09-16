import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class PiePlot extends React.Component {

	getTargetConfig() {
		if (this.props.target.type === 'year') {
			return plotConfig.piePlot['pieYear'];
		} else if (this.props.target.type === 'device') {
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

// props validation
PiePlot.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
}


export default PiePlot;

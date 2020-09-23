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
		var title = targetConfig['title'];
		var colors = targetConfig['colors']

		return (
			<Plot
				data={[
					{
						values: this.props.data.values,
						labels: this.props.data.labels,
						type: 'pie',
						textinfo: "percent",
						insidetextorientation: "horizontal",
						marker: {colors: colors},
						sort:false,
					},
				]}
				layout={{title: title, autosize:true, paper_bgcolor: 'rgba(0,0,0,0)'}}
				config = {{responsive: 'true'}}
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

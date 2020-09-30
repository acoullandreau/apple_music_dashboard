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
		//var title = targetConfig['title'];
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
						marker: {colors: colors, line: {color:"#F7F7ED", width: "2"}},
						sort:false,
					},
				]}
				layout={{
					autosize:true, 
					paper_bgcolor: 'rgba(0,0,0,0)',
					margin: {l: 0, r: 0, b: "10", t: "40"},
					legend:{orientation:"h", xanchor:"center"},
					font:{size:'11'}
				}}
				style={{width:'auto', height:'60vh'}}
				config = {{
					responsive: 'true',
					toImageButtonOptions: {
						width:1200,
						height:800,
						filename: 'pie-chart-'+this.props.target.type,
					},
					modeBarButtonsToRemove: ['toggleHover'],
					displaylogo: false
				}}
			/>
		);
	}
}

					// title: title, 
// props validation
PiePlot.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
}


export default PiePlot;

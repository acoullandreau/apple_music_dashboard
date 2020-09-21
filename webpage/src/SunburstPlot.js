import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class SunburstPlot extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type, 'renderNone':false }
	}

	updatePlot(parameters) {
		var data;
		if ('data' in parameters) {
			// check is there is a match to plot
			var sunburstHasUpdate = parameters.data.rankingDict.genre?Object.keys(parameters.data.rankingDict.genre):false
			if (sunburstHasUpdate.length > 0) {
				//we expect this update to concern the data (query)
				data = parameters.data.sunburst;
				this.setState({ 'data':data });
			}
			else {
				this.setState({ 'renderNone':true });
			}
		} else {
			// it is just a new selection of the plot to render
			data = this.state.data
			this.setState({'data':data, 'type':parameters.payload.type});
		}
	}

	resetPlot() {
		var data = this.state.initialData;
		this.setState({ 'data':data, 'renderNone':false });
	}

	render() {
		var type = this.state.type;
		var targetPlot = type+'Sunburst';
		var title = plotConfig['sunburstPlot'][targetPlot]['title'];
		var data = this.state.data[type];

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
						layout={{title: title, autosize:true, paper_bgcolor: 'rgba(0,0,0,0)'}}
						style={{width:'auto', height:'100vh'}}
						config = {{responsive: 'true'}}
					/>
				</div>
			);
		}

	}
}

// props validation
SunburstPlot.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
}


export default SunburstPlot;
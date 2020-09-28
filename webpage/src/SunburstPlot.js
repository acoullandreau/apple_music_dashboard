import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';

class SunburstPlot extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type, 'renderNone':false, 'firstRender':true };
	}

	renderTabSwitch() {
		//this function is used to force a rerender of the component (to call Plotly.relayout / Plotly.react), so the svg has the right layout
		if (this.state.firstRender) {
			this.setState({'firstRender':false});
		}
	}

	getColorsArray() {
		// we may have more colors referenced than of years listed, so we get just a portion of the list of colors
		var numColors = this.props.ranking.values.length;
		var colorList = plotConfig.sunburstPlot["colors"].slice(0, numColors);

		// we make a copy of the list of colors as the sorting is done in place later on (to keep a reference of the index despite reordering)
		var colorArray = colorList.slice(0);

		// we use the total counts per year to perform the sorting
		var rankValues = this.props.ranking.values;

		colorArray.sort(function(a, b){ 
			return rankValues[colorList.indexOf(a)] - rankValues[colorList.indexOf(b)];
		});

		// we return the colorArray in reverse order (sorting is ascending, we want descending order)
		return colorArray.reverse();
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
			this.setState({'type':parameters.payload.type});
		}
	}

	resetPlot() {
		var data = this.state.initialData;
		this.setState({ 'data':data, 'renderNone':false });
	}

	render() {
		var type = this.state.type;
		var data = this.state.data[type];
		var colors = this.getColorsArray();

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
								marker: {line: {color:"#F7F7ED", width: "2"}},
							},
						]}
						layout={{
							autosize:true, 
							paper_bgcolor: 'rgba(0,0,0,0)', 
							margin: {l: 0, r: 0, b: "10", t: "40"}, 
							sunburstcolorway:colors,
						}}
						style={{width:'auto', minHeight:'90vh'}}
						config = {{
							responsive: 'true',
							toImageButtonOptions: {
								width:1200,
								height:800,
								filename: 'sunburst-'+this.props.target.type,
							},
							modeBarButtonsToRemove: ['toggleHover'],
							displaylogo: false
						}}
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
   ranking:PropTypes.object.isRequired
}


export default SunburstPlot;
import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';
import Utils from './Utils.js';

class RankingList extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type,  'numItems':this.props.target.numItems, 'firstRender':true };
	}

	renderTabSwitch() {
		//this function is used to force a rerender of the component (to call Plotly.relayout / Plotly.react), so the svg has the right layout
		if (this.state.firstRender) {
			this.setState({'firstRender':false});
		}
	}

	updatePlot(parameters) {
		var data;
		if ('data' in parameters) {
			//we expect this update to concern the data (query)
			data = parameters.data.rankingDict;
			this.setState({ 'data':data });
		} else {
			// it is just a new selection of the plot to render
			data = this.state.data
			this.setState({'data':data, 'type':parameters.payload.type, 'numItems': parameters.payload.numItems});
		}
	}

	resetPlot() {
		var data = this.state.initialData;
		this.setState({ data });
	}

	getPlotContent() {
		var topRanked = this.getTopRank();
		var targetData = this.getTargetData(topRanked);
		var traces = [];
		var colors = plotConfig.barPlot["colors"];
		var k = 0;

		for (var year in targetData) {
			var labels = Object.keys(targetData[year]);
			var values = Object.values(targetData[year]);
			var trace = {
				x: values,
				y: labels,
				name: year,
				type: 'bar',
				orientation:'h',
				marker:{color:colors[k]}
			}
			traces.push(trace)
			k++;
		}
		return traces;
	}

	getTargetData(topRanked) {
		var data = this.state.data[this.state.type];
		var targetDataDict = {};

		for (var year in data) {
			targetDataDict[year] = {};
			for (var item in topRanked) {
				var rankedItem = topRanked[item];
				var rankedCount = data[year]['counts'][rankedItem];
				targetDataDict[year][rankedItem] = rankedCount;
			}
		}

		return targetDataDict;
	}

	getTopRank() {
		var numItems = this.state.numItems;
		var targetData = this.state.data[this.state.type];
		var topRankedDict = {};

		for (var year in targetData) {
			for (var key in targetData[year]['counts']) {
				if (key in topRankedDict === false) {
					topRankedDict[key] = targetData[year]['counts'][key];
				} else {
					topRankedDict[key] += targetData[year]['counts'][key];
				}
			}
		}

		var topRanked = Utils.sortDictKeys(topRankedDict).slice(0, numItems);

		return topRanked;
	}

	render() {
		var data = this.getPlotContent();

		return (
			<div>
				<Plot
					data={data}
					layout={{
						title: '', 
						barmode: 'stack', 
						paper_bgcolor: 'rgba(0,0,0,0)', 
						plot_bgcolor: 'rgba(0,0,0,0)',
						margin:{r:0, t:"40"},
						legend:{traceorder:"normal", orientation:"h"},
						yaxis: {categoryorder: "total ascending", automargin: true}
					}}
					style={{width:'100%', minHeight:'65vh'}}
					config = {{
						responsive: 'true',
						toImageButtonOptions: {
							width:1200,
							height:800,
							filename: 'bar-chart-favourite-'+this.props.target.type,
						},
						modeBarButtonsToRemove: [
							'hoverClosestCartesian', 
							'hoverCompareCartesian', 
							'zoom2d',
							'lasso2d', 
							'zoomIn2d', 
							'zoomOut2d', 
							'autoScale2d',
							'toggleHover',
							'toggleSpikelines'
						],
						displaylogo: false
					}}
				/>
			</div>
		);
	}

}

// props validation
RankingList.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
}


export default RankingList;
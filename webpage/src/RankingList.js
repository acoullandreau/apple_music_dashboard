import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';
import Utils from './Utils.js';

class RankingList extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type,  'numItems':this.props.target.numItems }
	}

	updatePlot(parameters) {
		if ('data' in parameters) {
			//we expect this update to concern the data (query)
			var data = parameters.data.rankingDict;
			this.setState({ 'data':data });
		} else {
			// it is just a new selection of the plot to render
			var data = this.state.data
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

		for (var year in targetData) {
			var labels = Object.keys(targetData[year]);
			var values = Object.values(targetData[year]);
			var trace = {
				x: values,
				y: labels,
				name: year,
				type: 'bar',
				orientation:'h'
			}
			traces.push(trace)
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

	renderPlot() {
		var data = this.getPlotContent();
		// var title = plotConfig.barPlot[targetDataName]['title'];
		// var barmode = plotConfig.barPlot[targetDataName]['barmode'];
		// var xaxis = plotConfig.barPlot[targetDataName]['xaxis'];
		// var yaxis = plotConfig.barPlot[targetDataName]['yaxis'];
		// var style = plotConfig.barPlot[targetDataName]['style'];

		var listPlot = (
			<Plot
			  data={data}
			  layout={{title: '', barmode: 'stack', autosize:true}}
			/>
		)

			  // style={style}
		return listPlot;
	}


	render() {
		return (
			<div>
				<div>{this.renderPlot()}</div>
			</div>
		);
	}

}

export default RankingList;
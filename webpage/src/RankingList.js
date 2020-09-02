import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';
import Utils from './Utils.js';

class RankingList extends React.Component {

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
		var type = this.props.target.type;
		var targetDataDict = {};

		for (var year in this.props.data[type]) {
			targetDataDict[year] = {};
			for (var item in topRanked) {
				var rankedItem = topRanked[item];
				var rankedCount = this.props.data[type][year]['counts'][rankedItem];
				targetDataDict[year][rankedItem] = rankedCount;
			}
		}

		return targetDataDict;
	}

	getTopRank() {
		var type = this.props.target.type;
		var numItems = this.props.target.numItems;
		var targetData = this.props.data[type];
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
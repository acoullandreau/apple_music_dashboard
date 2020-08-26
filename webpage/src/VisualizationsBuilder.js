import React from 'react';
import connectorInstance from './IndexedDBConnector.js';


class VisualizationsBuilder {

	static preparePlots() {
		var plotPromises = [];

		var playPlotsPromise = new Promise((resolve, reject) => {
			var playPlotDetails = {};
			connectorInstance.readObjectFromDB('visualizationFile').then(result => {
				console.log(result)
				//prepare year pie plot
				this.buildPiePlot('year', result, playPlotDetails);
				resolve(playPlotDetails);
			});
		})
		plotPromises.push(playPlotsPromise);

		var devicePlotPromise = new Promise((resolve, reject) => {
			var devicePlotDetails = {};
			connectorInstance.readObjectFromDB('libraryActivityFile').then(result => {
				//prepare device pie plot
				this.buildPiePlot('device', result, devicePlotDetails);
				resolve(devicePlotDetails);
			});
		})
		plotPromises.push(devicePlotPromise);

		Promise.all(plotPromises).then(result => {
			console.log(result)
		})

	}

	static buildSkippedSongsHist() {
		// var data = [
		//   {
		//     x: ['giraffes', 'orangutans', 'monkeys'],
		//     y: [20, 14, 23],
		//     type: 'bar'
		//   }
		// ];
		// Plotly.newPlot('myDiv', data);
	}

	static buildPiePlot(type, data, plotDetails) {
		var plotParameters = {};
		var pieType;
		var title;
		var targetColumn;

		if (type === 'year') {
			pieType = 'pieYear';
			title = 'Which was your most active year?';
			targetColumn = 'Play Year';
		} else if (type === 'device') {
			pieType = 'pieDevice';
			title = 'What device do you listen to music on?';
			targetColumn = 'Transaction Agent Model'
		}

		plotDetails[pieType] = {};
		plotDetails[pieType]['title'] = title;
		for (var row in data) {
			if (data[row][targetColumn] in plotParameters === false && data[row][targetColumn] !== "") {
				plotParameters[data[row][targetColumn]] = 0;
			}
			if (data[row][targetColumn] in plotParameters) {
				plotParameters[data[row][targetColumn]]++;
			}
		}
		plotDetails[pieType]['values'] = Object.values(plotParameters);
		plotDetails[pieType]['labels'] = Object.keys(plotParameters);



	}

}

export default VisualizationsBuilder;
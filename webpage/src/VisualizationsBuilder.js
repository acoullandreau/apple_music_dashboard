import React from 'react';
import connectorInstance from './IndexedDBConnector.js';
import Utils from './Utils.js';

class VisualizationsBuilder {

	static preparePlots() {
		var plotPromises = [];
		var plotDetails = {};

		return new Promise((resolve, reject) => {
			var playPlotsPromise = new Promise((resolve, reject) => {
				var playPlotDetails = {};
				connectorInstance.readObjectFromDB('visualizationFile').then(result => {
					//prepare year pie plot
					this.buildPiePlot('year', result, playPlotDetails);
					//prepare bar plots
					this.buildBarPlot(result, playPlotDetails);


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
				for (var elem in result) {
					for (var key in result[elem]) {
						plotDetails[key] = result[elem][key]
					}
				}
				resolve(plotDetails);
			})
		})

	}

	static buildBarPlot(data, plotDetails) {
		var plotParameters = {};

		// we compute the count of song for each year and each time division (month, DOM, DOW, HOD) and the skipped ratio
		for (var row in data) {
			var year = data[row]['Play Year'];
			var month = data[row]['Play Month'];
			var dom = data[row]['Play DOM'];
			var dow = data[row]['Play DOW'];
			var hod = data[row]['Play HOD'];
			var partial = data[row]['Played completely'];
			if (year in plotParameters === false) {
				plotParameters[year] = { 
					'totalEntryCount':0,
					'MonthCount':{'0':0, '1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0, '10':0, '11':0 }, 
					'DOMCount':{'1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0, '10':0, '11':0, '12':0, '13':0, '14':0, '15':0, '16':0, '17':0, '18':0, '19':0, '20':0, '21':0, '22':0, '23':0, '24':0, '25':0, '26':0, '27':0, '28':0, '29':0, '30':0, '31':0 }, 
					'DOWCount':{ '0':0, '1':0, '2':0, '3':0, '4':0, '5':0, '6':0 },
					'HODCount':{ '0':0, '1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0, '10':0, '11':0, '12':0, '13':0, '14':0, '15':0, '16':0, '17':0, '18':0, '19':0, '20':0, '21':0, '22':0, '23':0 },
					'SkippedRatioCount': { 'partial':0, 'complete':0 }
				};
			}

			if (year in plotParameters) {
				plotParameters[year]['totalEntryCount']++;
				plotParameters[year]['MonthCount'][month]++;
				plotParameters[year]['DOMCount'][dom]++;
				plotParameters[year]['DOWCount'][dow]++;
				plotParameters[year]['HODCount'][hod]++;
				if (data[row]['Played completely']) {
					plotParameters[year]['SkippedRatioCount']['complete']++;
				} else {
					plotParameters[year]['SkippedRatioCount']['partial']++;
				}
			}

		}

		// we add the percentage version of each dictionary
		for (var year in plotParameters) {
			plotParameters[year]['MonthPer'] = Utils.computePercentage(plotParameters[year]['MonthCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['DOMPer'] = Utils.computePercentage(plotParameters[year]['DOMCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['DOWPer'] = Utils.computePercentage(plotParameters[year]['DOWCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['HODPer'] = Utils.computePercentage(plotParameters[year]['HODCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['SkippedRatioPer'] = Utils.computePercentage(plotParameters[year]['SkippedRatioCount'], plotParameters[year]['totalEntryCount']);
		}

		plotDetails['barMonthCount'] = {};
		plotDetails['barMonthCount']['title'] = 'Number of tracks listened to for each month of the year';

		// we add this object to plotDetails
		for (var year in plotParameters) {
			plotDetails['barMonthCount'][year] = plotParameters[year]['MonthCount'];

		}


		// barMonthCount
		// barMonthPercent
		// barDOMCount
		// barDOMPercent
		// barDOWCount
		// barDOWPercent
		// barHODCount
		// barHODPercent
		// barSkippedCount
		// barSkippedPercent




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
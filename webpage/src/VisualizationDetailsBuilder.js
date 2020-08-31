import React from 'react';
import connectorInstance from './IndexedDBConnector.js';
import Utils from './Utils.js';
import plotConfig from './plotConfig.json';

class VisualizationDetailsBuilder {

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
					// prepare 2D histogram
					this.build2DHistPlot(result, playPlotDetails)
					// build ranking dict
					this.buildRankingDict(result, playPlotDetails)
					//prepare sunburst
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

	static buildRankingDict(data, plotDetails) {
		var plotParameters = {};
		for (var row in data) {
			var year = data[row]['Play Year'];
			var genres = data[row]['Genre'];
			var artist = data[row]['Artist'];
			var title = data[row]['Title'];
			var origin = data[row]['Track origin'];

			if (year in plotParameters === false) {
				plotParameters[year] = { 
					'genre':{},
					'artist':{},
					'title':{},
					'origin':{}
				};
			}

			if (year in plotParameters) {
				this.processGenreCount(genres, plotParameters[year]['genre']);
				Utils.populateCountDict(artist, plotParameters[year]['artist']);
				Utils.populateCountDict(title, plotParameters[year]['title']);
				Utils.populateCountDict(origin, plotParameters[year]['origin']);
			}
		}


		plotDetails['rankingDict'] = {};

		// we populate plotDetails with the details of each bar plot
		plotDetails['rankingDict']['genre'] = {};
		plotDetails['rankingDict']['artist'] = {};
		plotDetails['rankingDict']['title'] = {};
		plotDetails['rankingDict']['origin'] = {};
		for (var year in plotParameters) {
			plotDetails['rankingDict']['genre'][year] = plotParameters[year]['genre'];
			plotDetails['rankingDict']['artist'][year] = plotParameters[year]['artist'];
			plotDetails['rankingDict']['title'][year] = plotParameters[year]['title'];
			plotDetails['rankingDict']['origin'][year] = plotParameters[year]['origin'];
		}

	}


	static processGenreCount(genres, parametersDict) {
		if (genres.includes('&&')) {
            var genresList = genres.split('&&');
            for (var i in genresList) {
            	var genre = genresList[i].trim();
            	Utils.populateCountDict(genre, parametersDict);
            }
		} else {
			var genre = genres.trim();
			Utils.populateCountDict(genre, parametersDict);
		}
	}

	static build2DHistPlot(data, plotDetails) {
		var plotParameters = {};
		var targetXDOM = 'Play Month';
		var targetXDOW = 'Play DOW';
		var targetYDOM = 'Play DOM';
		var targetYDOW = 'Play HOD';
		var targetZ = 'Play duration in minutes';

		// we compute the count of song for each year and each time division (month, DOM, DOW, HOD) and the skipped ratio
		for (var row in data) {
			var year = data[row]['Play Year'];
			var playDuration = data[row][targetZ];

			if (year in plotParameters === false) {
				plotParameters[year] = { 
					'DOM':{'x':[], 'y':[], 'z':[]},
					'DOW':{'x':[], 'y':[], 'z':[]}
				};

			}

			if (year in plotParameters) {
				plotParameters[year]['DOM']['x'].push(data[row][targetXDOM]);
				plotParameters[year]['DOW']['x'].push(data[row][targetXDOW]);
				plotParameters[year]['DOM']['y'].push(data[row][targetYDOM]);
				plotParameters[year]['DOW']['y'].push(data[row][targetYDOW]);
				plotParameters[year]['DOM']['z'].push(data[row][targetZ]);
				plotParameters[year]['DOW']['z'].push(data[row][targetZ]);
			}

		}

		plotDetails['heatMapPlot'] = {};

		// we populate plotDetails with the details of each bar plot
		this.build2DHistPlotDict(plotParameters, plotDetails);
	}


	static build2DHistPlotDict(parametersDict, plotDetails) {
		plotDetails['heatMapPlot']['heatMapDOM'] = {};
		plotDetails['heatMapPlot']['heatMapDOW'] = {};
		for (var year in parametersDict) {
			plotDetails['heatMapPlot']['heatMapDOM'][year] = parametersDict[year]['DOM'];
			plotDetails['heatMapPlot']['heatMapDOW'][year] = parametersDict[year]['DOW'];
		}

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
			plotParameters[year]['MonthPercent'] = Utils.computePercentage(plotParameters[year]['MonthCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['DOMPercent'] = Utils.computePercentage(plotParameters[year]['DOMCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['DOWPercent'] = Utils.computePercentage(plotParameters[year]['DOWCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['HODPercent'] = Utils.computePercentage(plotParameters[year]['HODCount'], plotParameters[year]['totalEntryCount']);
			plotParameters[year]['SkippedRatioPercent'] = Utils.computePercentage(plotParameters[year]['SkippedRatioCount'], plotParameters[year]['totalEntryCount']);
		}

		plotDetails['barPlot'] = {};
		// we populate plotDetails with the details of each bar plot
		this.buildBarPlotDict(plotParameters, plotDetails);


	}

	static buildBarPlotDict(parametersDict, plotDetails) {
		for (var plot in plotConfig.barPlot) {
			plotDetails['barPlot'][plot] = {};
			var plotType = plot.replace("bar", "");
			for (var year in parametersDict) {
				plotDetails['barPlot'][plot][year] = parametersDict[year][plotType];
			}
		}

	}

	static buildPiePlot(type, data, plotDetails) {
		var plotParameters = {};
		var pieType;
		var title;
		var targetColumn;

		if (type === 'year') {
			pieType = 'pieYear';
			targetColumn = 'Play Year';
		} else if (type === 'device') {
			pieType = 'pieDevice';
			targetColumn = 'Transaction Agent Model'
		}

		plotDetails[pieType] = {};
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

export default VisualizationDetailsBuilder;

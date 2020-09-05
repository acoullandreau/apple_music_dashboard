import VisualizationDetailsBuilder from './VisualizationDetailsBuilder.js';
import connectorInstance from './IndexedDBConnector.js';

class QueryEngine  {

    static getFilteredFile(queryDict) {
        var matchColumnName = {
            'artist': 'Artist', 
            'genre': 'Genres', 
            'inlib': 'Library Track', 
            'offline': 'Offline', 
            'origin': 'Track origin', 
            'rating': 'Rating', 
            'skipped': 'Played completely', 
            'title': 'Title', 
            'year': 'Play Year' 
        }
        return new Promise((resolve, reject) => {
            connectorInstance.readObjectFromDB('visualizationFile').then(result => {
                var filteredFile = Object.assign([], result)
                for (var row in filteredFile) {
                    for (var item in queryDict) {
                        var targetColumn = matchColumnName[item]
                        if (Array.isArray(queryDict[item])) {
                            // the query is on the union of several values for one column
                            if (!queryDict[item].includes(filteredFile[row][targetColumn])) {
                                delete filteredFile[row];
                                break;
                            }
                        } else {
                            // the query is on a single value per column, so exclusive value
                            if (filteredFile[row][targetColumn] !== queryDict[item]) {
                                delete filteredFile[row];
                                break;
                            }
                        }
                    }
                }
                resolve(filteredFile);
            })
        })
    }

    static queryPlots(queryParams) {
        var target = queryParams.target.type;
        var queryDict = queryParams.data;

        // we keep only the parameters that actually filter something
        for (var key in queryDict) {
            if (queryDict[key] === '') {
                delete queryDict[key];
            }
        }
        return this.getFilteredFile(queryDict).then(result => {
            var playPlotDetails = {};
            var p;

            if (target === 'heatMap') {
                p = new Promise((resolve, reject) => {
                    VisualizationDetailsBuilder.build2DHistPlot(result, playPlotDetails);
                    resolve(playPlotDetails)
                })
            } else if (target === 'sunburst') {
                p = new Promise((resolve, reject) => {
                    //to build the queried sunburst we first need to recompute the count dicts
                    VisualizationDetailsBuilder.buildRankingDict(result, playPlotDetails);
                    VisualizationDetailsBuilder.buildSunburst(result, playPlotDetails);
                    resolve(playPlotDetails)
                })
            }
            return p;
        })

    }



}


export default QueryEngine;
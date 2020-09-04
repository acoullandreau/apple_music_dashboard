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
        connectorInstance.readObjectFromDB('visualizationFile').then(result => {
            var filteredFile = Object.assign([], result)
            console.log(filteredFile.length)
            var vals = []
            var totalCount = 0;
            var titleEmpty = 0;
            var artistEmpty = 0;
            for (var row in filteredFile) {
                if (filteredFile[row]['Rating'] === '') {
                    totalCount++;
                    if (filteredFile[row]['Title'] === '') {
                        titleEmpty++;
                    }
                    if (filteredFile[row]['Artist'] === '') {
                        artistEmpty++;
                    }
                }
                if (!vals.includes(filteredFile[row]['Rating'])) {
                    vals.push(filteredFile[row]['Rating'])
                }
                // for (var item in queryDict) {
                //     var targetColumn = matchColumnName[item]
                //     if (filteredFile[row][targetColumn] !== queryDict[item]) {
                //         console.log(filteredFile[row][targetColumn], queryDict[item])
                //         delete filteredFile[row]
                //     }
                // }
            }
            console.log(totalCount, titleEmpty, artistEmpty)
            console.log(filteredFile.length)
        })
    }

    static queryPlots(queryParams) {
        var target = queryParams.target;
        var queryDict = queryParams.data;

        // we keep only the parameters that actually filter something
        for (var key in queryDict) {
            if (queryDict[key] === '') {
                delete queryDict[key];
            }
        }
        var filteredFile = this.getFilteredFile(queryDict);
    }



}


export default QueryEngine;
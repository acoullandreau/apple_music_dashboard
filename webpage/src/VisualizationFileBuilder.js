import Utils from './Utils.js';

class VisualizationFileBuilder {

	static buildIndexTrackDict(trackInstanceDict) {
		// the visualization file will be based on the Play Activity File
		// we build a dict that matches, for each row number of the Play Activity File, some of the
		// properties of the track instance we want to add to the Play Activity File to build the visualization file
		var matchIndexInstanceDict = {};
		for (var titleArtist in trackInstanceDict) {
			var trackInstance = trackInstanceDict[titleArtist];
			for (var i in trackInstance.appearances) {
				var appearance = trackInstance.appearances[i];
				if (appearance['source'] === 'play_activity') {
					if (appearance['df_index'] in matchIndexInstanceDict === false) {
						matchIndexInstanceDict[appearance['df_index']] = [];
					}
					if (trackInstance in matchIndexInstanceDict[appearance['df_index']] === false) {
						matchIndexInstanceDict[appearance['df_index']].push(trackInstance);
						matchIndexInstanceDict[appearance['df_index']].push(trackInstance.isInLib);
						matchIndexInstanceDict[appearance['df_index']].push(trackInstance.rating);
						matchIndexInstanceDict[appearance['df_index']].push(trackInstance.genres);
					}
				}
			}
		}
		return matchIndexInstanceDict;
	}

	static buildVisualizationFile(matchIndexInstanceDict, playActivityFile) {
		var visualizationFile = Object.assign([], playActivityFile);
		for (var elem in visualizationFile) {
			var index = elem;
			var row = visualizationFile[elem];
			if (row['Title'] !== '') {
				if (matchIndexInstanceDict[index]) {
					row['Track Instance'] = matchIndexInstanceDict[index][0];
					row['Library Track'] = matchIndexInstanceDict[index][1];
					row['Rating'] = Utils.cleanListValues(matchIndexInstanceDict[index][2]);
					row['Genre'] = Utils.cleanListValues(matchIndexInstanceDict[index][3]);
				} else {
					row['Track Instance'] = '';
					row['Library Track'] = '';
					row['Rating'] = '';
					row['Genre'] = '';
				}
			} else {
				// we remove the rows with an empty Title
				delete visualizationFile[elem];
			}
		}

		return visualizationFile;
	}

}


export default VisualizationFileBuilder;
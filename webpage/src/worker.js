/* eslint-disable no-restricted-globals */

import jsZip from 'jszip';
import FileParser from './FileParser.js';
import FileProcessor from './FileProcessor.js';
import VisualizationFileBuilder from './VisualizationFileBuilder.js';
import VisualizationDetailsBuilder from './VisualizationDetailsBuilder.js';
import connectorInstance from './IndexedDBConnector.js';
import QueryEngine from './QueryEngine.js';

var filesInArchive = {
    'identifier_infos' : 'Apple_Media_Services/Apple Music Activity/Identifier Information.json.zip',
    'library_tracks' : 'Apple_Media_Services/Apple Music Activity/Apple Music Library Tracks.json.zip',
    'library_activity': 'Apple_Media_Services/Apple Music Activity/Apple Music Library Activity.json.zip',
    'likes_dislikes' : 'Apple_Media_Services/Apple Music Activity/Apple Music Likes and Dislikes.csv',
    'play_activity': 'Apple_Media_Services/Apple Music Activity/Apple Music Play Activity.csv'
}

var validateArchiveContent = (input) => {

	// we load the zip archive, and validate that it contains the files we expect
	var archive = input[0];
	var archiveContentPromise = 
		jsZip.loadAsync(archive).then(zip => {
			var filesToParse = {}
			//validate that we have the five files we want using the file names
			for (var key in filesInArchive) {
				//if we have the file, we add it to a filesToParse dict with the ref to the file
				if (Object.keys(zip.files).includes(filesInArchive[key])) {
					filesToParse[key] = zip.file(filesInArchive[key]);
				} 
			}
			//we return the dict, whether it is empty or filled with the files we read
			return filesToParse;
		})

	return archiveContentPromise;
}

var prepareFiles = (archive) => {
	// validate the archive
	validateArchiveContent(archive).then(result => {
		if (Object.keys(result).length === Object.keys(filesInArchive).length) {
			// the archive's format is correct, we return the files promise
			postMessage({'type':'archiveValidated', 'payload':''});
			return result
		} else {
			// the archive's format is incorrect, we pass an error message to display to the user
			var errorMessage = 'Please refer to the documentation to see what files are expected in the zip provided. '
			return new Promise((resolve, reject) => {reject({'type':'archiveRejected', 'payload':errorMessage})});
		}
	})
	.then(result => {
		// extract files
		return FileParser.getFilesToParse(result);
	})
	.then(result => {
		// parse files 
		return FileParser.parseFiles(result);
	})
	.then(result => {
		// save parsed files to indexedDB
		connectorInstance.addObjectsToDB(result);
		// we inform the app that the files were parsed, the archive object can be removed from localStorage
		postMessage({'type':'filesParsed', 'payload':''});

		// process them
		return FileProcessor.processFiles(result);
	})
	.then(result => {
		connectorInstance.addObjectToDB(result, 'processOutput');
		var matchIndexInstanceDict = VisualizationFileBuilder.buildIndexTrackDict(result['trackInstanceDict']);
		var playActivityFilePromise = connectorInstance.readObjectFromDB('playActivityFile');
		playActivityFilePromise.then(result => {
			var visualizationFile = VisualizationFileBuilder.buildVisualizationFile(matchIndexInstanceDict, result);
			connectorInstance.addObjectToDB(visualizationFile, 'visualizationFile');
			postMessage({'type':'visualizationFileReady', 'payload':''});
		})
	})
	.catch(error => {
		postMessage(error);
	})
}




// worker's event listener
self.addEventListener('message', function(e) {
	if (!e) return;

	if (e.data['type'] === 'filePreparation') {
		var archive = e.data['payload'];
		prepareFiles(archive);
	} else if (e.data['type'] === 'visualization') {
		var plotsDetails = VisualizationDetailsBuilder.prepareAllPlots();
		plotsDetails.then(result => {
			connectorInstance.addObjectToDB(result, 'plotDetails');
			postMessage({'type':'visualizationsReady', 'payload':result});
		})
	} else if (e.data['type'] === 'query') {
		console.log(e.data['payload'])
		QueryEngine.queryPlots(e.data['payload']).then(result => {
            console.log(result)
        })
		// payload contains target plot to recompute + filters dict
		// filter the visualization file
		// run VisualizationDetailsBuilder for target plot with the filtered file
	}

})
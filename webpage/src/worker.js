/* eslint-disable no-restricted-globals */

import jsZip from 'jszip';
import FileParser from './FileParser.js';
import FileProcessor from './FileProcessor.js';
import connectorInstance from './IndexedDBConnector.js';


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
			//everything is fine, we have all files, so we can go on with parsing
			return filesToParse;
		})

	return archiveContentPromise;
}


// worker's event listener
self.addEventListener('message', function(e) {
	if (!e) return;

	if (e.data['type'] === 'archive') {
		var archive = e.data['payload'];
		// validate the archive
		validateArchiveContent(archive).then(result => {
			if (Object.keys(result).length === Object.keys(filesInArchive).length) {
				// we store the archive
				postMessage({'type':'archiveValidated', 'payload':''});
				return result
			} else {
				// the archive's format is incorrect, we pass an error message to display to the user
				var errorMessage = 'Please refer to the documentation to see what files are expected in the zip provided. '
				postMessage({'type':'archiveRejected', 'payload':errorMessage});
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
			// build file for visualizations
			//result is an object with track instances, list of genres and artists....
			//console.log(result)
		})

		// save file to indexedDB
	}

})
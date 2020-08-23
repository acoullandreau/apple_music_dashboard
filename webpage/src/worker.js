/* eslint-disable no-restricted-globals */

import jsZip from 'jszip';
import FileParser from './FileParser.js';
import FileProcessor from './FileProcessor.js';
import connectorInstance from './IndexedDBConnector.js';


var validateArchiveContent = (input) => {
	var filesInArchive = {
        'identifier_infos' : 'Apple_Media_Services/Apple Music Activity/Identifier Information.json.zip',
        'library_tracks' : 'Apple_Media_Services/Apple Music Activity/Apple Music Library Tracks.json.zip',
        'library_activity': 'Apple_Media_Services/Apple Music Activity/Apple Music Library Activity.json.zip',
        'likes_dislikes' : 'Apple_Media_Services/Apple Music Activity/Apple Music Likes and Dislikes.csv',
        'play_activity': 'Apple_Media_Services/Apple Music Activity/Apple Music Play Activity.csv'
    }

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
			
			// if (Object.keys(result).length === Object.keys(filesInArchive).length) {
			// 	// we store the archive
			// 	this.storeArchive(archive);
			// 	// we pass back to the App the dict containing the files to parse
			// 	return result
			// } else {
			// 	var errorMessage = 'Please refer to the documentation to see what files are expected in the zip provided. '
			// 	this.setState({'errorMessage': errorMessage });
			// }
		})
		// extract files

		// parse files 


		// process files 


		// build file for visualizations


		// save file to indexedDB
	}

	// we validate that the archive contains the target files we need
	// this.validateArchiveContent(archive).then(result => {
	// 	if (Object.keys(result).length === Object.keys(this.filesInArchive).length) {
	// 		// we store the archive
	// 		this.storeArchive(archive);
	// 		// we pass back to the App the dict containing the files to parse
			//return result
	// 	} else {
	// 		var errorMessage = 'Please refer to the documentation to see what files are expected in the zip provided. '
	// 		this.setState({'errorMessage': errorMessage });
	// 	}
	// })


	// // we open the archive, parse and process the fles, and save them to the DB
	// var filesToParsePromise = FileParser.getFilesToParse(targetFiles);
	// filesToParsePromise.then(result => {
	// 	var parsedFiles = FileParser.parseFiles(result);
	// 	return parsedFiles;
	// })
	// .then(result => {
	// 	// we save the parsed files to indexedDB
	// 	connectorInstance.addObjectToDB(result);
	// 	// we remove the archive from the local storage
	// 	localStorage.removeItem('archive');

	// 	// we process the files
	// 	var processedFiles = FileProcessor.processFiles(result);
	// 	return processedFiles;
	// })
	// .then(result => {
	// 	postMessage(result);
	// 	//console.log(result)
	// })


})
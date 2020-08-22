
import FileParser from './FileParser.js';
/* eslint-disable no-restricted-globals */

import FileProcessor from './FileProcessor.js';
import connectorInstance from './IndexedDBConnector.js';


// definition of worker
export default () => {

	self.addEventListener('message', e => {
		if (!e) return;

		if (e.data['type'] === 'archive') {
			// validate the archive

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
}
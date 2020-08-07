import jsZip from 'jszip';
import Utils from './Utils.js';

class FileParser {

	static getFilesToParse(filesToParse) {
		// this function extracts specifically the json files that are added to the archives as zip files (nested zip)
		var getFilesPromise = new Promise((resolve, reject) => {
			var extractedFilesPromises = [];
			var extractedFilesToParse = {};
			for (var key in filesToParse) {
				if (filesToParse[key].name.includes('zip')) {
					var extractedNestedFile = this.extractNestedZipFile(filesToParse[key])
					extractedFilesPromises.push(extractedNestedFile);
				} else {
					var fileName = Utils.parseFileName(filesToParse[key].name)
					extractedFilesToParse[fileName] = filesToParse[key];
				}
			} 

			var nestedFilesPromise = new Promise((resolve, reject) => {
				Promise.all(extractedFilesPromises).then((result) => {
					var extractedNestedFiles = {}
					for (var elem in result) {
						var fileName = Utils.parseFileName(Object.keys(result[elem])[0])
						var file = result[elem][Object.keys(result[elem])[0]]
						extractedNestedFiles[fileName] = file
					}
					resolve(extractedNestedFiles);
				})
			})

			nestedFilesPromise.then(result => {
				for (var key in result) {
					extractedFilesToParse[key] = result[key];
				}
				resolve(extractedFilesToParse)
			})
		})
		return getFilesPromise;
	}

	static extractNestedZipFile(archive) {
		var nestedZip = new Promise((resolve, reject) => { 
			var extractedNestedFile = archive.async("blob")
			.then(jsZip.loadAsync)
			.then(function (zip) {
				resolve(zip.files);
			})
		})
		return nestedZip;
	}

	static parseFiles(files) {
		for (var key in files) {
			var fileName = files[key].name
			if (fileName.includes('json')) {
				//files[key].async("text")
				console.log(files[key].async("text"))
			} else if (fileName.includes('csv')) {
				//files[key].async("blob")
				//papaparse(blob)
			}
		}
	}

}

export default FileParser;
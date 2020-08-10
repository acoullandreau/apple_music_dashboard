import jsZip from 'jszip';
import Papa from 'papaparse';
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
					var filePromise = this.readFile(filesToParse[key]);
					extractedFilesToParse[fileName] = filePromise;
				}
			} 

			var nestedFilesPromise = new Promise((resolve, reject) => {
				Promise.all(extractedFilesPromises).then((result) => {
					var extractedNestedFiles = {}
					for (var elem in result) {
						var fileName = Utils.parseFileName(Object.keys(result[elem])[0])
						var filePromise = this.readFile(result[elem][Object.keys(result[elem])[0]]);
						extractedNestedFiles[fileName] = filePromise
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

	static readFile(file) {
		return new Promise((resolve, reject) => {
			if (file.name.includes('json')) {
				resolve(file.async("text"));
			} else if (file.name.includes('csv')) {
				// Papaparse expects a File object
				var fileRead = file.async("blob");
				// A File object is almost like a blob, with name and lastModifiedDate properties added
				fileRead.lastModifiedDate = new Date();
				fileRead.name = file.name;
				resolve(fileRead);
			}
		})
	}

	static parseFiles(files) {
		var papaConfig = { 
			delimiter: ",",
			header: true, 
		}  

		for (var key in files) {
			if (key === 'apple_music_library_activity') {
				files[key].then(result => {
					var libraryActivityFile = JSON.parse(result);
					this.parseLibraryActivity(libraryActivityFile);
					// store read file to local storage
				})
			} else if (key === 'apple_music_library_tracks') {
				files[key].then(result => {
					var libraryTracksFile = JSON.parse(result);
					// store read file to local storage
				})
			} else if (key === 'apple_music_likes_and_dislikes') {
				files[key].then(result => {
					new Promise((resolve, reject) => {
						// papaConfig contains "complete" callback function to execute when parsing is done
						papaConfig['complete'] = (results, file) => {
							// parse file
							var likesDislikesFile = FileParser.parseLikesDislikes(results.data)
							resolve(likesDislikesFile);
						}
						Papa.parse(result, papaConfig);
					})
					.then(result => {
						//store in localStorage
						//add to another structure for processing?
						//console.log(result)
					})

				})
			} else if (key === 'apple_music_play_activity') {
				files[key].then(result => {
					new Promise((resolve, reject) => {
						// papaConfig contains "complete" callback function to execute when parsing is done
						papaConfig['complete'] = (results, file) => {
							// parse file
							var playActivityFile = FileParser.parsePlayActivity(results.data)
							resolve(playActivityFile);
						}
						papaConfig['transformHeader'] = (header) => {
							if (header === 'Artist Name') {
								return 'Artist';
							} else if (header === 'Content Name') {
								return 'Title';
							} 
							return header;
						}
						Papa.parse(result, papaConfig);
					})
					.then(result => {
						console.log(result)
						//store in localStorage
						//add to another structure for processing?
						//console.log(result)
					})
				})
			} else if (key === 'identifier_information') {
				files[key].then(result => {
					var identifierInfosFile = JSON.parse(result);
					// store read file to local storage
				})
			}
		}

		//console.log(parsedFilesPromises)
	}

	static parsePlayActivity(playActivityFile) {
		// Add a datetime column from 'Transaction Date' with conversion to local time
		
		// Add year, month, day, hod, dow columns from datetime column 
		// Remove rows with year before 2015
		// Add partial listening column
		// Add track origin column
		// Add play duration column
		// Remove 99th percentile outliers of play duration
		// store read file to local storage


		return playActivityFile;
	}

	static parseLikesDislikes(likesDislikesFile) {
		for (var entry in likesDislikesFile) {
			var title = likesDislikesFile[entry]['Item Description'].split('-')[1];
			var artist = likesDislikesFile[entry]['Item Description'].split('-')[0];
			if (typeof(title) === 'undefined') {
				title = ''
			}
			if (typeof(artist) === 'undefined') {
				artist = ''
			}
			likesDislikesFile[entry]['Title'] = title.trim();
			likesDislikesFile[entry]['Artist'] = artist.trim();
		}
		return likesDislikesFile;
	}

	static parseLibraryActivity(libraryActivityFile) {
		//console.log(libraryActivityFile)
		// Add a datetime column from 'Transaction Date'
		// Add year, month, day, hod, dow columns from datetime column
		// Add UserAgent column and Transaction Agent Model
	}


}

export default FileParser;
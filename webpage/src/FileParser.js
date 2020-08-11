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
						//console.log(result)
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
		for (var row in playActivityFile) {
			// add time related columns, removing rows that have a date before june 2015
			if (typeof(playActivityFile[row]['Event Start Timestamp']) !== 'undefined') {
				playActivityFile[row]['Activity date time'] = playActivityFile[row]['Event Start Timestamp'];
			} else {
				playActivityFile[row]['Activity date time'] = playActivityFile[row]['Event End Timestamp'];
			}
			if (typeof(playActivityFile[row]['Activity date time']) !== 'undefined') {
				var datetimeString = playActivityFile[row]['Activity date time'];
				var utcOffset = playActivityFile[row]['UTC Offset In Seconds'];
				var datetimeObject = this.parseDateTime(datetimeString, utcOffset);
				if (datetimeObject['year'] < 2015 && datetimeObject['month'] < 6) {
					delete playActivityFile[row];
				} else {
					playActivityFile[row]['Play Year'] = datetimeObject['year'];
					playActivityFile[row]['Play Month'] = datetimeObject['month'];
					playActivityFile[row]['Play DOM'] = datetimeObject['dom'];
					playActivityFile[row]['Play DOW'] = datetimeObject['dow'];
					playActivityFile[row]['Play HOD'] = datetimeObject['hod'];
				}
			} else {
				delete playActivityFile[row];
			}

			// Add partial listening column

		}


		// 
		// Add track origin column
		// Add play duration column
		// Remove 99th percentile outliers of play duration
		// store read file to local storage


		return playActivityFile;
	}

	static parseLikesDislikes(likesDislikesFile) {
		for (var row in likesDislikesFile) {
			var title = likesDislikesFile[row]['Item Description'].split('-')[1];
			var artist = likesDislikesFile[row]['Item Description'].split('-')[0];
			if (typeof(title) === 'undefined') {
				title = ''
			}
			if (typeof(artist) === 'undefined') {
				artist = ''
			}
			likesDislikesFile[row]['Title'] = title.trim();
			likesDislikesFile[row]['Artist'] = artist.trim();
		}
		return likesDislikesFile;
	}

	static parseLibraryActivity(libraryActivityFile) {
		//console.log(libraryActivityFile)
		// Add a datetime column from 'Transaction Date'
		// Add year, month, day, hod, dow columns from datetime column
		// Add UserAgent column and Transaction Agent Model
	}

	static parseDateTime(datetimeString, utcOffset = null) {
		var dateInMs = Date.parse(datetimeString);
		if (utcOffset) {
			var utcOffsetInMs = parseInt(utcOffset) * 1000;
			var dateInLocalTimeInMs = dateInMs + utcOffsetInMs;
		}
		var dateObject = {};
		// basically, we shift the UTC time representation to match the local time
		dateInLocalTimeInMs = new Date(dateInLocalTimeInMs)
		// then we can fetch year, month,... using the getUTC[...] methods
		dateObject['year'] = dateInLocalTimeInMs.getUTCFullYear();
		dateObject['month'] = dateInLocalTimeInMs.getUTCMonth() + 1; // zero-based, so we add 1
		dateObject['dom'] = dateInLocalTimeInMs.getUTCDate();
		dateObject['dow'] = dateInLocalTimeInMs.getUTCDay();
		dateObject['hod'] = dateInLocalTimeInMs.getUTCHours();
		return dateObject;
	}


}

export default FileParser;
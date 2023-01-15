import jsZip from 'jszip';
import Papa from 'papaparse';
import Utils from './Utils.js';


class FileParser {

	static getFilesToParse(filesToParse) {
		// this function extracts specifically the json files that are added to the archives as zip files (nested zip)
		var getFilesPromise = new Promise((resolve) => {
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

			var nestedFilesPromise = new Promise((resolve) => {
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
		var nestedZip = new Promise((resolve) => { 
			archive.async("blob")
			.then(jsZip.loadAsync)
			.then(function (zip) {
				resolve(zip.files);
			})
		})
		return nestedZip;
	}

	static readFile(file) {
		return new Promise((resolve) => {
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

		// Basic logic
		// 1. We get a dict of promised as an input (files)
		// 2. We add each promise to an array of promises
		// 3. What we return is a promise that resolves with a new dict containing the parsed files
		// 4. In order to build this dict, 
		// 	a. we use Promise.all on the array of promises we create in 2
		// 	b. when they are all resolved, we can proceed to the parsing of each file
		// 	c. for each file a promise is created, and added to an array (parsedFilesPromises)
		// 	d. each promise is resolved with the parsed file, that is also added to the output dict
		// 	d. when all the promises of this array are resolved (other Promise.all), we resolve the promise we return with the dict

		var filesNames = [];
		var filesPromises = [];

		// we can easily map the objects in the array of promises passed to Promise.all, and the result, with their names
		for (var key in files) {
			filesNames.push(key);
			filesPromises.push(files[key])
		}

		return new Promise((resolve) => {
			var parsedFiles = {};
			var parsedFilesPromises = [];

			Promise.all(filesPromises).then(result => {

				for (var i=0; i<filesNames.length; i++) {
					var parsedFilePromise = this.parseEachFile(filesNames[i], result[i], parsedFiles);
					parsedFilesPromises.push(parsedFilePromise);
				
				}

				Promise.all(parsedFilesPromises).then(() => {
					resolve(parsedFiles);
				})
			})
		})

	}

	static parseEachFile = (filename, file, parsedFiles) => {
		var parsedFilePromise;

		if (filename === 'apple_music_library_activity') {
			parsedFilePromise = this.parseLibraryActivity(file, parsedFiles);

		} else if (filename === 'apple_music_library_tracks') {
			parsedFilePromise = this.parseLibraryTracks(file, parsedFiles);

		} else if (filename === 'apple_music_likes_and_dislikes') {
			parsedFilePromise = this.parseLikesDislikes(file, parsedFiles);

		} else if (filename === 'apple_music_play_activity') {
			parsedFilePromise = this.parsePlayActivity(file, parsedFiles);

		} else if (filename === 'identifier_information') {
			parsedFilePromise = this.parseIdentifierInfos(file, parsedFiles);

		}

		return parsedFilePromise;
	}


	static parseLibraryActivity(content, parsedFiles) {
		return new Promise((resolve) => {
			var libraryActivityFile = JSON.parse(content);
			libraryActivityFile = this.parseLibraryActivityContent(libraryActivityFile);
			parsedFiles['libraryActivityFile'] = libraryActivityFile;
			resolve(libraryActivityFile);
		})
	}


	static parseLibraryTracks(content, parsedFiles) {
		return new Promise((resolve) => {
			var libraryTracksFile = JSON.parse(content);
			parsedFiles['libraryTracksFile'] = libraryTracksFile;
			resolve(libraryTracksFile);
		})
	}

	static parsePlayActivity(content, parsedFiles) {
		var papaConfig = { 
			delimiter: ",",
			header: true, 
			skipEmptyLines: true,
		}

		return new Promise((resolve) => {
			let data = [];
			// papaConfig contains "complete" callback function to execute when parsing is done
			papaConfig['complete'] = () => {
				// parse file
				var playActivityFile = this.parsePlayActivityContent(data);
				parsedFiles['playActivityFile'] = playActivityFile;
				resolve(playActivityFile);
			}
			papaConfig['transformHeader'] = (header) => {
				if (header === 'Artist Name') {
					return 'Artist';
				} else if (header === 'Content Name' || header === 'Song Name') {
					return 'Title';
				} 
				return header;
			}
			papaConfig['error'] = (err, file, inputElem, reason) => {
				console.error(err, file, inputElem, reason);
			}
			// when the file is too large, Papaparser processes it chunk by chunk
			// so to be able to access the result of the parsing, we need to pass in this 'step' callback function
			// moreover, when the file is too big (tested with one of > 500Mo), storing the entire file is way too much!
			// so we extract here only the columns we need for processing down the line
			papaConfig['step'] = (results) => {
				let row = {
					'Artist':results.data['Artist'],
					'Title':results.data['Title'],
					'Play Duration Milliseconds':results.data['Play Duration Milliseconds'],
					'End Reason Type':results.data['End Reason Type'],
					'Media Duration In Milliseconds':results.data['Media Duration In Milliseconds'],
					'Event Start Timestamp':results.data['Event Start Timestamp'],
					'Event End Timestamp':results.data['Event End Timestamp'],
					'UTC Offset In Seconds':results.data['UTC Offset In Seconds'],
					'Activity date time':results.data['Activity date time'],
					'Feature Name':results.data['Feature Name'],
				};
				data.push(row);
			}
			Papa.parse(content, papaConfig);
		})

	}

	static parseLikesDislikes(content, parsedFiles) {
		var papaConfig = { 
			delimiter: ",",
			header: true, 
		}

		return new Promise((resolve) => {
			// papaConfig contains "complete" callback function to execute when parsing is done
			papaConfig['complete'] = (results) => {
				// parse file
				var likesDislikesFile = this.parseLikesDislikesContent(results.data)
				parsedFiles['likesDislikesFile'] = likesDislikesFile;
				resolve(likesDislikesFile);
			}
			Papa.parse(content, papaConfig);
		})

	}

	static parseIdentifierInfos(content, parsedFiles) {
		return new Promise((resolve) => {
			var identifierInfosFile = JSON.parse(content);
			parsedFiles['identifierInfosFile'] = identifierInfosFile;
			resolve(identifierInfosFile);
		})

	}

	static parseLikesDislikesContent(likesDislikesFile) {
		for (var row in likesDislikesFile) {
			var title = likesDislikesFile[row]['Item Description'].split(' - ')[1];
			var artist = likesDislikesFile[row]['Item Description'].split(' - ')[0];
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

	static parseLibraryActivityContent(libraryActivityFile) {
		var rowsDeleted = [];

		for (var row in libraryActivityFile) {
			var entry = libraryActivityFile[row];

			// add time related columns, removing rows that have a date before june 2015
			if (typeof(entry['Transaction Date']) !== 'undefined') {
				var datetimeString = entry['Transaction Date'];
				var datetimeObject = this.parseDateTime(datetimeString);
				if (datetimeObject['year'] < 2015 && datetimeObject['month'] < 6) {
					delete libraryActivityFile[row]
					rowsDeleted.push(entry);
					break;
				} else {
					entry['Activity Year'] = datetimeObject['year'];
					entry['Activity Month'] = datetimeObject['month'];
					entry['Activity DOM'] = datetimeObject['dom'];
					entry['Activity DOW'] = datetimeObject['dow'];
					entry['Activity HOD'] = datetimeObject['hod'];
				}
			} else {
				delete libraryActivityFile[row]
				rowsDeleted.push(entry);
				break;
			}

			// add UserAgent column and Transaction Agent Model
			var userAgent = entry['UserAgent'].split('/')[0];
			if (userAgent === 'itunescloudd') {
				entry['Transaction Agent'] = 'Mobile';
				entry['Transaction Agent Model'] = entry['UserAgent'].split('/')[3].split(',')[0];
			} else if (userAgent === 'iTunes') {
				entry['Transaction Agent'] = 'Computer';
				entry['Transaction Agent Model'] ='Computer';
			} else {
				entry['Transaction Agent'] = userAgent;
				entry['Transaction Agent Model'] ='';
			}
			
		}

		return libraryActivityFile;

	}

	static parsePlayActivityContent(playActivityFile) {

		var rowsToDelete = [];
		var playDurations = {};
		for (var row in playActivityFile) {
			var entry = playActivityFile[row];
			this.parsePlayActivityRow(entry, rowsToDelete, row, playDurations);
		}

		// Get rows above 99th percentile of play duration
		// this.getPercentileOutliers(playDurations, 0.99, rowsToDelete); 
		
		// Get rows which pay duration is more than 1h30
		this.getDurationOutliers(playDurations, 90, rowsToDelete); 

		// remove all the rows we do not want to keep for further analysis
		for (var i in rowsToDelete) {
			var rowToDelete = rowsToDelete[i]
			delete playActivityFile[rowToDelete];
		}

		return playActivityFile;
	}

	static parseDateTime(datetimeString, utcOffset = null) {
		var dateInMs = Date.parse(datetimeString);
		var dateInLocalTimeInMs;
		if (utcOffset) {
			var utcOffsetInMs;
			if (utcOffset/3600 < 12) {
				utcOffsetInMs = parseInt(utcOffset) * 1000;
			} else {
				utcOffsetInMs = parseInt(utcOffset);
			}
			dateInLocalTimeInMs = dateInMs + utcOffsetInMs;
		} else {
			dateInLocalTimeInMs = dateInMs;
		}
		var dateObject = {};
		// basically, we shift the UTC time representation to match the local time
		dateInLocalTimeInMs = new Date(dateInLocalTimeInMs)
		// then we can fetch year, month,... using the getUTC[...] methods
		dateObject['year'] = dateInLocalTimeInMs.getUTCFullYear();
		dateObject['month'] = dateInLocalTimeInMs.getUTCMonth(); // zero-based
		dateObject['dom'] = dateInLocalTimeInMs.getUTCDate();
		dateObject['dow'] = dateInLocalTimeInMs.getUTCDay(); // Sunday is 0
		dateObject['hod'] = dateInLocalTimeInMs.getUTCHours();

		return dateObject;
	}

	static parsePlayActivityRow(row, rowsToDelete, rowIndex, playDurations) {
		// add time related columns, removing rows that have a date before june 2015
		var rowParsedTime = this.addPlayActivityTimeColumns(row, rowIndex, rowsToDelete);

		if (rowParsedTime === 'complete') {
			// Convert the 'Offline' values to boolean
			row['Offline'] = (row['Offline'] === "true");
			// Add partial listening column
			this.setPartialListening(row);
			// Add track origin column
			this.getTrackOrigin(row);
			// Add play duration column
			this.computePlayDuration(row, rowIndex, playDurations);		
		} 
	}

	static addPlayActivityTimeColumns(row, rowIndex, rowsToDelete) {
		if (typeof(row['Event Start Timestamp']) !== 'undefined' && row['Event Start Timestamp'] !== "") {
			row['Activity date time'] = row['Event Start Timestamp'];
		} else {
			row['Activity date time'] = row['Event End Timestamp'];
		}
		if (typeof(row['Activity date time']) !== 'undefined') {
			var datetimeString = row['Activity date time'];
			var utcOffset = row['UTC Offset In Seconds'];
			var datetimeObject = this.parseDateTime(datetimeString, utcOffset);

			if (datetimeObject['year'] < 2015) {
				rowsToDelete.push(rowIndex);
				return 'incomplete';
			} else if (datetimeObject['year'] === 2015 && datetimeObject['month'] < 6) {
				rowsToDelete.push(rowIndex);
				return 'incomplete';
			} else {
				row['Play Year'] = datetimeObject['year'];
				row['Play Month'] = datetimeObject['month'];
				row['Play DOM'] = datetimeObject['dom'];
				row['Play DOW'] = datetimeObject['dow'];
				row['Play HOD'] = datetimeObject['hod'];
			}

		} else {
			rowsToDelete.push(rowIndex);
			return 'incomplete';
		}
		return 'complete';
	}

	static setPartialListening(row) {
		if (row['End Reason Type'] === 'NATURAL_END_OF_TRACK' || row['Play Duration Milliseconds']>=row['Media Duration In Milliseconds']) {
			row['Played completely'] = true;
		} else {
			row['Played completely'] = false;
		}
	}

	static getTrackOrigin(row) {
		var trackOrigin = row['Feature Name'].split('/')[0].trim()
		switch (trackOrigin) {
			case 'search' || 'browse':
				row['Track origin'] = 'search';
				break;
			case 'library' || 'my-music' || 'playlists' || 'playlist_detail':
				row['Track origin'] = 'library';
				break;
			case 'for_you':
				if (row['Feature Name'].split('/').length > 1) {
					switch (row['Feature Name'].split('/')[1].trim()) {
						case 'recently_played':
							row['Track origin'] = 'for you - recently played';
							break;
						case 'personalized_mix':
							row['Track origin'] = 'for you - personalized mix';
							break;
						default:
							row['Track origin'] = 'for you - other';
					}
				} else {
					row['Track origin'] = 'for you - other';
				}
				break;
			default:
				row['Track origin'] = 'other';
		}
	}

	static computePlayDuration(row, rowIndex, playDurations) {
		var startTime = new Date(row['Event Start Timestamp']);
		var endTime = new Date(row['Event End Timestamp']);

		if (row['Played completely'] === false && row['Play Duration Milliseconds']>0) {
			row['Play duration in minutes'] = row['Play Duration Milliseconds']/60000;
		} else if (startTime.getUTCDate() === endTime.getUTCDate()) {
			row['Play duration in minutes'] = ((endTime - startTime)/1000)/60; //convert from ms to s, then to min
		} else {
			row['Play duration in minutes'] = parseInt(row['Media Duration In Milliseconds'])/60000;
		}

		playDurations[rowIndex] = row['Play duration in minutes'];
	}

	static getPercentileOutliers(playDurationsDict, percentile, rowsToDelete) {
		var playDurations = Object.values(playDurationsDict);
		playDurations.sort(function(a, b) {
			return a - b;
		});

		var len =  playDurations.length;
		var indexPercentile = Math.floor(len*percentile) - 1;
		

		for (var rowIndex in Object.keys(playDurationsDict)) {
			if (playDurationsDict[rowIndex] > playDurations[indexPercentile]) {
				rowsToDelete.push(rowIndex);
			}
		}

	} 
 
	static getDurationOutliers(playDurationsDict, maxDuration, rowsToDelete) {
		
		for (var rowIndex in Object.keys(playDurationsDict)) {
			if (playDurationsDict[rowIndex] > maxDuration) {
				rowsToDelete.push(rowIndex);
			}
		}

	} 




}

export default FileParser;
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

		//var parsedFiles = {};

		for (var key in files) {
			if (key === 'apple_music_library_activity') {
				files[key].then(result => {
					var libraryActivityFile = JSON.parse(result);
					libraryActivityFile = this.parseLibraryActivity(libraryActivityFile);
					console.log(libraryActivityFile)
					// Add read file to parsedFile object
					//parsedFiles['libraryActivityFile'] = libraryActivityFile;
					return libraryActivityFile;
				})
			} else if (key === 'apple_music_library_tracks') {
				files[key].then(result => {
					var libraryTracksFile = JSON.parse(result);
					// Add read file to parsedFile object
					//parsedFiles['libraryTracksFile'] = libraryTracksFile;
					return libraryTracksFile;
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
						// Add parsed file to parsedFile object
						//parsedFiles['likesDislikesFile'] = result;
						return result;
					})
				})
			} else if (key === 'apple_music_play_activity') {
				files[key].then(result => {
					new Promise((resolve, reject) => {
						// papaConfig contains "complete" callback function to execute when parsing is done
						papaConfig['complete'] = (results, file) => {
							// parse file
							var playActivityFile = FileParser.parsePlayActivity(results.data);
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
						// Add parsed file to parsedFile object
						//parsedFiles['playActivityFile'] = result;
						return result;
					})
				})
			} else if (key === 'identifier_information') {
				files[key].then(result => {
					var identifierInfosFile = JSON.parse(result);
					// Add read file to parsedFile object
					//parsedFiles['identifierInfosFile'] = identifierInfosFile;
					return identifierInfosFile;
				})
			}
		}


	}

	static parsePlayActivity(playActivityFile) {

		var rowsDeleted = [];
		var playDuration = {};
		for (var row in playActivityFile) {
			var entry = playActivityFile[row];

			// add time related columns, removing rows that have a date before june 2015
			if (typeof(entry['Event Start Timestamp']) !== 'undefined') {
				entry['Activity date time'] = entry['Event Start Timestamp'];
			} else {
				entry['Activity date time'] = entry['Event End Timestamp'];
			}
			if (typeof(entry['Activity date time']) !== 'undefined') {
				var datetimeString = entry['Activity date time'];
				var utcOffset = entry['UTC Offset In Seconds'];
				var datetimeObject = this.parseDateTime(datetimeString, utcOffset);
				if (datetimeObject['year'] < 2015 && datetimeObject['month'] < 6) {
					delete playActivityFile[row]
					rowsDeleted.push(entry);
					break;
				} else {
					entry['Play Year'] = datetimeObject['year'];
					entry['Play Month'] = datetimeObject['month'];
					entry['Play DOM'] = datetimeObject['dom'];
					entry['Play DOW'] = datetimeObject['dow'];
					entry['Play HOD'] = datetimeObject['hod'];
				}
			} else {
				delete playActivityFile[row]
				rowsDeleted.push(entry);
				break;
			}

			// Add partial listening column
			if (entry['End Reason Type'] === 'NATURAL_END_OF_TRACK' || entry['Play Duration Milliseconds']>=entry['Media Duration In Milliseconds']) {
				entry['Played completely'] = true;
			} else {
				entry['Played completely'] = false;
			}

			// Add track origin column
			var trackOrigin = entry['Feature Name'].split('/')[0].trim()
			switch (trackOrigin) {
				case 'search' || 'browse':
					entry['Track origin'] = 'search';
					break;
				case 'library' || 'my-music' || 'playlists' || 'playlist_detail':
					entry['Track origin'] = 'library';
					break;
				case 'for_you':
					if (entry['Feature Name'].split('/').length > 1) {
						switch (entry['Feature Name'].split('/')[1].trim()) {
							case 'recently_played':
								entry['Track origin'] = 'for you - recently played';
								break;
							case 'personalized_mix':
								entry['Track origin'] = 'for you - personalized mix';
								break;
							default:
								entry['Track origin'] = 'for you - other';
						}
					} else {
						entry['Track origin'] = 'for you - other';
					}
					break;
				default:
					entry['Track origin'] = 'other';
			}

			// Add play duration column
			var startTime = new Date(entry['Event Start Timestamp']);
			var endTime = new Date(entry['Event End Timestamp']);
			if (entry['Played completely'] === false && entry['Play Duration Milliseconds']>0) {
				entry['Play duration in minutes'] = entry['Play Duration Milliseconds']/60000;
			} else if (startTime.getUTCDate() === endTime.getUTCDate()) {
				entry['Play duration in minutes'] = ((endTime - startTime)/1000)/60; //convert from ms to s, then to min
			} else {
				entry['Play duration in minutes'] = parseInt(entry['Media Duration In Milliseconds'])/60000;
			}

			playDuration[row] = entry['Play duration in minutes'];
		}

		// Remove 99th percentile outliers of play duration
		var rowsToDelete = this.removeOutlier(playDuration);
		for (var row in playActivityFile) {
			if (rowsToDelete.includes(row)) {
				delete playActivityFile[row];
				rowsDeleted.push(playActivityFile[row]);
			}
	
		}

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
			} else {
				entry['Transaction Agent'] = userAgent;
			}
			
		}

		return libraryActivityFile;

	}

	static parseDateTime(datetimeString, utcOffset = null) {
		var dateInMs = Date.parse(datetimeString);
		if (utcOffset) {
			var utcOffsetInMs = parseInt(utcOffset) * 1000;
			var dateInLocalTimeInMs = dateInMs + utcOffsetInMs;
		} else {
			var dateInLocalTimeInMs = dateInMs;
		}
		var dateObject = {};
		// basically, we shift the UTC time representation to match the local time
		dateInLocalTimeInMs = new Date(dateInLocalTimeInMs)
		// then we can fetch year, month,... using the getUTC[...] methods
		dateObject['year'] = dateInLocalTimeInMs.getUTCFullYear();
		dateObject['month'] = dateInLocalTimeInMs.getUTCMonth() + 1; // zero-based, so we add 1
		dateObject['dom'] = dateInLocalTimeInMs.getUTCDate();
		dateObject['dow'] = dateInLocalTimeInMs.getUTCDay(); // Sunday is 0
		dateObject['hod'] = dateInLocalTimeInMs.getUTCHours();
		return dateObject;
	}

	static removeOutlier(obj) {
		var playDurations = Object.values(obj);
		playDurations.sort(function(a, b) {
            return a - b;
         });

		var len =  playDurations.length;
		var percentile99 = Math.floor(len*.99) - 1;

		var rowsToDelete = [];
		for (var row in Object.keys(obj)) {
			if (obj[row] > playDurations[percentile99]) {
				rowsToDelete.push(row);
			}
		}
		
		return rowsToDelete;
	} 

}

export default FileParser;
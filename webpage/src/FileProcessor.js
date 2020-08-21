import Utils from './Utils.js';

class FileProcessor {

	// constructor() {
	// 	this.increment = 0;
	// 	this.trackInstanceDict = {};
	// 	this.artistTracksTitles = {};
 //        this.genresList = [];
	// 	this.itemsNotMatched = {'library_tracks':[], 'identifier_info':[], 
	// 	'play_activity':[], 'likes_dislikes':[]};
 //  	}


  	static processFiles(files) {

  		return new Promise((resolve, reject) => {
	  		var processOutput = {
	  			'increment':0,
	  			'trackInstanceDict': {},
	  			'artistTracksTitles': {},
	  			'genresList': [],
	  			'itemsNotMatched': {'library_tracks':[], 'identifier_info':[], 
					'play_activity':[], 'likes_dislikes':[]}
			}

			var processPromises = [];

			// process Library Tracks file
			var processLibraryTracksPromise = new Promise((resolve, reject) => {
				this.processLibraryTracks(files['libraryTracksFile'], processOutput);
				resolve();
			});
			processPromises.push(processLibraryTracksPromise);

			// process Identifier Infos file
			var processIdentifierInfosPromise = new Promise((resolve, reject) => {
				this.processIdentifierInfos(files['identifierInfosFile'], processOutput);
				resolve();
			});
			processPromises.push(processIdentifierInfosPromise);

			// process Play Activity file
			var processPlayActivityPromise = new Promise((resolve, reject) => {
				this.processPlayActivity(files['playActivityFile'], processOutput);
				resolve();
			});
			processPromises.push(processPlayActivityPromise);

			// process Likes Dislikes file
			var processLikesDislikesPromise = new Promise((resolve, reject) => {
				this.processLikesDislikes(files['likesDislikesFile'], processOutput);
				resolve();
			});
			processPromises.push(processLikesDislikesPromise);


			Promise.all(processPromises).then(result => {
				resolve(processOutput)
			})


  		})

  	}


  	static processLibraryTracks(file, processOutput) {
  		for (var elem in file) {
  			var index = elem;
  			var row = file[elem];

  			if (typeof(row['Title']) !== 'undefined') {
	  			var title = row['Title'];
	  			var artist;
	  			if (typeof(row['Artist']) === 'undefined') {
	  				artist = 'No Artist';
	  			} else {
	  				artist = row['Artist'];
	  			}

	  			var titleArtist = Utils.concatTitleArtist(title, artist);
	  			
	  			if (titleArtist in processOutput['trackInstanceDict'] == false) {
	  				this.manageUnknownTrackFromLibrary(title, artist, index, row, processOutput);

	  			} else {
	  				var trackInstance = processOutput['trackInstanceDict'][titleArtist];
	  				trackInstance.updateTrackFromLibrary(index, row);

  					// we add the track's genre to the list of genres
		            if (!processOutput['genresList'].includes(row['Genre'])) {
		                processOutput['genresList'].push(row['Genre']);
		            }

	  			}

	  			// we update the artist/track names dictionnary
	  			if (artist in processOutput['artistTracksTitles'] == false) {
	  				processOutput['artistTracksTitles'][artist]=[];
	  			} 
	  			if (!processOutput['artistTracksTitles'][artist].includes(title)) {
	  				processOutput['artistTracksTitles'][artist].push(title);
	  			} 

  			} else {
  				processOutput['itemsNotMatched']['library_tracks'].push(index);
  			}


  		}
  	}

	static compareTitleForArtist(artistTitles, titleToCompare) {
		for (var i in artistTitles) {
			var artistTitle = artistTitles[i];
			var similarityScore = Utils.computeSimilarityScore(artistTitle, titleToCompare);
			if (similarityScore >= 0.68) {
				return artistTitle;
			}
		}
		return 'No match';
	}

	static manageUnknownTrackFromLibrary(title, artist, index, row, processOutput) {
		var titleArtist = Utils.concatTitleArtist(title, artist);

		if (artist in processOutput['artistTracksTitles']) {
			var titleComparisonResult = this.compareTitleForArtist(processOutput['artistTracksTitles'][artist], title);
			
			if (titleComparisonResult === 'No match') {
				this.setNewTrackFromLibrary(title, artist, index, row, processOutput);

			} else {
				// we retrieve the matching track instance
				var matchTitleArtist = Utils.concatTitleArtist(titleComparisonResult, artist);
				var trackInstance = processOutput['trackInstanceDict'][matchTitleArtist];

				// if the title of the current row is not yet associated to the track instance we add it
				if (!trackInstance.hasTitleName(title)) {
					trackInstance.addTitle(title);
				}
				trackInstance.updateTrackFromLibrary(index, row);

				// we add the track's genre to the list of genres
            if (!processOutput['genresList'].includes(row['Genre'])) {
                processOutput['genresList'].push(row['Genre']);
            }

				// we add a reference of the track instance to the trackInstanceDict with this combination of title/artist
            processOutput['trackInstanceDict'][titleArtist]=trackInstance;

            // we add a reference to this title in the list of titles for this artist
            //processOutput['artistTracksTitles'][artist].append(title);
			}

		} else {
		//there was no close match, and the song was never seen, so we instantiate a new Track
		this.setNewTrackFromLibrary(title, artist, index, row, processOutput)
		}
	}
	
	static setNewTrackFromLibrary(title, artist, index, row, processOutput) {
		// we instantiate a Track object
		var trackInstance = new Track(processOutput['increment']);
		trackInstance.instantiateTrack(title, artist);       
		trackInstance.updateTrackFromLibrary(index, row);

			// we add the track's genre to the list of genres
        if (!processOutput['genresList'].includes(row['Genre'])) {
            processOutput['genresList'].push(row['Genre']);
        }

        // we add the track instance to the trackInstanceDict and increment the track id
        var titleArtist = Utils.concatTitleArtist(title, artist);
        processOutput['trackInstanceDict'][titleArtist]=trackInstance;
        processOutput['increment']++;
	}

	static processIdentifierInfos(file, processOutput) {
		for (var elem in file) {
  			var index = elem;
  			var row = file[elem];

  			var foundMatch = false;

  			for (var key in processOutput['trackInstanceDict']) {
				var trackInstance = processOutput['trackInstanceDict'][key];

				if (trackInstance.appleMusicID.includes(row['Identifier'])) {
					trackInstance.addAppearance({'source': 'identifier_info', 'df_index':index});
					if (!trackInstance.hasTitleName(row['Title'])) {
						trackInstance.addTitle(row['Title']);
					}
					foundMatch = true;
				}
  			}

			if (foundMatch === false) {
				processOutput['itemsNotMatched']['identifier_info'].push((index, row['Identifier']));
			}
		}
	}

	static processPlayActivity(file, processOutput) {

		for (var elem in file) {
  			var index = elem;
  			var row = file[elem];

  			if (typeof(row['Title']) !== 'undefined' && row['Title'] !== ' ' && row['Title'] !== '') {
	  			var title = row['Title'];
	  			var artist;
	  			if (typeof(row['Artist']) === 'undefined') {
	  				artist = 'No Artist';
	  			} else {
	  				artist = row['Artist'];
	  			}

	  			var titleArtist = Utils.concatTitleArtist(title, artist);
	  			
	  			if (titleArtist in processOutput['trackInstanceDict'] == false) {
	  				this.manageUnknownTrackFromPlayActivity(title, artist, index, row, processOutput);

	  			} else {
	  				var trackInstance = processOutput['trackInstanceDict'][titleArtist];
	  				trackInstance.updateTrackFromPlayActivity(index, row);

  					// we add the track's genre to the list of genres
		            if (!processOutput['genresList'].includes(row['Genre'])) {
		                processOutput['genresList'].push(row['Genre']);
		            }

	  			}

	  			// we update the artist/track names dictionnary
	  			if (artist in processOutput['artistTracksTitles'] == false) {
	  				processOutput['artistTracksTitles'][artist]=[];
	  			} 
	  			if (!processOutput['artistTracksTitles'][artist].includes(title)) {
	  				processOutput['artistTracksTitles'][artist].push(title);
	  			} 

  			} else {
  				processOutput['itemsNotMatched']['play_activity'].push(index);
  			}
  		}
	}

	static manageUnknownTrackFromPlayActivity(title, artist, index, row, processOutput) {
		var titleArtist = Utils.concatTitleArtist(title, artist);

		if (artist in processOutput['artistTracksTitles']) {
			var titleComparisonResult = this.compareTitleForArtist(processOutput['artistTracksTitles'][artist], title);
			
			if (titleComparisonResult === 'No match') {
				this.setNewTrackFromPlayActivity(title, artist, index, row, processOutput);

			} else {
				// we retrieve the matching track instance
				var matchTitleArtist = Utils.concatTitleArtist(titleComparisonResult, artist);
				var trackInstance = processOutput['trackInstanceDict'][matchTitleArtist];

				// if the title of the current row is not yet associated to the track instance we add it
				if (!trackInstance.hasTitleName(title)) {
					trackInstance.addTitle(title);
				}
				trackInstance.updateTrackFromPlayActivity(index, row);

				// we add the track's genre to the list of genres
	            if (!processOutput['genresList'].includes(row['Genre'])) {
	                processOutput['genresList'].push(row['Genre']);
	            }

					// we add a reference of the track instance to the trackInstanceDict with this combination of title/artist
	            processOutput['trackInstanceDict'][titleArtist]=trackInstance;

	            // we add a reference to this title in the list of titles for this artist
	            //processOutput['artistTracksTitles'][artist].append(title);
			}

		} else {
		//there was no close match, and the song was never seen, so we instantiate a new Track
		this.setNewTrackFromPlayActivity(title, artist, index, row, processOutput)
		}
	}
	
	static setNewTrackFromPlayActivity(title, artist, index, row, processOutput) {
		// we instantiate a Track object
		var trackInstance = new Track(processOutput['increment']);
		trackInstance.instantiateTrack(title, artist);       
		trackInstance.updateTrackFromPlayActivity(index, row);

			// we add the track's genre to the list of genres
        if (!processOutput['genresList'].includes(row['Genre'])) {
            processOutput['genresList'].push(row['Genre']);
        }

        // we add the track instance to the trackInstanceDict and increment the track id
        var titleArtist = Utils.concatTitleArtist(title, artist);
        processOutput['trackInstanceDict'][titleArtist]=trackInstance;
        processOutput['increment']++;
	}


	static processLikesDislikes(file, processOutput) {

		for (var elem in file) {
  			var index = elem;
  			var row = file[elem];

  			if (typeof(row['Title']) !== 'undefined') {
	  			var title = row['Title'];
	  			var artist;
	  			if (typeof(row['Artist']) === 'undefined') {
	  				artist = 'No Artist';
	  			} else {
	  				artist = row['Artist'];
	  			}

	  			var titleArtist = Utils.concatTitleArtist(title, artist);
	  			var foundMatch = false;

	  			for (var key in processOutput['trackInstanceDict']) {
					var trackInstance = processOutput['trackInstanceDict'][key];

					if (trackInstance.appleMusicID.includes(row['Item Reference'])) {
						trackInstance.addAppearance({'source': 'likes_dislikes', 'df_index':index});
						trackInstance.setRating(row['Preference']);
						if (!trackInstance.hasTitleName(title)) {
							trackInstance.addTitle(title);
							if (!processOutput['artistTracksTitles'][artist].includes(title)) {
	  							processOutput['artistTracksTitles'][artist].push(title);
	  						} 
						}
						foundMatch = true;
					}
	  			}

				if (foundMatch === false) {
		  			if (titleArtist in processOutput['trackInstanceDict']) {
		  				var trackInstance = processOutput['trackInstanceDict'][titleArtist];
		  				trackInstance.addAppearance({'source': 'likes_dislikes', 'df_index':index});
						trackInstance.setRating(row['Preference']);

		  			} else {
						if (artist in processOutput['artistTracksTitles']) {
							var titleComparisonResult = this.compareTitleForArtist(processOutput['artistTracksTitles'][artist], title);

							if (titleComparisonResult === 'No match') {
								processOutput['itemsNotMatched']['likes_dislikes'].push(index);

							} else {
								// we retrieve the matching track instance
								var matchTitleArtist = Utils.concatTitleArtist(titleComparisonResult, artist);
								var trackInstance = processOutput['trackInstanceDict'][matchTitleArtist];

								// if the title of the current row is not yet associated to the track instance we add it
								if (!trackInstance.hasTitleName(title)) {
									trackInstance.addTitle(title);
								}

								// we add apperance and rating
								trackInstance.addAppearance({'source': 'likes_dislikes', 'df_index':index});
								trackInstance.setRating(row['Preference']);

								// we add a reference of the track instance to the trackInstanceDict with this combination of title/artist
					            processOutput['trackInstanceDict'][titleArtist]=trackInstance;
					            // we add a reference to this title in the list of titles for this artist
								processOutput['artistTracksTitles'][artist].push(title);

							}
						} else {
                        	/* we add the item to the items_not_matched,
                        	we choose not to add it to the Track instances as the amount of information is little
                        	and our reference really is the play activity! */
                        	processOutput['itemsNotMatched']['likes_dislikes'].push(index);

						}
		  			}
				}

  			} else {
  				processOutput['itemsNotMatched']['likes_dislikes'].push(index);
  			}
  		}
	}

}


class Track {

	constructor(identifier) {
		this.identifier = identifier;
		this.titles = [];
        this.artist = '';
        this.isInLib = false;
        this.appearances = [];
        this.genres = [];
        this.appleMusicID = [];
        this.rating = [];
  	}

  	hasTitleName(title) {
  		if (this.titles.includes(title)) {
  			return true;
  		}
  		return false;
  	}

  	addTitle(title) {
  		this.titles.push(title);
  	}

  	setArtist(artist) {
  		this.artist = artist;
  	}

  	setAppleMusicID(appleID) {
  	 	if (!this.appleMusicID.includes(appleID)) {
  			this.appleMusicID.push(appleID);
  		}
  	}

  	setLibraryFlag() {
  		this.isInLib = true;
  	}

  	setGenre(genre) {
  		if (typeof(genre) !== 'undefined') {
  			if (!this.genres.includes(genre)) {
  				this.genres.push(genre.trim());
  			}
  		}
  	}

  	addAppearance(appearenceDict) {
  		this.appearances.push(appearenceDict);
  	}

  	setRating(rating) {
  		var trackRating;
  		if (rating === 'LOVE' || rating === 'LIKE') {
  			trackRating = 'LOVE';
  		} else if (rating === 'DISLIKE') {
  			trackRating = 'DISLIKE';
  		}

	  	if (!this.rating.includes(trackRating)) {
			this.rating.push(trackRating);
		}
  	}

  	instantiateTrack(title, artist) {
  		this.addTitle(title);
		this.setArtist(artist);
  	}

  	updateTrackFromLibrary(index, row) {
  		this.setLibraryFlag();
  		this.addAppearance({'source': 'library_tracks', 'df_index':index});
  		this.setGenre(row['Genre']);
  		this.setRating(row['Track Like Rating']);

  		if (typeof(row['Apple Music Track Identifier']) !== 'undefined') {
  			this.setAppleMusicID(parseInt(row['Apple Music Track Identifier']).toString());
  			if (typeof(row['Tag Matched Track Identifier']) !== 'undefined' & row['Tag Matched Track Identifier'] !== row['Apple Music Track Identifier']) {
  				this.setAppleMusicID(parseInt(row['Tag Matched Track Identifier']).toString());
  			}
  		} else {
  			this.setAppleMusicID(parseInt(row['Track Identifier']).toString());
  			if (typeof(row['Purchased Track Identifier']) !== 'undefined') {
  				this.setAppleMusicID(parseInt(row['Purchased Track Identifier']).toString());
  			}
  		}

  	}

  	updateTrackFromPlayActivity(index, row) {
  		this.addAppearance({'source': 'play_activity', 'df_index':index});
  		this.setGenre(row['Genre']);

  		if (row['Track origin'] === 'library' & this.isInLib === false) {
  			this.setLibraryFlag();
  		}
  	}

}


export default FileProcessor;
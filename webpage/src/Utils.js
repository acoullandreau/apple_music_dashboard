import stringSimilarity from 'string-similarity';


class Utils {

	static parseFileName(fileName) {
		var parsedFileName = fileName.split('/').pop().split('.')[0]
		parsedFileName = parsedFileName.toLowerCase().replace(/\s/g, '_');
		return parsedFileName;
	}

	static concatTitleArtist(title, artist) {
		return title.trim()+' && '+artist.trim();
	}

	static computeSimilarityScore(a, b) {
		return stringSimilarity.compareTwoStrings(a, b);
	}


}

export default Utils;
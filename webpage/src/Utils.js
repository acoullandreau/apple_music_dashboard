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
		var aNoPunc = a.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		var aNoPuncUp = aNoPunc.replace(/\s{2,}/g," ").toUpperCase();
		var bNoPunc = b.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		var bNoPuncUp = bNoPunc.replace(/\s{2,}/g," ").toUpperCase();

		return stringSimilarity.compareTwoStrings(aNoPuncUp, bNoPuncUp);
	}


}

export default Utils;
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

	static cleanListValues(list) {
		if (list !== []) {
			if (list.length === 0) {
				return 'Unknown';
			} else if (list.length === 1) {
				return list[0];
			} else {
				return list.join(' && ');
			}
		} else {
			return 'Unknown';
		}
	}

	static computePercentage(countDict, total) {
		var percentageDict = {};
		for (var key in countDict) {
			var percentage = (countDict[key]/total * 100).toFixed(2);
			percentageDict[key] = parseFloat(percentage);
		}

		return percentageDict;
	}

	static populateCountDict(value, counttDict) {
		if (value in counttDict) {
            counttDict[value] ++;
        } else {
           	counttDict[value] = 1;
        }
	}

	static sortDictKeys(dict) {
		return Object.keys(dict).sort(function(a, b) {
			return dict[b] - dict[a]
		})
	}

}

export default Utils;
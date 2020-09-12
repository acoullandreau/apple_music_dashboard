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

	static reduceRankingDict(rankingDict, numEntries) {
		var reducedRankingDict = {};
		for (var year in rankingDict) {
			reducedRankingDict[year] = {};
			reducedRankingDict[year]['counts'] = {};
			reducedRankingDict[year]['rankOrder'] = []
			for (var k=0 ; k<numEntries ; k++) {
				var key =  rankingDict[year]['rankOrder'][k];
				// this "if" is in case the input data doesn't contain enough items, i.e its length is less than numEntries
				if (typeof(key) !== 'undefined') {
					reducedRankingDict[year]['counts'][key] = rankingDict[year]['counts'][key];
					reducedRankingDict[year]['rankOrder'].push(key)
				}
			}
		}
		return reducedRankingDict;
	}
}

export default Utils;
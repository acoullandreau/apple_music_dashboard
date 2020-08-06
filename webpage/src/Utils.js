
class Utils {

	static parseFileName(fileName) {
		var parsedFileName = fileName.split('/').pop().split('.')[0]
		parsedFileName = parsedFileName.toLowerCase().replace(/\s/g, '_');
		return parsedFileName;
	}

}

export default Utils;
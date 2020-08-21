import React from 'react';
import ReactDOM from 'react-dom';
import FileSelector from './FileSelector.js';
import FileParser from './FileParser.js';
import FileProcessor from './FileProcessor.js';
import connectorInstance from './IndexedDBConnector.js';


class App extends React.Component {

	onFileLoad = (targetFiles) => {
		// we open the archive, parse and process the fles, and save them to the DB
		var filesToParsePromise = FileParser.getFilesToParse(targetFiles);
		filesToParsePromise.then(result => {
			var parsedFiles = FileParser.parseFiles(result);
			return parsedFiles;
		})
		.then(result => {
			// we save the parsed files to indexedDB
			connectorInstance.addObjectToDB(result);
			// we remove the archive from the local storage
			localStorage.removeItem('archive');

			// we process the files
			var processedFiles = FileProcessor.processFiles(result);
			return processedFiles;
		})
		.then(result => {
			console.log(result)
		})
		
	}

	onReset = () => {
		connectorInstance.deleteStore();
	} 


	render() {
		return (
			<div>
				<FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} />
			</div>
		)
		
	}
}

ReactDOM.render(
	<App/>,
	document.querySelector('#root')
);
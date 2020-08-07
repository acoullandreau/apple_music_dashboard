import React from 'react';
import ReactDOM from 'react-dom';
import Papa from 'papaparse';
import FileSelector from './FileSelector.js';
import FileParser from './FileParser.js';


class App extends React.Component {

	onFileLoad = (targetFiles) => {
		// we store the dict of target files to parse 
		localStorage.setItem('targetFiles', targetFiles);
		var filesToParsePromise = FileParser.getFilesToParse(targetFiles);
		filesToParsePromise.then(result => {
			//do the parsing of each file
			FileParser.parseFiles(result);

		});
	}

	render() {
		return (
			<div>
				<FileSelector onFileLoad={this.onFileLoad}/>
			</div>
		)
		
	}
}

ReactDOM.render(
	<App/>,
	document.querySelector('#root')
);
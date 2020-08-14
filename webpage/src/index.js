import React from 'react';
import ReactDOM from 'react-dom';
import FileSelector from './FileSelector.js';
import FileParser from './FileParser.js';


class App extends React.Component {

	onFileLoad = (targetFiles) => {
		// we store the dict of target files to parse 
		//localStorage.setItem('targetFiles', JSON.stringify(targetFiles));
		var filesToParsePromise = FileParser.getFilesToParse(targetFiles);
		filesToParsePromise.then(result => {
			var parsedFiles = FileParser.parseFiles(result);
			parsedFiles.then(result => {
				console.log(result)
			})
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
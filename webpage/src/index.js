import React from 'react';
import ReactDOM from 'react-dom';
import FileSelector from './FileSelector.js';
import FileParser from './FileParser.js';


class App extends React.Component {

	onFileLoad = (targetFiles) => {
		// we store the dict of target files to parse 
		localStorage.setItem('targetFiles', targetFiles);
		var fileParser = new FileParser(targetFiles);
		//console.log(fileParser.filesToParse)
		// fileParser.filesToParse.then(result => {
		// 	console.log(result);
		// })


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
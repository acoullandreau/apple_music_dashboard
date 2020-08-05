import React from 'react';
import ReactDOM from 'react-dom';
import FileSelector from './FileSelector.js';
import jsZip from 'jszip';

class App extends React.Component {

	onFileLoad = (targetFiles) => {
		// we store the dict of target files to parse 
		localStorage.setItem('targetFiles', targetFiles);
		console.log(localStorage)
		//start unzipping archive and processing
		//console.log(archive);

		// test if we can extract a nexted zip file
		// var test_nested_zip = archive['identifier_infos'].async("uint8array");
		// jsZip.loadAsync(test_nested_zip).then(zip => {
		// 	console.log(zip.files)
		// });
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
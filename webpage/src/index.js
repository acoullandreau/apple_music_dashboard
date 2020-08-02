import React from 'react';
import ReactDOM from 'react-dom';
import FileSelector from './FileSelector.js';

class App extends React.Component {

	onFileLoad = (archive) => {
		//start unzipping archive and processing
		//console.log(archive);
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
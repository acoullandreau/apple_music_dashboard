import React from 'react';
//import worker from './worker.js';
//import WebWorker from './workerSetup';
import FileSelector from './FileSelector.js';
import connectorInstance from './IndexedDBConnector.js';


class App extends React.Component {
	componentDidMount = () => {
		this.worker = new Worker('./worker.js', { type: 'module' });
	}

	onFileLoad = (archive) => {
		this.worker.postMessage({'type':'archive', 'payload':archive});

		// this.worker.addEventListener('message', event => {
		// 	console.log(event);
		// });
		
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

export default App;
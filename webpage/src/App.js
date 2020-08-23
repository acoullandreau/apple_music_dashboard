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

		this.worker.addEventListener('message', event => {
			if (event.data['type'] === 'archiveValidated') {
				this.refs.fileSelector.storeArchive(archive);
			} else if (event.data['type'] === 'archiveRejected') {
				this.refs.fileSelector.setState({'errorMessage': event.data['payload'] })
			} else if (event.data['type'] === 'filesParsed') {
				localStorage.removeItem('archive');
			}
		});
		
	}

	onReset = () => {
		connectorInstance.deleteStore();
	} 


	render() {
		return (
			<div>
				<div>
					<FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} ref="fileSelector" />
				</div>
			</div>
		)
		
	}
}

export default App;
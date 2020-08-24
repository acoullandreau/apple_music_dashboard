import React from 'react';
import FileSelector from './FileSelector.js';
import Loader from './Loader.js';
import connectorInstance from './IndexedDBConnector.js';


class App extends React.Component {

	state = { 'isLoading': false, 'hasVisuals': false };

	componentDidMount = () => {
		this.worker = new Worker('./worker.js', { type: 'module' });
	}

	onFileLoad = (archive) => {
		this.worker.postMessage({'type':'archive', 'payload':archive});

		this.worker.addEventListener('message', event => {
			switch (event.data['type']) {
				case 'archiveValidated':
					this.refs.fileSelector.storeArchive(archive);
					this.setState({'isLoading': true});
					break;
				case 'archiveRejected':
					this.refs.fileSelector.setState({'errorMessage': event.data['payload'] })
					break;
				case 'filesParsed':
					localStorage.removeItem('archive');
					break;
				case 'visualizationFileReady':
					this.setState({'isLoading': false});
					//start building viz
					console.log('Ready for viz');
			}
		});
		
	}

	onReset = () => {
		connectorInstance.deleteStore();
	} 


	render() {

		if (!this.state.hasVisuals) {
			let elemToRender;

			if (this.state.isLoading) {
				elemToRender = (
					<div>
						<div>
							<FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} ref="fileSelector" />
						</div>
						<div>
							<Loader />
						</div>
					</div>
				)
			} else {
				elemToRender = (
					<div>
						<div>
							<FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} ref="fileSelector" />
						</div>
					</div>
				)
			}

			return elemToRender;
		}

		
	}
}

export default App;
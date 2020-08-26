import React from 'react';
import FileSelector from './FileSelector.js';
import Loader from './Loader.js';
import connectorInstance from './IndexedDBConnector.js';

import PiePlot from './PiePlot.js'; 


class App extends React.Component {

	state = { 'isLoading': false, 'hasVisuals': false };

	componentDidMount = () => {
		connectorInstance.checkIfVizAvailable().then(result => {
			if (result) {
				this.setState({'isLoading': false, 'hasVisuals': true });
			}
		})
		this.worker = new Worker('./worker.js', { type: 'module' });
	}

	onFileLoad = (archive) => {
		// we ask the worker to prepare the files
		this.worker.postMessage({'type':'filePreparation', 'payload':archive});

		this.worker.addEventListener('message', event => {
			switch (event.data['type']) {
				case 'archiveValidated':
					// we know the format of the archive was the right one, we can proceed with file parsing
					this.refs.fileSelector.storeArchive(archive);
					this.setState({'isLoading': true});
					break;
				case 'archiveRejected':
					// there was a problem with the archive, we ask fileSelector to process the error to rerender the component
					this.refs.fileSelector.setState({'errorMessage': event.data['payload'] })
					break;
				case 'filesParsed':
					// files are processed, we can clear the archive from localStorage, other files are stored in indexedDB by the worker
					localStorage.removeItem('archive');
					break;
				case 'visualizationFileReady':
					// files were parsed and stored, now we ask the worker to move on to building the visualizations
					this.worker.postMessage({'type':'visualization', 'payload':''});
				case 'visualizationsReady':
					// visualizations can be rendered, so we update our App state to render the new component
					this.setState({'isLoading': false, 'hasVisuals': true });

			}
		});
		
	}

	onReset = () => {
		connectorInstance.deleteStore();
		this.setState({'isLoading': false, 'hasVisuals': false });
	} 

	reloadViz = () => {
		// display loading screen again while visualizations are recomputed
		this.setState({'isLoading': true, 'hasVisuals': false });
		// request from loader to recompute the visualizations
		this.worker.postMessage({'type':'visualization', 'payload':''});

		this.worker.addEventListener('message', event => {
			switch (event.data['type']) {
				case 'visualizationsReady':
					// visualizations can be rendered, so we update our App state to render the new component
					this.setState({'isLoading': false, 'hasVisuals': true });
			}
		})
	}


	renderScreen = () => {
		let elemToRender;

		if ( !this.state.hasVisuals ) {
			if (this.state.isLoading) {
				elemToRender = (
					<div>
					    <Loader />
					</div>
				)
			}
		} else {
			elemToRender = (
				<div>
					<div>
					    <input type="button" onClick={this.reloadViz} value="Reload the visualizations" />
					</div>
					<div> Plots </div>
				</div>
			)

		} 
		// <div> <PiePlot values={[618, 11, 120, 72, 223]} labels={["iPhone6", "iPad4", "Computer", "iPhone8", "iPhone11"]} /> </div>

		return elemToRender;

	}

	render() {

		return (
			<div>
				<div><FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} ref="fileSelector" /></div>
				{ this.renderScreen() }
			</div>

		)
	}
}

export default App;
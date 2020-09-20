import React from 'react';
import SideNavBar from './SideNavBar.js';
import Route from './Route.js';
import Loader from './Loader.js';
import connectorInstance from './IndexedDBConnector.js';
import BarPlot from './BarPlot.js'; 
import BarPlotFilter from './BarPlotFilter.js'; 
import FileSelector from './FileSelector.js';
import HeatMapPlot from './HeatMapPlot.js'; 
import QueryFilter from './QueryFilter.js'; 
import PiePlot from './PiePlot.js'; 
import RankingList from './RankingList.js'; 
import SunburstPlot from './SunburstPlot.js'; 
import SunburstPlotFilter from './SunburstPlotFilter.js'; 

class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = { 
			'archive':'',
			'isLoading': false, 
			'hasVisuals': false, 
			'plotDetails': {}, 
			'selectedBarPlot' : {},  
			'queryFiltersDefault':{ 'artist': [], 'genre': [], 'inlib': "", 'offline': "", 'origin': "", 'rating': "", 'skipped': "", 'title': [], 'year': [] },
			'selectedPage':'',
		};

		this.fileSelectorRef = React.createRef();
		this.sunburstSongRef = React.createRef();
		this.rankingRef = React.createRef();
		this.heatMapDOMRef = React.createRef();
		this.heatMapDOWRef = React.createRef();
		this.sunburstOriginRef = React.createRef();
	}


	componentDidMount = () => {
		connectorInstance.checkIfVizAvailable().then(result => {
			if (result) {
				this.setState({'isLoading': false, 'hasVisuals': true, 'plotDetails': result });
			}
		})
		this.worker = new Worker('./worker.js', { type: 'module' });

		this.worker.addEventListener('message', event => {
			switch (event.data['type']) {
				case 'archiveValidated':
					// we know the format of the archive was the right one, we can proceed with file parsing
					this.fileSelectorRef.current.storeArchive(this.state.archive);
					this.setState({'isLoading': true});
					break;
				case 'archiveRejected':
					// there was a problem with the archive, we ask fileSelector to process the error to rerender the component
					this.fileSelectorRef.current.setState({'errorMessage': event.data['payload'] })
					break;
				case 'filesParsed':
					// files are processed, we can clear the archive from localStorage, other files are stored in indexedDB by the worker
					localStorage.removeItem('archive');
					break;
				case 'visualizationFileReady':
					// files were parsed and stored, now we ask the worker to move on to building the visualizations
					this.worker.postMessage({'type':'visualization', 'payload':''});
					break;
				case 'visualizationsReady':
					if (event.data['payload']['context']=== 'all') {
						// initial visualizations can be rendered, so we update our App state to render the new component
						this.onVisualizationsReady(event.data['payload']);
					} else {
						// visualizations matching the query are ready, so we update App state to rerender the component
						this.onQueryVisualizationReady(event.data['payload']);
					}
					break;
				default:
					console.log('No matching situation with this value of event.data["type"]');
					break;
			}
		});

	}

	onFileLoad = (archive) => {
		// we ask the worker to prepare the files
		this.setState({'archive':archive}, () => {
			this.worker.postMessage({'type':'filePreparation', 'payload':archive});
		})
	}

	onReset = () => {
		connectorInstance.deleteStore();
		this.setState({
			'archive':'',
			'isLoading': false, 
			'hasVisuals': false, 
			'plotDetails': {}, 
			'selectedBarPlot' : {}, 
		});
	} 

	onSelectPlot = (parameters) => {
		var target = parameters.type;
		if (target === 'bar') {
			this.setState({ 'selectedBarPlot': parameters.payload });
		} else if (target === 'sunburst') {
			// we request an update of the sunburst and rankingList components with the new params
			this.sunburstSongRef.current.updatePlot(parameters);
			this.rankingRef.current.updatePlot(parameters);
		}
	}

	loadViz = () => {
		// display loading screen again while visualizations are computed
		this.setState({'isLoading': true, 'hasVisuals': false });
		// request from worker to compute the visualizations
		this.worker.postMessage({'type':'visualization', 'payload':''});
	}

	onVisualizationsReady = (payload) => {
		// visualizations can be rendered, so we update our App state to render the new component
		this.setState({
			'isLoading': false,
			'hasVisuals': true,
			'plotDetails': Object.assign({}, payload.data),
			'selectedBarPlot' : {}, 
		});
	}

	onQueryVisualizationReady = (payload) => {
		var targetPlot = payload.context.target.type;
		if (targetPlot === 'sunburst') {
			var plotType = payload.context.target.plot;
			if (plotType === 'origin') {
				this.sunburstOriginRef.current.updatePlot(payload);
			} else {
				this.sunburstSongRef.current.updatePlot(payload);
				this.rankingRef.current.updatePlot(payload);
			}
		} else if (targetPlot === 'heatMap') {
			this.heatMapDOMRef.current.updatePlot(payload);
			this.heatMapDOWRef.current.updatePlot(payload);
		}
	}


	onQuerySubmit = (parameters) => {
		var isQuery = this.hasQueryFilters(parameters.data);
		if (isQuery) {
			this.worker.postMessage({'type':'query', 'payload':parameters});
		} else {
			this.onQueryReset(parameters);
		}
	}

	hasQueryFilters = (queryDict) => {
		for (var key in queryDict) {
			if (queryDict[key] !== this.state.queryFiltersDefault[key]) {
				return true;
			}
		}
		return false;
	}
	

	onQueryReset = (plotTarget) => {
		var targetPlot = plotTarget.type;
		if (targetPlot === 'sunburst') {
			var plotType = plotTarget.plot;
			if (plotType === 'origin') {
				this.sunburstOriginRef.current.resetPlot();
			} else {
				this.sunburstSongRef.current.resetPlot();
				this.rankingRef.current.resetPlot();
			}
		} else if (targetPlot === 'heatMap') {
			this.heatMapDOMRef.current.resetPlot();
			this.heatMapDOWRef.current.resetPlot();
		}
	}

	renderTimeBarPlot = () => {
		if (Object.keys(this.state.selectedBarPlot).length === 0) {
			return (
				<div>
					<BarPlot data={this.state.plotDetails['barPlot']} target={{'type':'month', 'unit':'count'}} />
					<BarPlotFilter target='month' onChange={this.onSelectPlot} />
				</div>
			)
		} else {
			return (
				<div>
					<BarPlot data={this.state.plotDetails['barPlot']} target={this.state.selectedBarPlot} />
					<BarPlotFilter target={this.state.selectedBarPlot} onChange={this.onSelectPlot} />
				</div>
			)
		}

	}

	renderGraphsPage = () => {
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
						<QueryFilter 
							data={this.state.plotDetails['filters']} 
							target={{'type':'sunburst', 'plot':''}} 
							onQuery={this.onQuerySubmit} 
							onReset={this.onQueryReset}
						/>
					</div>
					<div>
						<SunburstPlot data={this.state.plotDetails['sunburst']} target={{'type':'genre'}} ref={this.sunburstSongRef}/>
						<SunburstPlotFilter target='genre' onChange={this.onSelectPlot} />
						<RankingList data={this.state.plotDetails['rankingDict']} target={{'type':'genre', 'numItems':5}} ref={this.rankingRef} />
					</div>                  
					<div>
						<QueryFilter 
							data={this.state.plotDetails['filters']} 
							target={{'type':'heatMap'}} 
							onQuery={this.onQuerySubmit}
							onReset={this.onQueryReset}
						/>
					</div>
					<div> 
						<HeatMapPlot data={this.state.plotDetails['heatMapPlot']} target={{'type':'DOM'}} ref={this.heatMapDOMRef} />
						<HeatMapPlot data={this.state.plotDetails['heatMapPlot']} target={{'type':'DOW'}} ref={this.heatMapDOWRef} />
					</div>
					<div> 
						<div>
							<div>
								<PiePlot data={this.state.plotDetails['pieYear']} target={{'type':'year'}} />
								<PiePlot data={this.state.plotDetails['pieDevice']} target={{'type':'device'}} />
							</div>
						</div>
					</div>
					<div> 
						<div>
							{ this.renderTimeBarPlot() }
						</div>
					</div>
					<div>
						<QueryFilter 
							data={this.state.plotDetails['filters']}
							target={{'type':'sunburst', 'plot':'origin'}} 
							onQuery={this.onQuerySubmit} 
							onReset={this.onQueryReset}
						/>
					</div>
					<div>
						<SunburstPlot data={this.state.plotDetails['sunburst']} target={{'type':'origin'}} ref={this.sunburstOriginRef}/>
					</div>
					<div> 
						<div>
							<BarPlot data={this.state.plotDetails['barPlot']} target={{'type':'skippedRatio', 'unit':'percent'}} />
						</div>
					</div>
				</div>
			)

		} 
		return elemToRender;

	}


	renderHomePage = () => {
		return (
			<React.Fragment>
				<div className={['bold', 'title', 'centered-content', 'page-title'].join(' ')}>Welcome</div>
				<div className={['paragraph', 'centered-content', 'home-intro'].join(' ')}>
					<p>
						This web page was designed to allow you to browse through your Apple Music data, providing various visualizations to help you highlight <b>trends</b>, <b>habits</b>, or any relevant <b>insight</b> on your activity on Apple Music.<br/>
						Any processing is performed locally, your files and data <b>do not leave your computer</b>! 
					</p>
				</div>
				<div className={['centered-content', 'home-icons'].join(' ')} >
					<div>
						<img alt='music to charts' src="./image_library/icon-music-chart.svg" />
					</div>
				</div>
				<div className={['bold', 'subtitle', 'how-to'].join(' ')}>How-to</div>
				<div className='instructions'>
					<div className='instruction'>
						<p className={['bold', 'title', 'instructionOne'].join(' ')}>1.</p>
						<div className='instruction-block'>
							<div className={['paragraph', 'instruction-text', 'instructionTwo'].join(' ')}>
								Request your data to Apple, and make sure that you have the <b>Apple_Media_Services.zip</b> archive ready. 
							</div>
						</div>
					</div>
					<div className='instruction'>
						<p className={['bold', 'title', 'instructionOne'].join(' ')}>2.</p>
						<div className={['instruction-block', 'instructionTwo'].join(' ')}>
							<FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} ref={this.fileSelectorRef} />
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
					// <div className='instruction'>
					// 	<p className={['bold', 'title', 'instructionOne'].join(' ')}>3.</p>
					// 	<div className='instruction-block'>
					// 		<div className={['paragraph', 'instruction-text', 'instructionTwo'].join(' ')}>
					// 			Click on the button below to <b>relaunch the treatment</b> of your data
					// 		</div>
					// 		<input type="button" onClick={this.loadViz} value={this.state.vizButton} />
					// 	</div>
					// </div>

	render() {
		if ( !this.state.hasVisuals ) {
			if (this.state.isLoading) {
				return (
					<div>
						<Loader />
					</div>
				)
			}
		} 

		return (
			<div className='page'>
				<div className='nav-bar'>
					<SideNavBar />
				</div>
				<div className='content'>
					<Route path="" >
						{ this.renderHomePage() }
					</Route>
					<Route path="#graphs" >
						<div>
							{ this.renderGraphsPage() }
						</div>
					</Route>
					<Route path="#help">
						<div>
							Help page
						</div>
					</Route>
				</div>
			</div>
		)
	}
}


export default App;
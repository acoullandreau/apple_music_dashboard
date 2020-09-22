import React from 'react';
import { Divider, Tab } from 'semantic-ui-react';
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

		window.history.pushState({}, '', '#graphs');
		const navEvent = new PopStateEvent('popstate');
		window.dispatchEvent(navEvent);

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
				<React.Fragment>
					<BarPlot className='grid-one' data={this.state.plotDetails['barPlot']} target={{'type':'month', 'unit':'count'}} />
					<div className={['grid-two', 'filter'].join(' ')} >
						<BarPlotFilter target='month' onChange={this.onSelectPlot} />
					</div>
				</React.Fragment>
			)
		} else {
			return (
				<React.Fragment>
					<BarPlot className='grid-one' data={this.state.plotDetails['barPlot']} target={this.state.selectedBarPlot} />
					<div className={['grid-two', 'filter'].join(' ')} >
						<BarPlotFilter target={this.state.selectedBarPlot} onChange={this.onSelectPlot} />
					</div>
				</React.Fragment>
			)
		}

	}

	renderGraphTabOne = () => {
		return (
			<Tab.Pane className='tab'>
				<div className={['subtitle', 'bold', 'section-margin', 'section-title'].join(' ')} >When do you listen to music?</div>
				<div className='grid-graphs' >
					{ this.renderTimeBarPlot() }
				</div>
				<Divider section />
				<div className={['subtitle', 'bold', 'section-margin', 'section-title'].join(' ')} >How do you find tracks?</div>
				<div className='grid-graphs-inverted'>
					<div className={['grid-one', 'filter'].join(' ')} >
						<QueryFilter 
							data={this.state.plotDetails['filters']}
							target={{'type':'sunburst', 'plot':'origin'}} 
							onQuery={this.onQuerySubmit} 
							onReset={this.onQueryReset}
						/>
					</div>
					<SunburstPlot className='grid-two' data={this.state.plotDetails['sunburst']} target={{'type':'origin'}} ref={this.sunburstOriginRef}/>
				</div>
				<Divider section />
				<div className={['subtitle', 'bold', 'section-margin', 'section-title'].join(' ')} >Most active year and device?</div>
				<div className='two-blocks' >
					<PiePlot className='grid-one' data={this.state.plotDetails['pieYear']} target={{'type':'year'}} />
					<PiePlot data={this.state.plotDetails['pieDevice']} target={{'type':'device'}} />
				</div>
				<Divider section />
				<div className={['subtitle', 'bold', 'section-margin', 'section-title'].join(' ')} >Do you skip tracks a lot?</div>
				<div>
					<BarPlot data={this.state.plotDetails['barPlot']} target={{'type':'skippedRatio', 'unit':'percent'}} />
				</div>
			</Tab.Pane>
		)
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

			const panes = [
				{ 
					menuItem: 'Listening patterns',
					render: () => this.renderGraphTabOne()
				},
				{
					menuItem: 'Favourites', 
					render: () => (
						<Tab.Pane className='tab'>
							<div className={['subtitle', 'bold', 'section-margin', 'section-title'].join(' ')}>What is your favourite....</div>
							<div className='two-blocks-asym'>
								<SunburstPlot className='grid-one' data={this.state.plotDetails['sunburst']} target={{'type':'genre'}} ref={this.sunburstSongRef}/>
								<div className='grid-two' >
									<div>
										<QueryFilter 
											data={this.state.plotDetails['filters']} 
											target={{'type':'sunburst', 'plot':''}} 
											onQuery={this.onQuerySubmit} 
											onReset={this.onQueryReset}
										/>
									</div>
									<div>
										<SunburstPlotFilter target='genre' onChange={this.onSelectPlot} />
										<RankingList data={this.state.plotDetails['rankingDict']} target={{'type':'genre', 'numItems':5}} ref={this.rankingRef} />
									</div> 
								</div>
							</div>
						</Tab.Pane> 
					)
				},
				{ 
					menuItem: 'Calendar view', 
					render: () => (
						<Tab.Pane className='tab'>
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
						</Tab.Pane> 
					)
				},
			]


			elemToRender = (
				<div className={['content-graphs', 'content'].join(' ')}>
					<div className={['bold', 'title', 'centered-content', 'page-title'].join(' ')}>Visualizations</div>
					<div className={['paragraph', 'section-margin'].join(' ')}>
						Your data source : <b>{localStorage.getItem('archiveName')}</b>
					</div>
					<Tab className='section-margin' panes={panes} />
				</div>
			);

		} 
		return elemToRender;

	}


	renderHomePage = () => {
		return (
			<div className={['content-home', 'content'].join(' ')}>
				<div className={['bold', 'title', 'page-title'].join(' ')}>Welcome</div>
				<div className={['paragraph', 'section-margin'].join(' ')}>
					<p>
						This web page was designed to allow you to browse through your Apple Music data, providing various visualizations to help you highlight <b>trends</b>, <b>habits</b>, or any relevant <b>insight</b> on your activity on Apple Music.<br/>
						Any processing is performed locally, your files and data <b>do not leave your computer</b>! 
					</p>
				</div>
				<div className={['home-icons'].join(' ')} >
					<div>
						<img alt='music to charts' src="./image_library/icon-music-chart.svg" />
					</div>
				</div>
				<div className={['bold', 'subtitle', 'section-margin'].join(' ')}>How-to</div>
				<div className='instructions'>
					<div className='instruction'>
						<p className={['bold', 'title', 'grid-one'].join(' ')}>1.</p>
						<div className='instruction-block'>
							<div className={['paragraph', 'instruction-text', 'grid-two'].join(' ')}>
								Request your data to Apple, and make sure that you have the <b>Apple_Media_Services.zip</b> archive ready. 
							</div>
						</div>
					</div>
					<div className='instruction'>
						<p className={['bold', 'title', 'grid-one'].join(' ')}>2.</p>
						<div className='instruction-block'>
							<FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} ref={this.fileSelectorRef} />
						</div>
					</div>
				</div>
			</div>
		)
	}

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
					<SideNavBar showGraphs={this.state.hasVisuals ? true : false }/>
				</div>
				<Route path="" >
					{ this.renderHomePage() }
				</Route>
				<Route path="#graphs" >
					<React.Fragment>
						{ this.renderGraphsPage() }
					</React.Fragment>
				</Route>
				<Route path="#help">
					<div>
						Help page
					</div>
				</Route>
			</div>
		)
	}
}


export default App;
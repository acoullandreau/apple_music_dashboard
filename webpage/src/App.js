import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Divider, Grid } from 'semantic-ui-react';
import SideNavBar from './SideNavBar.js';
import Route from './Route.js';
import connectorInstance from './IndexedDBConnector.js';
import BarPlot from './BarPlot.js'; 
import BarPlotFilter from './BarPlotFilter.js'; 
import CalendarPlotFilter from './CalendarPlotFilter.js';
import ContactForm from './ContactForm.js'
import FileSelector from './FileSelector.js';
import HeatMapPlot from './HeatMapPlot.js'; 
import Overlay from './Overlay.js';
import PiePlot from './PiePlot.js'; 
import QueryFilter from './QueryFilter.js'; 
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
			'overlay':{'display':false, 'type':'', 'title':'', 'message':''},
			'plotDetails': {}, 
			'selectedBarPlot' : {},  
			'queryFiltersDefault':{ 'artist': '', 'genre': '', 'inlib': "", 'offline': "", 'origin': '', 'rating': "", 'skipped': "", 'title': '', 'year': '' }
		};

		this.fileSelectorRef = React.createRef();
		this.sunburstSongRef = React.createRef();
		this.rankingRef = React.createRef();
		this.heatMapRef = React.createRef();
		this.sunburstOriginRef = React.createRef();
		this.barTimeRef = React.createRef();
		this.barSkippedRef = React.createRef();
		this.querySunburstOriginRef = React.createRef();
		this.queryFavouritesRef = React.createRef();
		this.queryHeatMapRef = React.createRef();
		this.overlayRef = React.createRef();
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
			'overlay':{'display':false, 'type':'', 'title':'', 'message':''},
			'plotDetails': {}, 
			'selectedBarPlot' : {}
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
		} else if (target === 'heatmap') {
			this.heatMapRef.current.updatePlot(parameters);
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
			'overlay':{'display':false, 'type':'', 'title':'', 'message':''},
			'plotDetails': Object.assign({}, payload.data),
			'selectedBarPlot' : {}
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
			this.heatMapRef.current.updatePlot(payload);
		}
	}


	onQuerySubmit = (parameters) => {
		var isQuery = this.hasQueryFilters(parameters.data);
		if (isQuery) {
			this.worker.postMessage({'type':'query', 'payload':parameters});
		} else {
			this.onQueryReset(parameters.target);
		}
	}

	hasQueryFilters = (queryDict) => {
		for (var key in queryDict) {
			if (Array.isArray(queryDict[key]) & queryDict[key].length === 0) {
				queryDict[key] = '';
			}
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
				this.querySunburstOriginRef.current.onQueryCleared();
			} else {
				this.sunburstSongRef.current.resetPlot();
				this.rankingRef.current.resetPlot();
				this.queryFavouritesRef.current.onQueryCleared();
			}
		} else if (targetPlot === 'heatMap') {
			this.heatMapRef.current.resetPlot();
			this.queryHeatMapRef.current.onQueryCleared();
		}
	}

	displayOverlay = (parameters) => {
		var overlay = {...this.state.overlay};
		overlay['display'] = parameters.display;
		overlay['type'] = parameters.type;
		overlay['title'] = parameters.title;
		overlay['message'] = parameters.message;
		this.setState({ overlay });
	}

	renderTimeBarPlot = () => {
		if (Object.keys(this.state.selectedBarPlot).length === 0) {
			return (
				<React.Fragment>
					<BarPlot className='grid-one' data={this.state.plotDetails['barPlot']} target={{'type':'month', 'unit':'count'}} ref={this.barTimeRef} />
					<div className={['grid-two', 'filter-bar'].join(' ')} >
						<BarPlotFilter target='month' onChange={this.onSelectPlot} />
					</div>
				</React.Fragment>
			)
		} else {
			return (
				<React.Fragment>
					<BarPlot className='grid-one' data={this.state.plotDetails['barPlot']} target={this.state.selectedBarPlot} ref={this.barTimeRef} />
					<div className={['grid-two', 'filter-bar'].join(' ')} >
						<BarPlotFilter target={this.state.selectedBarPlot} onChange={this.onSelectPlot} />
					</div>
				</React.Fragment>
			)
		}

	}

	renderGraphTabOne = () => {
		return (
			<div className='grid-two'>
				<div className={['subtitle', 'bold', 'section-margin'].join(' ')} >When do you listen to music?</div>
				<div className='grid-patterns-bar' >
					{ this.renderTimeBarPlot() }
				</div>
				<Divider section />
				<div className={['subtitle', 'bold', 'section-margin'].join(' ')} >How do you find tracks?</div>
				<div className='grid-patterns-sunburst'>
					<div className={['grid-one', 'filter-query'].join(' ')} >
						<p className='bold'>Explore filters:</p>
						<QueryFilter 
							data={this.state.plotDetails['filters']}
							target={{'type':'sunburst', 'plot':'origin'}} 
							onQuery={this.onQuerySubmit} 
							onReset={this.onQueryReset}
							ref={this.querySunburstOriginRef}
						/>
					</div>
					<SunburstPlot 
						className='grid-two' 
						ranking={this.state.plotDetails['pieYear']} 
						data={this.state.plotDetails['sunburst']} 
						target={{'type':'origin'}} 
						ref={this.sunburstOriginRef}
					/>
				</div>
				<Divider section />
				<Grid columns={2} divided>
					<Grid.Row>
						<Grid.Column>
							<div className={['subtitle', 'bold', 'section-margin'].join(' ')} >Which was your most active year?</div>
							<PiePlot data={this.state.plotDetails['pieYear']} target={{'type':'year'}} />
						</Grid.Column>
						<Grid.Column>
							<div className={['subtitle', 'bold', 'section-margin'].join(' ')} >What device did you listen to music on?</div>
							<PiePlot data={this.state.plotDetails['pieDevice']} target={{'type':'device'}} />
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Divider section />
				<div className={['subtitle', 'bold', 'section-margin'].join(' ')} >Do you skip tracks a lot?</div>
				<div>
					<BarPlot data={this.state.plotDetails['barPlot']} target={{'type':'skippedRatio', 'unit':'percent'}} ref={this.barSkippedRef} />
				</div>
			</div>
		)
	}


	renderGraphTabTwo = () => {
		return (
			<div className='grid-two'>
				<div className={['subtitle', 'bold', 'section-margin'].join(' ')}>What is your favourite....</div>
				<div className='grid-calendar'>
					<div className='grid-one' >
						<RankingList data={this.state.plotDetails['rankingDict']} target={{'type':'genre', 'numItems':5}} ref={this.rankingRef} />
						<SunburstPlot 
							className='grid-one' 
							ranking={this.state.plotDetails['pieYear']} 
							data={this.state.plotDetails['sunburst']} 
							target={{'type':'genre'}} 
							ref={this.sunburstSongRef}
						/>
					</div>
					<div className={['grid-two', 'filter-query'].join(' ')} >
						<SunburstPlotFilter target='genre' onChange={this.onSelectPlot} />
						<div style={{marginTop:'10%'}}>
							<p className='bold'>Explore more filters:</p>
							<QueryFilter 
								data={this.state.plotDetails['filters']} 
								target={{'type':'sunburst', 'plot':''}} 
								onQuery={this.onQuerySubmit} 
								onReset={this.onQueryReset}
								ref={this.queryFavouritesRef}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}


	renderGraphTabThree = () => {
		return (
			<div className='grid-two'>
				<div className={['subtitle', 'bold', 'section-margin'].join(' ')}>Focus on your daily listening time</div>
				<div className='grid-calendar'>
					<div className='grid-one'>
						<HeatMapPlot data={this.state.plotDetails['heatMapPlot']} target={{'type':'DOM'}} ref={this.heatMapRef} />
					</div>
					<div className={['grid-two', 'filter-query'].join(' ')} >
						<div>
							<CalendarPlotFilter target='DOM' onChange={this.onSelectPlot} />
						</div>
						<div style={{marginTop:'10%'}}>
							<p className='bold'>Explore more filters:</p>
							<QueryFilter 
								data={this.state.plotDetails['filters']} 
								target={{'type':'heatMap'}} 
								onQuery={this.onQuerySubmit}
								onReset={this.onQueryReset}
								ref={this.queryHeatMapRef}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderGraphsPage = () => {
		let elemToRender;

		if ( !this.state.hasVisuals ) {
			if (this.state.isLoading) {
				elemToRender = (
					<div style={{display:'block'}}>
						<Overlay onClose={this.displayOverlay} params={{'type':'loader'}} ref={this.overlayRef}/>
					</div>
				)
			}
		} else {
			elemToRender = (
				<div className='content'>
					<div className={['bold', 'title', 'centered-content', 'page-title'].join(' ')}>Visualizations</div>
					<div className={['data-source', 'section-margin'].join(' ')}>
						Your data source : <b>{localStorage.getItem('archiveName')}</b>
					</div>
					<Tabs className={['grid-tabs'].join(' ')} defaultIndex={1} forceRenderTabPanel={true} onSelect={this.switchTab} >
						<TabList className={['grid-one'].join(' ')}>
							<Tab>Listening patterns</Tab>
							<Tab>Favourites</Tab>
							<Tab>Calendar view</Tab>
						</TabList>

						<TabPanel>
							{this.renderGraphTabOne()}
						</TabPanel>
						<TabPanel>
							{this.renderGraphTabTwo()}
						</TabPanel>
						<TabPanel>
							{this.renderGraphTabThree()}
						</TabPanel>
					</Tabs>
				</div>
			)
		}
		return elemToRender;
	}

	switchTab = (index) => {
		switch (index) {
			case 0:
				this.sunburstOriginRef.current.renderTabSwitch();
				this.barTimeRef.current.renderTabSwitch();
				this.barSkippedRef.current.renderTabSwitch();
				break;
			case 1:
				this.rankingRef.current.renderTabSwitch();
				this.sunburstSongRef.current.renderTabSwitch();
				break;
			case 2:
				this.heatMapRef.current.renderTabSwitch();
				break;
			default:
				break;
		}
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

	renderHelpPage = () => {
		return (
			<div className={['content', 'paragraph'].join(' ')}>
				<div className={['bold', 'title', 'page-title'].join(' ')}>Need help?</div>
				<div className='grid-help'>
					<div className={['grid-one', 'row-one'].join(' ')}>
						<h3>How can you request your data?</h3>
						<p>Log in with your Apple ID from the Apple’s Data and Privacy page and follow the steps to get a copy of your data (you want Apple Media services information).</p>
					</div>
					<div className={['grid-one', 'row-two'].join(' ')}>
						<h3>How to upload your data?</h3>
						<p>You upload the archive Apple provides you, and we take care of the rest! Please pay attention to upload the archive we ask for! <br/>These files will never leave your computer (if you want, disconnect your Wi-Fi connection upon loading the page, everything will still work the same ;)).  Once you selected the archive to use for the analysis, be patient! It can take up to a few minutes to process it all. </p>
					</div>
					<div className={['grid-one', 'row-three'].join(' ')}>
						<h3>Can I add new data points to an existing analysis?</h3>
						<p>Unfortunately, no. It is designed to run on the whole data files, and cannot be edited. But you can always run it again when you have more data points!</p>
					</div>
					<div className={['grid-one', 'row-four'].join(' ')}>
						<h3>Why this dashboard interface?</h3>
						<p>I discovered the fascinated world of data analysis not so long ago, and decided to apply what I learned on something meaningful. I am not a professional developper or data analyst, and did this as a side-project to practice. If you would like to suggest improvements, please share them from the contact form!</p>
					</div>
					<div className={['grid-two', 'row-one'].join(' ')}>
						<h3>How is your data processed?</h3>
						<p>A sequence of scripts is ran on your data to extract relevant information, and plot graphs you can interact with. The source code and exploratory work I did before this page on my own data is visible <a href='https://github.com/acoullandreau/apple_dashboard'>here.</a></p>
					</div>
					<div className={['grid-two', 'row-two'].join(' ')}>
						<h3>Is the analysis saved?</h3>
						<p>Well, kinda…. All the processed data points are saved in your browser. But if you clear your cache, all is cleared. <br/> You can always launch it again, save the page on your computer, or save the graphs as images :) </p>
					</div>
					<div className={['grid-two', 'row-three'].join(' ')}>
						<h3>You have more questions? Get in touch!</h3>
						<p>Feel free to write to me using the form below, providing your email address so that I can answer you!</p>
					</div>
					<ContactForm displayOverlay={this.displayOverlay} />
				</div>
			</div>
		)
	}

	render() {
		let overlay;

		if ( !this.state.hasVisuals & this.state.isLoading) {
			overlay = (
				<div style={{display:'block'}}>
					<Overlay onClose={this.displayOverlay} params={{'type':'loader'}} ref={this.overlayRef}/>
				</div>
			)
		} else {
			if (this.state.overlay.display) {
				overlay = (
					<div style={{display:'block'}}>
						<Overlay onClose={this.displayOverlay} params={this.state.overlay} ref={this.overlayRef}/>
					</div>
				)
			} else {
				overlay = (
					<div style={{display:'none'}}>
						<Overlay onClose={this.displayOverlay} params={this.state.overlay} ref={this.overlayRef}/>
					</div>
				)
			}
		}


		return (
			<div className='page'>
				{ overlay }
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
					<React.Fragment>
						{ this.renderHelpPage() }
					</React.Fragment>
				</Route>
			</div>
		)
	}
}


export default App;
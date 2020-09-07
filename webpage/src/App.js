import React from 'react';
import FileSelector from './FileSelector.js';
import Loader from './Loader.js';
import connectorInstance from './IndexedDBConnector.js';
import PiePlot from './PiePlot.js'; 
import BarPlot from './BarPlot.js'; 
import BarPlotFilter from './BarPlotFilter.js'; 
import HeatMapPlot from './HeatMapPlot.js'; 
import SunburstPlot from './SunburstPlot.js'; 
import SunburstPlotFilter from './SunburstPlotFilter.js'; 
import RankingList from './RankingList.js'; 
import QueryEngine from './QueryEngine.js'; 
import QueryFilter from './QueryFilter.js'; 

class App extends React.Component {

	state = { 
		'archive':'',
		'isLoading': false, 
		'hasVisuals': false, 
		'plotDetails': {}, 
		'selectedBarPlot' : {}, 
		'selectedRankingPlot' : {}, 
		'queryFilters':{}, 
		'queryFiltersDefault':{ 'artist': '', 'genre': '', 'inlib': "", 'offline': "", 'origin': '', 'rating': "", 'skipped': "", 'title': "", 'year': '' } 
	};

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
					this.refs.fileSelector.storeArchive(this.state.archive);
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
			'selectedRankingPlot' : {}, 
			'queryFilters':{}
		});
	} 

	onSelectPlot = (parameters) => {
		var target = parameters.type;
		if (target === 'bar') {
			this.setState({ 'selectedBarPlot': parameters.payload });
		} else if (target === 'sunburst') {
			this.refs.sunburstSong.updatePlot(parameters);
			this.refs.ranking.updatePlot(parameters);
			//console.log(parameters)
			//this.setState({ 'selectedRankingPlot': parameters.payload });
		}
	}

	reloadViz = () => {
		// display loading screen again while visualizations are recomputed
		this.setState({'isLoading': true, 'hasVisuals': false });
		// request from loader to recompute the visualizations
		this.worker.postMessage({'type':'visualization', 'payload':''});
	}

	onVisualizationsReady = (payload) => {
		// visualizations can be rendered, so we update our App state to render the new component
		this.setState({
			'isLoading': false,
			'hasVisuals': true,
			'plotDetails': Object.assign({}, payload.data),
			'selectedBarPlot' : {}, 
			'selectedRankingPlot' : {}, 
		 });
	}

	

	onQueryVisualizationReady = (payload) => {
		console.log(payload)
		// var plotDetails = { ...this.state.plotDetails };
		// var queryParams = payload.context;
		// var data = payload.data;
		
		// if (queryParams.target.type === 'heatMap') {
		// 	//update plotDetails with heatMap
		// 	plotDetails.heatMapPlot = data['heatMapPlot'];
		// 	this.setState({ plotDetails });
		// } else if (queryParams.target.type === 'sunburst') {
		// 	// we update the rankingDict
		// 	plotDetails.rankingDict = data['rankingDict'];
		// 	if (queryParams.target.plot === 'origin') {
		// 		//update plotDetails with sunburst for origin only
		// 		plotDetails.sunburst['origin'] = data['sunburst']['origin'];
		// 		this.setState({ plotDetails });
		// 	} else {
		// 		// update plotDetails with sunburst for genre, artist and title
		// 		plotDetails.sunburst['genre'] = data['sunburst']['genre'];
		// 		plotDetails.sunburst['artist'] = data['sunburst']['artist'];
		// 		plotDetails.sunburst['title'] = data['sunburst']['title'];
		// 		this.setState({ plotDetails }, () => console.log(this.state));
		// 	}
		// }
	}

	updatePlotData = (parameters) => {
		console.log(parameters)
		switch (parameters.target.type) {
			case "sunburst":
				console.log(this.refs)
				break;
			case "ranking":
				break;
			case "heatMap":
				break;
			case "bar":
				break;
		}
		//console.log(this.refs)
		
		// if (parameters.type === 'bar') {
		// 	this.setState({ 'selectedBarPlot': parameters.payload });
		// } else if (parameters.type === 'sunburst') {
		// 	this.setState({ 'selectedRankingPlot': parameters.payload });
		// }
	}


	onQuerySubmit = (parameters) => {
		var isQuery = this.hasQueryFilters(parameters.data);
		if (isQuery) {
			this.setState({ 'queryFilters': parameters });
			this.worker.postMessage({'type':'query', 'payload':parameters});
		} else {
			if (this.state.queryFilters !== {}) {
				// in this case there was a query that is being reseted
				this.onQueryReset(parameters);
			}

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
		console.log(plotTarget)
		//this.updatePlot(plotTarget)
		// console.log('Reset')
		// // we build a payload containing the plotDetailsInit values for the plot being reseted
		// var payload = { 'context':{'data':{}, 'target':plotTarget}, 'data':{} };
		// if (plotTarget.type === 'heatMapPlot') {
		// 	payload['data']['heatMapPlot'] = Object.assign({}, this.state.plotDetailsInit['heatMapPlot']);
		// } else if (plotTarget.type === 'sunburst') {
		// 	payload['data']['rankingDict'] = Object.assign({}, this.state.plotDetailsInit['rankingDict']);
		// 	payload['data']['sunburst'] = {};
		// 	if (plotTarget.plot === 'origin') {
		// 		payload['data']['sunburst']['origin'] = Object.assign({}, this.state.plotDetailsInit['sunburst']['origin']);
		// 	} else {
		// 		payload['data']['sunburst']['genre'] = Object.assign({}, this.state.plotDetailsInit['sunburst']['genre']);
		// 		payload['data']['sunburst']['artist'] = Object.assign({}, this.state.plotDetailsInit['sunburst']['artist']);
		// 		payload['data']['sunburst']['title'] = Object.assign({}, this.state.plotDetailsInit['sunburst']['title']);
		// 	}
		// }
		// this.onQueryVisualizationReady(payload);
	}


	renderTimeBarPlot = () => {
		if (Object.keys(this.state.selectedBarPlot).length === 0) {
			return (
				<div>
					<BarPlot data={this.state.plotDetails['barPlot']} target={{'type':'month', 'unit':'count'}} ref='barTime' />
					<BarPlotFilter target='month' onChange={this.onSelectPlot} />
				</div>
			)
		} else {
			return (
				<div>
					<BarPlot data={this.state.plotDetails['barPlot']} target={this.state.selectedBarPlot} ref='barTime' />
					<BarPlotFilter target={this.state.selectedBarPlot} onChange={this.onSelectPlot} />
				</div>
			)
		}

	}


	renderRankingPlot = () => {
		if (Object.keys(this.state.selectedRankingPlot).length === 0) {
			return (
				<div>
					<SunburstPlot data={this.state.plotDetails['sunburst']} target={{'type':'genre'}} ref='sunburstSong'/>
					<SunburstPlotFilter target='genre' onChange={this.onSelectPlot} />
					<RankingList data={this.state.plotDetails['rankingDict']} target={{'type':'genre', 'numItems':5}} ref='ranking' />
				</div>
			)
		} else {
			return (
				<div>
					<SunburstPlot data={this.state.plotDetails['sunburst']} target={this.state.selectedRankingPlot} ref='sunburstSong' />
					<SunburstPlotFilter target={this.state.selectedRankingPlot} onChange={this.onSelectPlot} />
					<RankingList data={this.state.plotDetails['rankingDict']} target={this.state.selectedRankingPlot} ref='ranking' />
				</div>
			)
		}
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
					<div>
						<QueryFilter 
							data={this.state.plotDetails['filters']} 
							target={{'type':'sunburst', 'plot':''}} 
							onQuery={this.onQuerySubmit} 
							onReset={this.onQueryReset}
						/>
					</div>
					<div>
						{ this.renderRankingPlot() }
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
						<HeatMapPlot data={this.state.plotDetails['heatMapPlot']} target={{'type':'DOM'}} ref='heatMapDOM' />
						<HeatMapPlot data={this.state.plotDetails['heatMapPlot']} target={{'type':'DOW'}} ref='heatMapDOW' />
					</div>
					<div> 
						<div>
							<div>
								<PiePlot data={this.state.plotDetails['pieYear']} target={{'type':'year'}} ref='pieYear' />
								<PiePlot data={this.state.plotDetails['pieDevice']} target={{'type':'device'}} ref='pieDevice' />
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
						<SunburstPlot data={this.state.plotDetails['sunburst']} target={{'type':'origin'}} ref="sunburstOrigin"/>
					</div>
					<div> 
						<div>
							<BarPlot data={this.state.plotDetails['barPlot']} target={{'type':'skippedRatio', 'unit':'percent'}} ref="barSkipped" />
						</div>
					</div>
				</div>
			)

		} 
		return elemToRender;

	}

	render() {
		// console.log('Render')
		// console.log(this.state)
		// console.log('End Render')
		return (
			<div>
				<div><FileSelector onFileLoad={this.onFileLoad} onReset={this.onReset} ref="fileSelector" /></div>
				{ this.renderScreen() }
			</div>

		)
	}
}

export default App;
import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';


class HeatMapPlot extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type, 'renderNone':false, 'firstRender':true }
	}

	renderTabSwitch() {
		//this function is used to force a rerender of the component (to call Plotly.relayout / Plotly.react), so the svg has the right layout
		if (this.state.firstRender) {
			this.setState({'firstRender':false});
		}
	}

	updatePlot(parameters) {
		var data;
		if ('data' in parameters) {
			// check is there is a match to plot
			var heatMapHasUpdate = parameters.data.heatMapPlot.heatMapDOW?Object.keys(parameters.data.heatMapPlot.heatMapDOW):false
			if (heatMapHasUpdate.length > 0) {
				//we expect this update to concern the data (query)
				data = parameters.data.heatMapPlot;
				this.setState({ 'data':data });
			}
			else {
				this.setState({ 'renderNone':true });
				this.props.onError({
					'display':true, 
					'hash':'#graphs', 
					'type':'graph', 
					'title':'No matching result', 
					'message':'There is no match to the filters you selected. Please try another query!'
				})
			}
		} else {
			// it is just a new selection of the plot to render
			this.setState({'type':parameters.payload.type});
		}
	}
	
	resetPlot() {
		var data = this.state.initialData;
		this.setState({ 'data':data, 'renderNone':false });
	}

	getLabels(targetDataName) {
		return plotConfig.heatMapPlot[targetDataName]['labels'];
	}

	getHoverTemplate(year) {
		if (this.state.type === 'DOM') {
			return ("<b>%{y} %{x}</b><b> "+ year.toString()+"<b><br>" +
					"Time listening: %{z:,.0f} minutes<br>" +
					"<extra></extra>")
		} else if (this.state.type === 'DOW') {
			return (year.toString()+" - %{x}s, %{y}h<b><br>" +
					"Time listening: %{z:,.0f} minutes<br>" +
					"<extra></extra>")
		}
	}

	getMaxValue(targetData) {
		var maxValue = 0;
		for (var year in targetData) {
			var values = Object.values(targetData[year]['sums']);
			var yearMax = Math.max(...values)
			if (yearMax > maxValue) {
				maxValue = yearMax
			}
		}
		return maxValue;
	}


	getPlotContent(targetDataName) {
		var traces = {};
		var targetData = this.state.data[targetDataName];
		var xbins = plotConfig.heatMapPlot[targetDataName]['xbins'];
		var ybins = plotConfig.heatMapPlot[targetDataName]['ybins'];
		var colors = plotConfig.heatMapPlot['colors'];
		var maxValue = this.getMaxValue(targetData);
		
		for (var year in targetData) {
			var x = targetData[year]['x'];
			var y = targetData[year]['y'];
			var z = targetData[year]['z'];
			var trace = {
				x: x,
				y: y,
				z:z,
				histfunc:"sum",
				type: 'histogram2d',
				autobinx: false,
				xbins:xbins,
				autobiny: false,
				ybins:ybins,
				hovertemplate : this.getHoverTemplate(year),
				colorscale: colors,
				colorbar:{
					bordercolor:"#F7F7ED",
					thickness:"10"
				},
				zmin:0,
				zmax:maxValue,
				xgap:1,
				ygap:1
			}
			traces[year]=trace;
		}
		return traces;
	}



	renderPlot() {
		var targetDataName = 'heatMap'+this.state.type;
		var plots = this.getPlotContent(targetDataName);
		var xaxis = plotConfig.heatMapPlot[targetDataName]['xaxis'];
		var yaxis = plotConfig.heatMapPlot[targetDataName]['yaxis'];
		var histPlots = [];

		for (var plot in plots) {
			histPlots.push(
				(<React.Fragment>
					<Plot
						data={[plots[plot]]}
						layout={{
							title: plot, 
							autosize:true, 
							xaxis:xaxis, 
							yaxis:yaxis,
							paper_bgcolor: '#F7F7ED',
							plot_bgcolor: 'rgba(0,0,0,0.1)',
							margin:{t:"40"},
							font:{size:'11'}
						}}
						style={{width:'100%', marginTop:'3%', minHeight:'80vh'}}
						config = {{
							responsive: 'true',
							toImageButtonOptions: {
								filename: 'calendar-view-'+this.state.type,
								width:1200,
								height:800,
							},
							modeBarButtonsToRemove: [
								'hoverClosestCartesian', 
								'hoverCompareCartesian', 
								'zoom2d', 
								'zoomIn2d', 
								'zoomOut2d', 
								'autoScale2d', 
								'toggleHover',
								'toggleSpikelines'
							],
							displaylogo: false
						}}
					/>
				</React.Fragment>)
			)

		}
		return (
			<ul>
				{
					histPlots.map((item, i) => <li key={i}>{item}</li>)
				}
			</ul>
		)
		
	}

	render() {
		return (
			<React.Fragment>
				{this.renderPlot()}
			</React.Fragment>
		);
	}

}

// props validation
HeatMapPlot.propTypes = {
	onError:PropTypes.func.isRequired,
	target: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
}


export default HeatMapPlot;

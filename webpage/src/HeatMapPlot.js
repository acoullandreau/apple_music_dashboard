import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';


class HeatMapPlot extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type, 'renderNone':false }
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
			}
		} else {
			// it is just a new selection of the plot to render
			data = this.state.initialData
			this.setState({'data':data, 'type':parameters.payload.type});
		}
	}
	
	resetPlot() {
		console.log(this.state)
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
				zmax:maxValue
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
				(<div>
					<Plot
						data={[plots[plot]]}
						layout={{
							title: plot, 
							autosize:true, 
							xaxis:xaxis, 
							yaxis:yaxis,
							paper_bgcolor: 'rgba(0,0,0,0)',
							margin:{t:"40"},

						}}
						style={{marginTop:'3%', minHeight:'60vh'}}
						config = {{responsive: 'true'}}
					/>
				</div>)
			)

		}

		return (<div>
			<ul style={{paddingInlineStart:"0"}}>
				{
					histPlots.map((item, i) => <li key={i} style={{listStyleType:"none"}}>{item}</li>)
				}
			</ul>
		  </div>
		)
		
	}

	render() {
		if (this.state.renderNone) {
			return (
				<div>
					<p>There is no match to the filters you selected. Please try another query!</p>
				</div>
			);
		} else {
			console.log(this.state)
			return (
				<div>
					<div>{this.renderPlot()}</div>
				</div>
			);
		}
	}

}

// props validation
HeatMapPlot.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
}


export default HeatMapPlot;

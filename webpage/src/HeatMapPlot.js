import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';


class HeatMapPlot extends React.Component {

	getLabels(targetDataName) {
		return plotConfig.heatMapPlot[targetDataName]['labels'];
	}

	getPlotContent(targetDataName) {
		var traces = [];
		var targetData = this.props.data[targetDataName];
		var xbins = plotConfig.heatMapPlot[targetDataName]['xbins'];
		var ybins = plotConfig.heatMapPlot[targetDataName]['ybins'];
		var labels = plotConfig.heatMapPlot[targetDataName]['labels'];
		var i = 1;

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
				hovertemplate : ("<b>%{y} %{x}</b><b> "+ year.toString()+"<b><br>" +
	            				"Time listening: %{z:,.0f} minutes<br>" +
	            				"<extra></extra>")
			}
			traces.push(trace);
			//i++;
		}
				// xaxis:'x'+i.toString(),
				// yaxis:'y'+i.toString(),
		console.log(traces)
		return traces;
	}



	renderPlot() {
		var targetDataName = 'heatMap'+this.props.target.type;
		var data = this.getPlotContent(targetDataName);
		var title = plotConfig.heatMapPlot[targetDataName]['title'];
		var xaxis = plotConfig.heatMapPlot[targetDataName]['xaxis'];
		var yaxis = plotConfig.heatMapPlot[targetDataName]['yaxis'];
		// var style = plotConfig.heatMapPlot['heatMap'+targetDataName]['style'];

		var histPlot = (
			<Plot
			  data={data}
			  layout={{
			  	title: title, 
			  	autosize:true, 
			  	xaxis:xaxis, 
			  	yaxis:yaxis,
			  }}
			/>
		)
			  	//grid: {rows: 5, columns: 1, pattern: 'independent'}

		return histPlot;
	}

	render() {
		return (
			<div>
				<div>{this.renderPlot()}</div>
			</div>
		);
	}

}

export default HeatMapPlot;

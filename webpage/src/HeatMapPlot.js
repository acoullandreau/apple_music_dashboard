import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';


class HeatMapPlot extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 'initialData': this.props.data, 'data':this.props.data, 'type':this.props.target.type }
	}

	updatePlot(parameters) {
		if ('data' in parameters) {
			//we expect this update to concern the data (query)
			var data = parameters.data.heatMapPlot;
			this.setState({ 'data':data });
		} else {
			// it is just a new selection of the plot to render
			var data = this.state.initialData
			this.setState({'data':data, 'type':parameters.payload.type});
		}
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


	getPlotContent(targetDataName) {
		var traces = {};
		var targetData = this.state.data[targetDataName];
		var xbins = plotConfig.heatMapPlot[targetDataName]['xbins'];
		var ybins = plotConfig.heatMapPlot[targetDataName]['ybins'];
		var labels = plotConfig.heatMapPlot[targetDataName]['labels'];

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
				hovertemplate : this.getHoverTemplate(year)
			}
			traces[year]=trace;
		}

		return traces;
	}



	renderPlot() {
		var targetDataName = 'heatMap'+this.state.type;
		var plots = this.getPlotContent(targetDataName);
		var title = plotConfig.heatMapPlot[targetDataName]['title'];
		var xaxis = plotConfig.heatMapPlot[targetDataName]['xaxis'];
		var yaxis = plotConfig.heatMapPlot[targetDataName]['yaxis'];
		// var style = plotConfig.heatMapPlot['heatMap'+targetDataName]['style'];
		var histPlots = [];

		for (var plot in plots) {
			histPlots.push(
				(<div><Plot
				  data={[plots[plot]]}
				  layout={{
				  	title: plot, 
				  	autosize:true, 
				  	xaxis:xaxis, 
				  	yaxis:yaxis,
				  }}
				/></div>)
			)

		}


		return (<div>
		    <ul>
		      {
		        React.Children.toArray(
		          histPlots.map((item, i) => <li style={{listStyleType:"none"}}>{item}</li>)
		        )
		      }
		    </ul>
		  </div>
		)
		
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

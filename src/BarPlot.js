import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';


class BarPlot extends React.Component {

	state = {'firstRender':true};

	renderTabSwitch() {
		//this function is used to force a rerender of the component (to call Plotly.relayout / Plotly.react), so the svg has the right layout
		if (this.state.firstRender) {
			this.setState({'firstRender':false});
		}
	}

	getLabels(targetDataName) {
		return plotConfig.barPlot[targetDataName]['labels'];
	}

	getLegend() {
		if (this.props.target.type !== 'skippedRatio') {
			return {orientation:"h"};
		} else {
			return {};
		}
	}

	getRefTargetData() {
		var type = this.props.target.type;
		var targetType;
		var unit = this.props.target.unit;
		var targetUnit = unit[0].toUpperCase() + unit.slice(1);

		if (type === 'month' || type === 'skippedRatio') {
			targetType = type[0].toUpperCase() + type.slice(1);
		} else {
			targetType = type.toUpperCase();
		}

		var targetData = 'bar' + targetType + targetUnit;
		return targetData;

	}


	getPlotContent(targetDataName) {
		var traces = [];
		var targetData = this.props.data[targetDataName];
		var labels;


		if (this.props.target.type === 'skippedRatio') {
			var partials = [];
			var completes = [];
			labels = Object.keys(targetData);
			for (var yearSkipped in targetData) {
				partials.push(targetData[yearSkipped]['partial'])
				completes.push(targetData[yearSkipped]['complete'])
			}
			var tracePartials = {
				x: labels,
				y: partials,
				name: 'Partial listening',
				type: 'bar',
				marker: {color: '#214A76'}
			};
			traces.push(tracePartials);
			var traceCompletes = {
				x: labels,
				y: completes,
				name: 'Complete listening',
				type: 'bar',
				marker: {color: '#F1B05D'}
			};
			traces.push(traceCompletes);

		} else {
			labels = this.getLabels(targetDataName);
			var colors = plotConfig.barPlot["colors"];
			var k = 0;
			for (var year in targetData) {
				var values = Object.values(targetData[year]);
				var trace = {
					x: labels,
					y: values,
					name: year,
					type: 'bar',
					marker:{color:colors[k]}
				}
				traces.push(trace)
				k++;
			}

		}

		return traces;
	}

	renderPlot() {
		var targetDataName = this.getRefTargetData();
		var barmode = plotConfig.barPlot[targetDataName]['barmode'];
		var xaxis = plotConfig.barPlot[targetDataName]['xaxis'];
		var yaxis = plotConfig.barPlot[targetDataName]['yaxis'];
		var data = this.getPlotContent(targetDataName);
		var legend = this.getLegend();

		var barPlot = (
			<Plot
				data={data}
				layout={{
					barmode: barmode, 
					autosize:true, 
					xaxis:xaxis, 
					yaxis:yaxis, 
					paper_bgcolor: 'rgba(0,0,0,0)',
					plot_bgcolor: 'rgba(0,0,0,0)',
					margin:{t:"40", pad:"10"},
					legend:legend,
					font:{size:'11'}
				}}
				style={{width:'100%', minHeight:'60vh'}}
				config = {{
					responsive: 'true',
					toImageButtonOptions: {
						width:1200,
						height:800,
						filename: 'bar-chart-'+this.props.target.type,
					},
					modeBarButtonsToRemove: [
						'hoverClosestCartesian', 
						'hoverCompareCartesian', 
						'zoom2d',
						'lasso2d', 
						'zoomIn2d', 
						'zoomOut2d', 
						'autoScale2d',
						'toggleHover',
						'toggleSpikelines'
					],
					displaylogo: false
				}}
			/>
		)

		return barPlot;
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
BarPlot.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
}


export default BarPlot;

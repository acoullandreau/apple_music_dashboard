import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';


class BarPlot extends React.Component {

	getLabels(targetDataName) {
		return plotConfig.barPlot[targetDataName]['labels'];
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
				type: 'bar'
			};
			traces.push(tracePartials);
			var traceCompletes = {
				x: labels,
				y: completes,
				name: 'Complete listening',
				type: 'bar'
			};
			traces.push(traceCompletes);

		} else {
			labels = this.getLabels(targetDataName);
			for (var year in targetData) {
				var values = Object.values(targetData[year]);
				var trace = {
					x: labels,
					y: values,
					name: year,
					type: 'bar'
				}
				traces.push(trace)
			}

		}

		return traces;
	}

	renderPlot() {
		var targetDataName = this.getRefTargetData();
		//var title = plotConfig.barPlot[targetDataName]['title'];
		var barmode = plotConfig.barPlot[targetDataName]['barmode'];
		var xaxis = plotConfig.barPlot[targetDataName]['xaxis'];
		var yaxis = plotConfig.barPlot[targetDataName]['yaxis'];
		var data = this.getPlotContent(targetDataName);

		var barPlot = (
			<Plot
				data={data}
				layout={{
					barmode: barmode, 
					autosize:true, 
					xaxis:xaxis, 
					yaxis:yaxis, 
					paper_bgcolor: 'rgba(0,0,0,0)', 
					plot_bgcolor: 'rgba(0,0,0,0)'
				}}
				style={{width:'100%', minHeight:'60vh'}}
				config = {{responsive: 'true'}}
			/>
		)

		return barPlot;
	}


	render() {
		return (
			<div>
				{this.renderPlot()}
			</div>
		);
	}
}

// props validation
BarPlot.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
}


export default BarPlot;

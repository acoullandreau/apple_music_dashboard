import React from 'react';
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

		if (this.props.target.type === 'skippedRatio') {
			var partials = [];
			var completes = [];
			var labels = Object.keys(targetData);
			for (var year in targetData) {
				partials.push(targetData[year]['partial'])
				completes.push(targetData[year]['complete'])
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
			var labels = this.getLabels(targetDataName);
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
		var title = plotConfig.barPlot[targetDataName]['title'];
		var barmode = plotConfig.barPlot[targetDataName]['barmode'];
		var xaxis = plotConfig.barPlot[targetDataName]['xaxis'];
		var yaxis = plotConfig.barPlot[targetDataName]['yaxis'];
		var data = this.getPlotContent(targetDataName);
		var style = plotConfig.barPlot[targetDataName]['style'];

		var barPlot = (
			<Plot
			  data={data}
			  layout={{title: title, barmode: barmode, autosize:true, xaxis:xaxis, yaxis:yaxis}}
			  style={style}
			/>
		)

		return barPlot;
	}


	render() {
		return (
			<div style={{ width:"50%"}}>
				<div>{this.renderPlot()}</div>
			</div>
		);
	}
}

export default BarPlot;

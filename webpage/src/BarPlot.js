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
		var data = this.getPlotContent(targetDataName);

		var barPlot = (
			<Plot
			  data={data}
			  layout={{title: title, barmode: barmode, autosize:true}}
			  style={{width: "100%", height: "100%"}}
			/>
		)

		return barPlot;
	}


	render() {
		return (
			<div>
				<div>{this.renderPlot()}</div>
			</div>
		);
	}
}

export default BarPlot;

	// type  'month', 'DOM', 'DOW', 'HOD', 'skipped'
	// barmode : group, stack
	// use traces, one trace per year and data = array(traces)
	// y-axis absolute count or percentage 
	// var trace1 = {
	//   x: ['giraffes', 'orangutans', 'monkeys'],
	//   y: [20, 14, 23],
	//   name: 'SF Zoo',
	//   type: 'bar'
	// };

	// var trace2 = {
	//   x: ['giraffes', 'orangutans', 'monkeys'],
	//   y: [12, 18, 29],
	//   name: 'LA Zoo',
	//   type: 'bar'
	// };

	// var data = [trace1, trace2];

	// var layout = {barmode: 'group'};



	  // <Plot
	  //   data={[
	  //     {
	  //       x: [1, 2, 3],
	  //       y: [2, 6, 3],
	  //       type: 'scatter',
	  //       mode: 'lines+markers',
	  //       marker: {color: 'red'},
	  //     },
	  //     {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
	  //   ]}
	  //   layout={{width: 320, height: 240, title: 'A Fancy Plot'}}
	  // />
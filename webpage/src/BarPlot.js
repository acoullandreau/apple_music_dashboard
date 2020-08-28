import React from 'react';
import Plot from 'react-plotly.js';
import plotConfig from './plotConfig.json';


class BarPlot extends React.Component {

	getLabels(target, year) {
		if (target === 'month') {
			return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
		} else if (target === 'dow') {
			return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		} else {
			return Object.keys(this.props.data.data[year]);
		}
	}


	getPlotContent() {
		var traces = [];
		var labels = this.getLabels(this.props.target, year);
		for (var year in this.props.data.data) {
			var values = Object.values(this.props.data.data[year]);
			var trace = {
				x: labels,
				y: values,
				name: year,
				type: 'bar'
			}
			traces.push(trace)
		}

		return traces;
	}

	renderPlot() {
		var data = this.getPlotContent();
		var title = this.props.data.title;
		var layout;
		var type;

		switch (this.props.target) {
			// case 'month':
			// 	type = 'group';
			// 	break;
			// case 'dom':
			// 	break;
			// case 'dow':
			// 	break;
			// case 'hod':
			// 	break;
			case 'skipped':
				type = 'stack';
				break;
			default:
				type = 'group';
				break;

		}

		var barPlot = (
			<Plot
			  data={data}
			  layout={{title: title, barmode: type}}
			/>
		)

		return barPlot;

		
	}


	render() {
		
		return (
			<div>
				<div>BarPlot</div>
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
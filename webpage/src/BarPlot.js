import React from 'react';
import Plot from 'react-plotly.js';

class BarPlot extends React.Component {

	componentDidMount() {
		console.log(this.props)
	}

	componentDidUpdate(prevProps) {
		if(this.props.data !== prevProps.data) {
			this.updateUser();
		}
	} 

	render() {
		return (
		  <div>BarPlot</div>
		  // <Plot
		  //   data={[
		  //     {
		  //       x: this.props.values,
		  //       y: this.props.labels,
		  //       type: 'bar',
		  //     },
		  //   ]}
		  //   layout={{title: this.props.title, barmode: this.props.barmode}}
		  // />
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
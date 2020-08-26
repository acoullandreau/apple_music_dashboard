import React from 'react';
import Plot from 'react-plotly.js';

class PiePlot extends React.Component {

  render() {
    return (
      <Plot
        data={[
          {
            values: this.props.values,
            labels: this.props.labels,
            type: 'pie',
            textinfo: "percent",
            insidetextorientation: "horizontal"
          },
        ]}
        layout={{title: this.props.title}}
      />
    );
  }
}

export default PiePlot;


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
"use strict";

//*------------------------------------------------------------------*

var React = require('react');
var ReactHighcharts = require('react-highcharts');
var Highcharts = ReactHighcharts.Highcharts;
require('highcharts-heatmap')(Highcharts);

//*------------------------------------------------------------------*

var baseOptions = {
  credits: {
    enabled: false
  },
  chart: {
    type: 'scatter',
    zoomType: 'xy',
    borderWidth: 2,
    borderColor: '#30426A'
  },
  title: {
    text: ''
  },
  tooltip: {
    formatter: function () {
      return '<b>' + this.point.name + '</b>';
    }
  },
  xAxis: {
    title: {
      enabled: true,
      text: 'X'
    }
  },
  yAxis: {
    title: {
      text: 'Y'
    }
  },
  legend: {
    layout: 'vertical',
    floating: false,
    align: 'right',
    verticalAlign: 'middle'
  },
  plotOptions: {
    scatter: {
      marker: {
        lineWidth: 1,
        lineColor: 'black'
      }
    },
    series: {
      color: 'grey'
    }
  }
};

var ScatterPlot = React.createClass({
  propTypes: {
      dataset: React.PropTypes.array.isRequired,
      options: React.PropTypes.object.isRequired,
      colorRanges: React.PropTypes.array.isRequired
  },

  render: function(){
    var config = Object.assign({},
      baseOptions,
      this.props.options,
      {series: this.props.dataset},
      {colorAxis: {
        dataClasses: this.props.colorRanges
      }}
    )

    return (
        <ReactHighcharts
          config={config}
          ref="chart"/>
    );
  }
});

module.exports = ScatterPlot;

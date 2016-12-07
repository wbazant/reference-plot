"use strict";

//*------------------------------------------------------------------*

const React = require('react')
const d3 = require('d3')
const ScatterPlot = require('./ScatterPlot.jsx')
const fetchExpressionData = require('./fetchExpressionData.js')


//*------------------------------------------------------------------*
const referencePlotOptions = {
    "chart": {
      "width": 600,
      "height": 600,
      "type": "scatter",
      "zoomType": "xy",
      "borderWidth": 2,
      "borderColor": "#30426A"
    },
    "xAxis": {
      "title": {
        "text": "Latent Variable 1 (Associated with Proliferation)"
      }
    },
    "yAxis": {
      "title": {
        "text": "Latent Variable 1 (Associated with Differentiation)"
      }
    },
    "title": {
      "text": "Th Trend Assignment Probability"
    },
    tooltip: {
      formatter: function () {
        return '<b>' + this.point.name + '</b><br>Assignment Probability: ' + this.point.value
      }
    }
}

const expressionPlotOptions = Object.assign({},
  referencePlotOptions,
  {
    "title": {
      "text": "Gene expression"
    },
    tooltip: {
      formatter: function () {
        return '<b>' + this.point.name + '</b><br>Gene Expression: ' + this.point.value
      }
    }
  }
)

const adjustDatasetWithFetchedExpressionData = function(dataset, expressionData){
  return dataset.map(series => {
    return (
      Object.assign({},
        series,
        {
          data: series.data.map(point =>
             ({
              x:point.x,
              y:point.y,
              name:point.name,
              value: expressionData[point.name] || 0.0
            })
          )
        }
      )
    )
  })
}

const applyColorScaleToDataset = function (dataset, colorScale) {
  return dataset.map(series => {
    return (
      Object.assign({},
        series,
        {
          data: series.data.map(point => (
               Object.assign({}, point, {
                 color: point.value ? colorScale(point.value) : "gainsboro"
               })
             )
          )
        }
      )
    )
  })
}

const expressionPlotData = function (){
  var dataset = adjustDatasetWithFetchedExpressionData(
    require("./cannedGraphData.json"),
    fetchExpressionData()
  );


  var pointValues = dataset.map(function (series) {
    return series.data.map(function (point) {
      return point.value;
    });
  });
  var allValues = [].concat.apply([], pointValues);
  var minValue = d3.min(allValues);
  var maxValue = d3.max(allValues);
  // var meanValue = d3.mean(allValues);
  var meanValue = (maxValue - minValue)/2 + minValue;
  var gradientDomain = [minValue, meanValue, maxValue];
  const colorScale = d3.scaleLinear()
      .domain(gradientDomain)
      .range(["#8cc6ff","#0000ff","#0000b3"]);

  var colorClasses = [{
    from: 0,
    to: 0.0000001,
    color: "gainsboro"
  }];
  var step = (maxValue - minValue) / 10;
  for (var i = minValue; i <= maxValue; i = i + step) {
    if(i>0){
      colorClasses.push({
        from: i,
        to: i + step,
        color: colorScale(i)
      })
    }
  }

  return {
    dataset: applyColorScaleToDataset(dataset,colorScale),
    colorRanges: colorClasses
  }
}

const ReferencePlotContainer = React.createClass({


  render: function () {
    return (
      <div>
        <h2>
          Two plots about science
        </h2>
          <ScatterPlot
            dataset={require("./cannedGraphData.json")}
            options={referencePlotOptions}
            colorRanges={require("./cannedColorRanges.json")} />
          <ScatterPlot
            options={expressionPlotOptions}
            {...expressionPlotData()} />
      </div>
    )
  }
});

module.exports = ReferencePlotContainer;

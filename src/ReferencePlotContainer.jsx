"use strict";

//*------------------------------------------------------------------*

const React = require('react')
const d3 = require('d3')
const range = require(`lodash/range`)
const ScatterPlot = require('./ScatterPlot.jsx')
const fetchExpressionData = require('./fetchExpressionData.js')
const GeneAutocomplete = require('gene-autocomplete')


//*------------------------------------------------------------------*
const referencePlotOptions = {
    "chart": {
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

const expressionPlotOptions = (chosenGene) => Object.assign({},
  referencePlotOptions,
  {
    "title": {
      "text": chosenGene ? "Gene expression: "+chosenGene : "Gene expression"
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

const expressionPlotData = function (chosenGene, expressionData){
  var dataset = adjustDatasetWithFetchedExpressionData(
    require("./cannedGraphData.json"),
    expressionData
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

  const step = (maxValue - minValue) / 10
  const colorClasses = [{
    from: 0,
    to: 0.0000001,
    color: "gainsboro"
  }].concat(
    range(minValue, maxValue, step)
    .filter((i) => i > 0 )
    .map((i) => (
      {
        from: i,
        to: i + step,
        color: colorScale(i)
      }
    ))
  )


  return {
    dataset: applyColorScaleToDataset(dataset,colorScale),
    colorRanges: colorClasses,
    options: expressionPlotOptions(chosenGene)
  }
}

const ReferencePlotContainer = React.createClass({

  getInitialState: function() {
    return {
      expressionPlotData: expressionPlotData("",{}),
      loading: false
    }
  },

  _fetchExpressionPlotData: function (chosenGene) {
    if(chosenGene){
      this.setState({loading: true},
        fetchExpressionData(chosenGene, (expressionData) => {
          this.setState({
            loading: false,
            expressionPlotData: expressionPlotData(chosenGene, expressionData)
          })
        })
      )
    } else {
      this.setState({loading: false, expressionPlotData: expressionPlotData("", {})})
    }
  },


  render: function () {
    return (
      <div>
        <h2>
          Two plots about science
        </h2>
        <div className="row">
          <div className="large-10 large-offset-1 columns">
            <GeneAutocomplete
            onGeneChosen={this._fetchExpressionPlotData}
            suggesterUrlTemplate={"https://www.ebi.ac.uk/gxa/json/suggestions?query={0}&species="}/>
          </div>
        </div>

        <div className="row">
          <div className="small-12 medium-6 columns">
            <ScatterPlot
              dataset={require("./cannedGraphData.json")}
              options={referencePlotOptions}
              colorRanges={require("./cannedColorRanges.json")} />
          </div>
          <div className="small-12 medium-6 columns">
            { this.state.loading
              ? <div>
                  <img src={"https://www.ebi.ac.uk/gxa/resources/images/loading.gif"}/>
                </div>
              : <ScatterPlot
                {...this.state.expressionPlotData} />
            }

          </div>
        </div>
      </div>
    )
  }
});

module.exports = ReferencePlotContainer;

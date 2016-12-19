"use strict";

//*------------------------------------------------------------------*

const React = require('react')
const d3 = require('d3')
const range = require(`lodash/range`)
const ScatterPlot = require('./ScatterPlot.jsx')
const fetchExpressionData = require('./fetchExpressionData.js')

const _groupBy = require(`lodash/groupBy`)

import {DropdownButton, MenuItem} from 'react-bootstrap'
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
        "text": "Latent Variable 1"
      }
    },
    "yAxis": {
      "title": {
        "text": "Latent Variable 2"
      }
    },
    tooltip: {
      formatter: function () {
        return '<b>' + this.point.label + '</b>'
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
    {},//require("./cannedGraphData.json"),
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

const getSeriesMap = (clustersChosen) => (
   new Map(require('./clusters.json')[clustersChosen] || [])
)

const colors = ['red', '#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9',
              '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];

const getDataSeries = (m) => {
  const seriesGroups = _groupBy(require('./tsne-coords.json'), (point) => m.get(point.label))
  const result = []
  for(let ix of Object.keys(seriesGroups)) {
    result[ix] = {
      name: "Cluster "+ix,
      color: colors[ix],
      data: seriesGroups[ix]
    }
  }
  return result
}


const ReferencePlotContainer = React.createClass({

  propTypes: {
    referenceDataSourceUrlTemplate: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {
      clustersChosen: Object.keys(require('./clusters.json')).sort()[0]
    }
  },

  _fetchExpressionPlotData: function (chosenItem) {
    if(chosenItem.value){
      const url = this.props.referenceDataSourceUrlTemplate.replace(/\{0\}/, JSON.stringify([chosenItem]))
      this.setState({loading: true},
        fetchExpressionData(chosenItem,url, (expressionData) => {
          this.setState({
            loading: false,
            expressionPlotData: expressionPlotData(chosenItem.value, expressionData)
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
        <h5>
          Reference plot and gene expression
        </h5>
        <div className="row">
        <DropdownButton title="Clustering results" id="bg-nested-dropdown">
          {
            Object.keys(require('./clusters.json'))
            .sort()
            .map((name, ix)=> (
              <MenuItem
                key={ix}
                onClick={()=>this.setState({clustersChosen: name})}
                eventKey={ix}>{name}</MenuItem>
            ))
          }
        </DropdownButton>
        <ScatterPlot
          dataset={getDataSeries(getSeriesMap(this.state.clustersChosen))}
          options={referencePlotOptions}
        />
        </div>
      </div>
    )
  }
});

module.exports = ReferencePlotContainer;

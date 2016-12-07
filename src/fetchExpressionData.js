"use strict";

const cannedData = require("./cannedGraphData.json")

const allNames = [].concat.apply([], cannedData.map((series)=>{
  return (
    series.data.map((point)=> point.name)
  )
}))

const randomExpressionValue = function () {
  //https://gist.github.com/nicolashery/5885280
  return Math.random()> 0.3 ? -Math.log(Math.random()) : 0.0;
}

const randomData = function() {
  var result = {};

  allNames.forEach((name)=>{
    result[name] = randomExpressionValue()
  })
  return result;
}


module.exports = randomData;

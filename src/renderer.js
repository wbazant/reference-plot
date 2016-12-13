"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

//*------------------------------------------------------------------*

var ReferencePlotContainer = require('./ReferencePlotContainer.jsx');


exports.render = function(options) {

    ReactDOM.render(
        React.createElement(
            ReferencePlotContainer,
            {referenceDataSourceUrlTemplate: options.referenceDataSourceUrlTemplate}
        ),
        (typeof options.target === "string") ? document.getElementById(options.target) : options.target
    );
};

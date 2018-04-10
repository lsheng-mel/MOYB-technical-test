'use strict';

var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

var healthcheck = require("express-healthcheck");

var metadata = require('./package.json');

// root endpoint
app.get("/", function(req, res){
	res.send("Hello World!");
});

// health endpoint
app.use('/health', healthcheck(
{
	healthy: function() {
		return { Server: 'is up and running'};
	}
}));

// metadata endpoint
app.get("/metadata", function(req, res){
	var data = {
		"myapplication" : [
			{
				"version": `${metadata.version}`,
				"description" : `${metadata.description}`
			}
		]
	};

	res.send(data);
});

app.listen(port, function(){
	console.log(`The API service started at port ${port}`);
});
'use strict';

var expect = require("chai").expect;
var request = require("request");

// expected data for metadata endpoint
var metadata = require('../package.json');

// groupd the test into endpoints
describe('Endpoints:', function() {
	// the root endpoint
	describe('Root', function(){
		 // status
		it('status', function(done){
			request('http://localhost:3000', function(error, response, body)
			{
				expect(response.statusCode).to.equal(200);
				done();
			});
		});

		// content
		it('content', function(done){
			request('http://localhost:3000', function(error, response, body)
			{
				expect(body).to.equal("Hello World!");
				done();
			});
		});
	});

	// the health endpoint
	describe('Health', function(){
		// status
		it('status', function(done){
			request('http://localhost:3000/health', function(error, response, body)
			{
				expect(response.statusCode).to.equal(200);
				done();
			});
		});

		// content
		it('content', function(done){
			request('http://localhost:3000/health', function(error, response, body)
			{
				const expectedHealthData = { Server: 'is up and running'};

				// compare the two objects
				expect(JSON.parse(body)).to.deep.equal(expectedHealthData);
				done();
			});
		});
	});

	// metadata endpoint
	describe('Metadata', function(){
		it('status', function(done){
			request('http://localhost:3000/metadata', function(error, response, body)
			{
				expect(response.statusCode).to.equal(200);
				done();
			});
		});

		it('content', function(done){
			request('http://localhost:3000/metadata', function(error, response, body)
			{
				const expectedMetaData = {
					"myapplication" : [
					{
						"version": `${metadata.version}`,
						"description" : `${metadata.description}`
					}
					]
				};

				// compare the two objects
				expect(JSON.parse(body)).to.deep.equal(expectedMetaData);
				done();
			});
		});
	});
});






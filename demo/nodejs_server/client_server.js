/**
 * This is only an example
 *
 * To run this example you need NodeJS.
 *
 * npm install (to install package dependencies)
 * node client_server (to run server)
 *
 * You can change the route to bower_components, or install bower in preloadjs/
 */
var fs = require("fs");
var path = require("path");
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var _ = require('lodash');
var port = 3000;

app.use('/scripts', express.static(path.join(__dirname, 'app/scripts')));
app.use('/vendors', express.static(path.join(__dirname, 'app/vendors')));
app.use('/components', express.static(path.join(__dirname, 'app/components')));
app.use('/styles', express.static(path.join(__dirname, 'app/styles')));
app.use('/images', express.static(path.join(__dirname, 'app/images')));
app.use('/bower_components', express.static(path.join(__dirname, '../../bower_components')));//Take bower_components from preloadjs/bower_components
app.use('/dist', express.static(path.join(__dirname, '../../dist')));
app.use('/src', express.static(path.join(__dirname, '../../src')));//If you are development in this project, you want this here

app.use(bodyParser.json());

app.get('/', function(req, res, next){
	res.sendFile(path.join(__dirname, '/app/index.html'));
});

//Read all files and return data in one request
app.post('/allInOne', function(req, res, next){
	var urls = req.body.urls ? req.body.urls : [];

	console.log(req.body);

	var data = {};

	var done = _.after(_.size(urls), function(){
		console.log("all loaded");
		res.send(data);
	});

	var callback = function(url, content){
		data[url] = content;
		done();
	};

	_.forEach(urls, function(url){
		readFile(url, callback);
	});

	function readFile(file, callback){
		fs.readFile(path.join(__dirname, 'app', file), 'utf-8', function read(err, data) {
			if (err) {
				throw err;
			}
			callback(file, data);
		});
	}
});

app.listen(port, function(){
	console.log('Listen on port', port);
});
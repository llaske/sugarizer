// Sugarizer server

var express = require('express'),
	settings = require('./settings'),
	activities = require('./routes/activities');

var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

// Load settings
settings.load(function(ini) {
	// Load activities
	activities.load(ini);
	
	// Register activities list API
	app.get("/activities", activities.findAll);
	app.get("/activities/:id", activities.findById);

	// Start listening
	app.listen(ini.web.port);
	console.log("Sugarizer server listening on port "+ini.web.port+"...");
});


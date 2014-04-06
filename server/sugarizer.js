// Sugarizer server

var express = require('express'),
	settings = require('./settings'),
	activities = require('./routes/activities'),
	journal = require('./routes/journal'),
	users = require('./routes/users');

var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

// Load settings
settings.load(function(ini) {
	// Init modules
	activities.load(ini);
	journal.init(ini);
	users.init(ini);
	
	// Register activities list API
	app.get("/activities", activities.findAll);
	app.get("/activities/:id", activities.findById);
	
	// Register users API
	app.get("/users", users.findAll);
	app.get("/users/:uid", users.findById);
	app.post("/users", users.addUser);
	app.put("/users/:uid", users.updateUser);	
	
	// Register journal API
	app.get("/journal/shared", journal.findSharedJournal);
	app.get("/journal/:jid", journal.findJournalContent);
	app.get("/journal/:jid/filter/:aid", journal.findJournalContent);
	app.post("/journal/:jid", journal.addEntryInJournal);

	// Start listening
	app.listen(ini.web.port);
	console.log("Sugarizer server listening on port "+ini.web.port+"...");
});


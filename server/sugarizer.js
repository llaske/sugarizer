// Sugarizer server

var express = require('express'),
	activities = require('./routes/activities');

var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

// Get activities list
app.get("/activities", activities.findAll);
app.get("/activities/:id", activities.findById);

// Start listening
app.listen(3000);
console.log("Sugarizer listening on port 3000...");
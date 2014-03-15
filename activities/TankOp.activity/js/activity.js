var app;
var play;
var sound;
var mouse = {};

define(function (require) {
    var activity = require("sugar-web/activity/activity");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
		
		// Save mouse position
		document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; }
		
		// Create sound component
		sound = new TankOp.Audio();
		sound.renderInto(document.getElementById("audio"));
		
		// Launch main screen
		app = new TankOp.App({activity: activity});
		app.load();
        app.renderInto(document.getElementById("board"));		
    });

});

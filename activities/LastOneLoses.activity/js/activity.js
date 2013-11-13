
define(function (require) {
    var activity = require("sugar-web/activity/activity");
	var radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
	var app;

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the Sugar activity.
        activity.setup();

		// Initialize buttons
		document.getElementById("new-game-button").onclick = function() {
			app.doRenew();
		};		
		var levelRadio = new radioButtonsGroup.RadioButtonsGroup([
			document.getElementById("level-easy-button"),
			document.getElementById("level-medium-button"),
			document.getElementById("level-hard-button")]
		);
		document.getElementById("switch-player-button").onclick = function() {
			app.switchPlayer();
		};
		
        // Initialize the game
		app = new LOLGameApp({activity: activity});
		app.load();
        app.renderInto(document.getElementById("canvas"));

    });

});

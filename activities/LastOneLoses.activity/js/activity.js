
define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette"], function (activity, env, icon, webL10n, presencepalette) {
	// Link presence palette
        var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
define(["sugar-web/activity/activity", "sugar-web/graphics/radiobuttonsgroup"], function (activity, radioButtonsGroup) {
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

define(["sugar-web/activity/activity", 'easeljs', 'tweenjs', 'activity/game', 'activity/symmetrydot'], function (act) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		requirejs(["sugar-web/env", "sugar-web/datastore", "tutorial", "webL10n"], function (env, datastore, tutorial, webL10n) {
			act.setup();
			env.getEnvironment(function (err, environment) {
				currentenv = environment;

				// Set current language to Sugarizer
				var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
				var language = environment.user ? environment.user.language : defaultLanguage;
				webL10n.language.code = language;
			});
			act.getXOColor(function (error, colors) {
				runactivity(act, doc, colors, env, datastore, tutorial);
			});
		});
	});

});

function runactivity(act, doc, colors, env, datastore, tutorial) {
	var canvas;
	var stage;
	var g;
	var e;

	function init(){
		canvas = document.getElementById('actualcanvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight-55;
		stage = new createjs.Stage(canvas);
		stage.update();
		stage.mouseEventsEnabled = true;

		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", handleTick);
		function handleTick() {
			stage.update();
		}
		g = new Game(stage,colors,doc,datastore,act);
		setTimeout(function(){ g.init(); }, 500);
		var hasBeenResized = false;
		window.addEventListener('resize', resizeCanvas, false);
		function resizeCanvas() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight-55;
			stage.removeAllChildren();
			g.resize();
		}
		var buddyButton = doc.getElementById("buddy-button");
			buddyButton.addEventListener('click', function (a) {
			stage.removeAllChildren();
			g.initBuddy();
		});
		var rainbowButton = doc.getElementById("rainbow-button");
			rainbowButton.addEventListener('click', function (a) {
			stage.removeAllChildren();
			g.initRainbow();
		});
		var horizontalButton = doc.getElementById("horizontal-button");
			horizontalButton.addEventListener('click', function (a) {
			stage.removeAllChildren();
			g.initHorizontalGame();
		});
		var verticalButton = doc.getElementById("vertical-button");
			verticalButton.addEventListener('click', function (a) {
			stage.removeAllChildren();
			g.initVerticalGame();
		});
		var bilateralButton = doc.getElementById("bilateral-button");
			bilateralButton.addEventListener('click', function (a) {
			stage.removeAllChildren();
			g.initBilateralGame();
		});
		var robotButton = doc.getElementById("robot-button");
			robotButton.addEventListener('click', function (a) {
			g.toggleRobot();
		});
		window.addEventListener('activityStop', function (eve) {
			eve.preventDefault();
			g.stop();
		});
		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});
	}
	init();
}
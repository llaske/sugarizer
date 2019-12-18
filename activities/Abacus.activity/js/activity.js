define(["sugar-web/activity/activity",'easeljs','tweenjs','activity/game','activity/standardabacus','activity/standardabacuscolumn','activity/abacusbead','activity/onecolumnabacus','activity/posnegcolumn'], function (act) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		requirejs(["sugar-web/env","sugar-web/datastore","fraction","activity/abacuspalette","activity/custompalette","tutorial","webL10n"], function(env,datastore,fraction,abacuspalette,custompalette,tutorial,webL10n) {
			act.setup();
			env.getEnvironment(function(err, environment) {
				currentenv = environment;
				// Set current language to Sugarizer
				var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
				var language = environment.user ? environment.user.language : defaultLanguage;
				webL10n.language.code = language;
			});
			act.getXOColor(function (error, colors) {
				runactivity(act,doc,colors,env,datastore,fraction,abacuspalette,custompalette,tutorial);
			});
		});
	});

});

function runactivity(act,doc,colors,env,datastore,fraction,abacuspalette,custompalette,tutorial){
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
		createjs.Touch.enable(stage);

		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", handleTick);
		function handleTick() {
			stage.update();
		}
		var g = new Game(act,stage,colors,fraction,doc,abacuspalette,custompalette,datastore);
		setTimeout(function(){ g.init(); }, 500);

		window.addEventListener('activityStop', function (eve) {
			eve.preventDefault();
			g.stop();
		});

		window.addEventListener('resize', resizeCanvas, false);
		function resizeCanvas() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight-55;
			g.resize();
		}

		var clearButton = doc.getElementById("clear-button");
			clearButton.addEventListener('click', function (a) {
			g.clear();
		});
		var copyButton = doc.getElementById("copy-button");
			copyButton.addEventListener('click', function (a) {
			g.copy();
		});

		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});
	}
	init();
}

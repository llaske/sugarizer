define(["sugar-web/activity/activity",'easeljs','tweenjs','activity/game','activity/flipdot'], function (act) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		require(["sugar-web/env","sugar-web/datastore","activity/sizepalette"], function(env,datastore,sizepalette) {
			act.setup();
			act.getXOColor(function (error, colors) {
				runactivity(act,doc,colors,env,datastore,sizepalette);
			});
		});
	});

});

function runactivity(act,doc,colors,env,datastore,sizepalette){
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
		var g = new Game(stage,colors,doc,datastore,act,sizepalette);
		setTimeout(function(){ g.init(); }, 500);
		var hasBeenResized = false;
		window.addEventListener('resize', resizeCanvas, false);
		function resizeCanvas() {
			canvas.width = window.innerWidth; 
			canvas.height = window.innerHeight-55;
			g.initialiseFromArray();
		}

		var solveButton = doc.getElementById("solve-button");
		solveButton.addEventListener('click', function (a) {
			g.solve();
		});

		var newGameButton = doc.getElementById("new-game-button");
		newGameButton.addEventListener('click', function (a) {
			g.newGame();
		});

		window.addEventListener('activityStop', function (eve) {
			eve.preventDefault();
			g.stop();
		});
	}
	init();
}
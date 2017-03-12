define(["sugar-web/activity/activity",'easeljs','tweenjs','activity/game','activity/symmetrydot'], function (act) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		require(["sugar-web/env","sugar-web/datastore"], function(env,datastore) {
			act.setup();
			act.getXOColor(function (error, colors) {
				runactivity(act,doc,colors,env,datastore);
			});
		});
	});

});

function runactivity(act,doc,colors,env,datastore){
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
	}
	init();
}
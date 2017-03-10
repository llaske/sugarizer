define(["sugar-web/activity/activity",'easeljs','tweenjs','activity/editor','activity/colourcircle','activity/xoman'], function (act) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		require(['sugar-web/graphics/xocolor',"sugar-web/env","sugar-web/datastore"], function(xocol,env,datastore) {
			act.setup();
			act.getXOColor(function (error, colors) {
				runactivity(act,xocol,doc,colors,env,datastore);
			});
		});
	});

});

function runactivity(act,xocolor,doc,colors,env,datastore){
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

	    window.addEventListener('resize', resizeCanvas, false);
	    function resizeCanvas() {
	        canvas.width = window.innerWidth;
	        canvas.height = window.innerHeight-55;
	        stage.update();
	        location.reload();
	    }

	    e = new Editor(stage,xocolor,doc,colors,act,env,datastore);
	    setTimeout(function(){ e.init(); }, 500);

	    var saveButton = doc.getElementById("save-button");
        saveButton.addEventListener('click', function (a) {
            e.saveColours();
        });

        var resetButton = doc.getElementById("reset-button");
        resetButton.addEventListener('click', function (a) {
        	stage.removeAllChildren();
        	e = new Editor(stage,xocolor,doc,colors,act,env,datastore,true);
        	e.init();
        });

        window.addEventListener('activityStop', function (eve) {
        	eve.preventDefault();
	        e.stop();
	        act.close();
        });
	}
    init();
}
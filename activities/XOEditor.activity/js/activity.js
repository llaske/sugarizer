define(["sugar-web/activity/activity",'easeljs','tweenjs','activity/editor','activity/colourcircle','activity/xoman'], function (act) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		requirejs(['sugar-web/graphics/xocolor',"sugar-web/env","sugar-web/datastore","tutorial","webL10n"], function(xocol,env,datastore,tutorial,webL10n) {
			act.setup();
			env.getEnvironment(function(err, environment) {
				currentenv = environment;

				// Set current language to Sugarizer
				var defaultLanguage =(typeof chrome != "undefined" && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage(): navigator.language;
				var language = environment.user ? environment.user.language : defaultLanguage;
				webL10n.language.code = language;
			});
			act.getXOColor(function (error, colors) {
				runactivity(act,xocol,doc,colors,env,datastore,tutorial);
			});
		});
	});

});

function runactivity(act,xocolor,doc,colors,env,datastore,tutorial){
	var canvas;
	var stage;
	var g;
	var e;

	function init(){
		canvas = document.getElementById('actualcanvas');
    	if(window.innerWidth <= 750) {
				canvas.width = window.innerWidth;
			} else {
				canvas.width = 750;
			}
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
				if(window.innerWidth <= 750) {
					canvas.width = window.innerWidth;
				} else {
					canvas.width = 750;
				}
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

        document.getElementById("stop-button").addEventListener('click', function (event) {
	        e.stop();
		});
		
		// Full screen.
        document.getElementById("fullscreen-button").addEventListener('click', function() {
            document.getElementById("main-toolbar").style.opacity = 0;
            document.getElementById("canvas").style.top = "0px";
            canvas.height = window.innerHeight;
            stage = new createjs.Stage(canvas);
            stage.update();
            e.stop();
            e = new Editor(stage,xocolor,doc,colors,act,env,datastore);
            e.init();
            document.getElementById("unfullscreen-button").style.visibility = "visible";
        });
        document.getElementById("unfullscreen-button").addEventListener('click', function() {
            document.getElementById("main-toolbar").style.opacity = 1;
            document.getElementById("canvas").style.top = "55px";
            canvas.height = window.innerHeight;
            stage = new createjs.Stage(canvas);
            stage.update();
            e = new Editor(stage,xocolor,doc,colors,act,env,datastore);
            e.init();
            document.getElementById("unfullscreen-button").style.visibility = "hidden";
        });

        // Launch tutorial
        document.getElementById("help-button").addEventListener('click', function(e) {
            tutorial.start();
        });
	}
	init();
}


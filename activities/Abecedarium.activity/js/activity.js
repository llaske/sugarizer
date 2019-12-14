

define(["sugar-web/activity/activity","sugar-web/datastore"], function (activity, datastore) {
	if (!Abcd) {
		Abcd = {};
	}
	Abcd.activity = activity;
	Abcd.datastore = datastore;
	app = null;

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		// Initialize the activity
		Abcd.activity.setup();

		// Create sound component
		Abcd.sound = new Abcd.Audio();
		Abcd.sound.renderInto(document.getElementById("header"));

		// Load Database
		Abcd.loadDatabase(function(err) {
			// Init localization 
			Abcd.initL10n();

			// Create and display first screen
			app = new Abcd.App().renderInto(document.getElementById("body"));

			// Load context
			Abcd.loadContext(function() {
				app.restartLastGame();
			});
		});

		// Stop sound at end of game to sanitize media environment, specifically on Android
		document.getElementById("stop-button").addEventListener('click', function (event) {
			Abcd.sound.pause();
		});
		function hidebutton(){
			var x = document.getElementsByClassName("switchCase");
			var y = document.getElementsByClassName("switchLang");
			var i;
			for (i = 0; i < x.length; i++) {
  			x[i].style.visibility = "hidden";
  			}
  			for (i = 0; i < y.length; i++) {
  			y[i].style.visibility = "hidden";
  			}
  		}
  		function showbutton(){
			var x = document.getElementsByClassName("switchCase");
			var y = document.getElementsByClassName("switchLang");
			var i;
			for (i = 0; i < x.length; i++) {
  			x[i].style.visibility = "visible";
  			}
  			for (i = 0; i < y.length; i++) {
  			y[i].style.visibility = "visible";
  			}
  		}

		// Full screen
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";  
			hidebutton();
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			showbutton();
		});
	});

});

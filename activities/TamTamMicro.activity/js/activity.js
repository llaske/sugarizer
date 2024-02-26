var app;
var tonePlayer;
var pianoMode = false;
var simonMode = false;

define(["sugar-web/activity/activity", "sugar-web/env", "tutorial", "webL10n"], function (activity, env, tutorial, webL10n) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		// Initialize the activity.
		activity.setup();

		// Create sound component
		tonePlayer = new TamTam.TonePlayer();

		env.getEnvironment(function(err, environment) {
			currentenv = environment;
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;

			app = new TamTam.App({activity: activity});

			// Load from data store
			if (environment.objectId) {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						console.log("jornal data loaded!");
						var journalData = JSON.parse(data);
						// Launch main screen
						app.setContext(journalData);
						app.renderInto(document.getElementById("keyboard"));

					} else{
						console.log(data);
					}

					if (simonMode || pianoMode){
						app.userColor = environment.user.colorvalue;
						app.draw();
					}
				});
			} else {
				app.renderInto(document.getElementById("keyboard"));
			}

			if (!pianoMode && !simonMode)
				document.getElementById('instruments-button').classList.add('active');
		});

		// Switch to full screen when the full screen button is pressed
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.display = "none";
			document.getElementById("app_content").style.top = "0px";
			document.getElementById("app_content").style.height = "100%";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			app.computeSize();
		});

		//Return to normal size
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.display = "block";
			document.getElementById("app_content").style.top = "0px";
			document.getElementById("app_content").style.height = "50%";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			app.computeSize();
		});

		//Run tutorial when help button is clicked
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		// Stop sound at end of game to sanitize media environment, specifically on Android
		document.getElementById("stop-button").addEventListener('click', function (event) {
			console.log(app.getContext());
			var jsonData = JSON.stringify(app.getContext());
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

		document.getElementById("piano-button").addEventListener('click', function (event) {
			app.changePianoMode();
		});

		document.getElementById("simon-button").addEventListener('click', function (event) {
			app.changeSimonMode();
		});

		document.getElementById("instruments-button").addEventListener('click', function (event) {
			app.changeInstrumentsMode();
		});

	});

});

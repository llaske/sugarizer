define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette", "webL10n", "tutorial"], function (activity,env, icon, webL10n, presencepalette, webL10n, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
		
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
		});



	document.getElementById("help-button").addEventListener('click', function(e) {
		tutorial.start();
	});
	document.getElementById("timebased2").addEventListener('click',function(){
		document.getElementById("one").style.display="block";
		document.getElementById("two").style.display="none";
		document.getElementById("timebased2").style.visibility="hidden";
		
		document.getElementById("freqbased2").style.visibility="visible";
		
	  });
	  
	document.getElementById("freqbased2").addEventListener('click',function(){
		document.getElementById("one").style.display="none";
		document.getElementById("two").style.display="block";
		document.getElementById("freqbased2").style.visibility="hidden";
		document.getElementById("timebased2").style.visibility="visible";
	  });

	
	document.getElementById("fullscreen-button").addEventListener('click', function(event) {
		// document.getElementById("main-toolbar").style.display = "none";
		document.getElementById("main-toolbar").style.opacity = 0;
		document.getElementById("canvas").style.top = "0px";
		document.getElementById("unfullscreen-button").style.visibility = "visible";
	  });

	  //Return to normal size
	  document.getElementById("unfullscreen-button").addEventListener('click', function(event) {
		document.getElementById("main-toolbar").style.opacity = 1;
		// document.getElementById("main-toolbar").style.display = "block";
		document.getElementById("canvas").style.top = "55px";
		document.getElementById("unfullscreen-button").style.visibility = "hidden";
	});

	});
	

});

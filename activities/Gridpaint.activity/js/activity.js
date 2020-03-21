//Copyright (c) 2013, Playful Invention Company.

//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

// -----
// Grid paint activity
//
// by Brian Silverman
// adapted for the XO by Lionel Laské
// GridPaint has been kept extremely minimal as an explicit design choice.
// If you want to add features please make a fork with a different name.
// Thanks in advance

define(["sugar-web/activity/activity","sugar-web/datastore","sugar-web/env","webL10n","tutorial"], function (_activity, datastore, env, l10n, tutorial) {
    activity = _activity;

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {
		// Initialize the activity.
		activity.setup();
		var datastoreObject = activity.getDatastoreObject();

		env.getEnvironment(function(err, environment) {
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			l10n.language.code = language;
		});

		// Init activity and launch it
		loadGallery(null);
		appInit();

		// Load gallery from datastore
		datastoreObject.loadAsText(function (error, metadata, data) {
			loadGallery(JSON.parse(data));
			for(var i = 0 ; i < thumbcnvs.length ; i++)
				drawThumb(thumbcnvs[i], gallery[i]);
			if (mode == 'edit')
				editMode();
			else
				selectorMode();
			loadPos(selected);
		});

		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		// Handle fullscreen/unfullscreen
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.display = "none";
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			computeSize();
		});
		var unfullscreen = function(e) {
			document.getElementById("main-toolbar").style.display = "block";
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			computeSize();
		};
		document.getElementById("unfullscreen-button").addEventListener('click', unfullscreen);
		if ("ontouchstart" in document.documentElement) {
			document.getElementById("unfullscreen-button").addEventListener("touchstart", unfullscreen, false);
		}
	});
});

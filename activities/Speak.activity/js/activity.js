define(function (require) {
    var activity = require("sugar-web/activity/activity");

    var speakActivity = require("activity/SpeakActivity");
    require("activity/sax");
    require("activity/dom-js");
    require("activity/AIMLInterpreter");
    require("activity/Speech");
	var facepalette = require("facepalette");
	var speechpalette = require("speechpalette");
	var languagepalette = require("languagepalette");	

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
		
		var datastoreObject = activity.getDatastoreObject();
		
        var faceButton = document.getElementById("face-button");

        var faceButtonPalette = new facepalette.ActivityPalette(
            faceButton, datastoreObject);

        var speechButton = document.getElementById("speech-button");

        var speechButtonPalette = new speechpalette.ActivityPalette(
            speechButton, datastoreObject);

        var languageButton = document.getElementById("language-button");

        var languagePalette = new languagepalette.ActivityPalette(
            languageButton, datastoreObject);

    });

});

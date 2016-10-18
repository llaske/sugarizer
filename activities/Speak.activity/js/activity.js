define(["sugar-web/activity/activity","activity/SpeakActivity","facepalette","speechpalette","languagepalette","activity/sax","activity/dom-js","activity/AIMLInterpreter","activity/Speech"], function (activity, speakActivity, facepalette, speechpalette, languagepalette) {

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

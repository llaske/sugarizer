define(["sugar-web/activity/activity", "activity/moon-activity", "webL10n", "tutorial"], function (activity, moonActivity, l10n, tutorial) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
        moonActivity.setup();
        var datastoreObject = activity.getDatastoreObject();
        datastoreObject.loadAsText(function (error, metadata, data) {
            if (data == null) {
                return;
            }
            moonActivity.initPrefs(data);
        });
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (event) {
            var pref = moonActivity.getPrefs();
            datastoreObject.setDataAsText(pref);
            console.log("writing...");
            datastoreObject.save(function (error) {
                if (error === null) {
                    console.log("write done.");
                }
                else {
                    console.log("write failed.");
                }
            });
        });

        // Launch tutorial
        document.getElementById("help-button").addEventListener('click', function (e) {
            tutorial.start();
        });
    });

});
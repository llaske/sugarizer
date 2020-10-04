define(["sugar-web/activity/activity", "activity/moon-activity", "webL10n", "tutorial"], function (activity, moonActivity, l10n, tutorial) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!', 'humane'], function (doc, humane) {

        // Initialize the activity.
        activity.setup();
        moonActivity.setup();

        var saveButton = document.getElementById("save-image-button");
            saveButton.addEventListener('click', function () {
            var mimetype = 'image/jpeg';
            var inputData = canvas.toDataURL(mimetype, 1);
            var metadata = {
                mimetype: mimetype,
                title: "Image Moon",
                activity: "org.olpcfrance.MediaViewerActivity",
                timestamp: new Date().getTime(),
                creation_time: new Date().getTime(),
                file_size: 0
            };

            datastore.create(metadata, function () {
                humane.log(webL10n.get('MoonImageSaved'));
                console.log("export done.")
            }, inputData);
        });




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
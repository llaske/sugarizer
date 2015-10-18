/* Start of the app, we require everything that is needed */
define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var presence = require("sugar-web/presence");
    var captureHelper = require("activity/capture-helper");
    var datastore = require("sugar-web/datastore");
    var webL10n = require("webL10n");



    require(['domReady!'], function (doc) {

        window.addEventListener('localized', function() {
            window.l10n = webL10n;
            if (datastore !== undefined && datastore.localStorage !== undefined) {
                var preferences = datastore.localStorage.getValue('sugar_settings');
                if (preferences === null || preferences.name === undefined) {
                    return;
                }
                if (preferences.language !== undefined) {
                    if (webL10n.language.code !== preferences.language)
                        webL10n.language.code = preferences.language;
                }
            }
            if (webL10n.get("by") !== undefined && webL10n.get("by").length > 0) {
                captureHelper.by = webL10n.get("by");
            }
        }, false);

        activity.setup();

        if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
            chrome.storage.local.get('sugar_settings', function (values) {
                captureHelper.buddy_name = JSON.parse(values.sugar_settings).name
            });
        } else {
            captureHelper.buddy_name = JSON.parse(localStorage.sugar_settings).name
        }

        captureHelper.init();

        var photoButton = document.getElementById("photo-button");
        var audioButton = document.getElementById("audio-button");
        var videoButton = document.getElementById("video-button");

        photoButton.addEventListener("click", function () {
            captureHelper.helper.takePicture();
        });

        audioButton.addEventListener("click", function () {
            captureHelper.helper.recordAudio();
        });

        videoButton.addEventListener("click", function () {
            captureHelper.helper.recordVideo();
        });


        activity.getDatastoreObject().loadAsText(function(error, metadata, jsonData) {
            if (jsonData == null) {
                return;
            }

            var data = JSON.parse(jsonData);
            if (data == null) {
                return;
            }

            captureHelper.ids = data.ids;

            if (data.ids && data.ids.length > 0) {
                var oldData = captureHelper.getData(data.ids);
                captureHelper.displayAllData(oldData);
            }
        });
    })
});

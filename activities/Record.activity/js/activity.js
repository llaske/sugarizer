define(["sugar-web/activity/activity","sugar-web/presence","activity/capture-helper","sugar-web/datastore","l10n","tutorial","sugar-web/env"], function (activity,presence,captureHelper,datastore,l10n,tutorial,env) {

    requirejs(['domReady!'], function (doc) {

        window.addEventListener('localized', function() {
            window.l10n = l10n;
            if (l10n.get("by") !== undefined && l10n.get("by").length > 0) {
                captureHelper.by = l10n.get("by");
            }
        }, false);

        activity.setup();

        env.getEnvironment(function (err, environment) {
            currentenv = environment;

            // Set current language to Sugarizer
            var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
            var language = environment.user ? environment.user.language : defaultLanguage;
            l10n.init(language);
        });

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
        var vidDisplay = document.getElementById("vidDisplay");

        function handleVideo(stream){
            document.querySelector('#vidDisplay').srcObject = stream;
        }
        function videoError(e){
            alert("There was some error");
        }

        photoButton.addEventListener("click", function () {
            captureHelper.helper.takePicture();
            if(vidDisplay.style.display == "none"){
                vidDisplay.style.display = "block" ;
            }
        });

        audioButton.addEventListener("click", function () {
            if(vidDisplay.style.display != "none"){
                vidDisplay.style.display = "none" ;
            }
            captureHelper.helper.recordAudio();
        });

        videoButton.addEventListener("click", function () {
            if(vidDisplay.style.display == "none"){
                vidDisplay.style.display = "block" ;
            }
            captureHelper.helper.recordVideo();
        });

        // Launch tutorial
        document.getElementById("help-button").addEventListener('click', function (e) {
            tutorial.start();
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
                captureHelper.getData(data.ids, function(oldData) {
                    captureHelper.displayAllData(oldData)
                });;
            }
        });
    })
});
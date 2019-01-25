/* Start of the app, we require everything that is needed */
define(["sugar-web/activity/activity"], function (activity) {

    requirejs(['domReady!', 'sugar-web/datastore'], function (doc, datastore) {
        activity.setup();

        if (!(window.top && window.top.sugar && window.top.sugar.environment && window.top.sugar.environment.objectId)) {
            return;
        }

        var loadingSvg = document.getElementById("loading-svg");
        loadingSvg.style.width = document.body.clientWidth + "px";
        loadingSvg.style.height = document.body.clientHeight + "px";
        loadingSvg.style.display = "block";
        var timeout = 0;
        if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
            chrome.storage.local.get('sugar_settings', function (values) {
                timeout = 500;
            });
        } else {
            timeout = 200;
        }

        setTimeout(function () {
            activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
                loadingSvg.style.display = "none";
                if (data == null || !metadata || !metadata.mimetype) {
                    return;
                }

                var mimetype = metadata.mimetype;
                var type = mimetype.split("/")[0];

                if (type.indexOf("audio") == 0) {
                    displayAudio(data);
                }
                if (type.indexOf("image") == 0) {
                    displayImage(data);
                }
                if (type.indexOf("video") == 0) {
                    displayVideo(data);
                }

            });
        }, 1000);
    });
});

function displayAudio(data) {
    var audio = document.createElement("audio");
    audio.src = data;
    audio.setAttribute("controls", "");

    audio.style.height = "auto";
    audio.style.maxWidth = document.body.clientWidth - 55 + "px";
    audio.style.width = document.body.clientWidth - 60 + "px";
    audio.style.marginTop = (document.body.clientHeight - 55 - audio.getBoundingClientRect().height) / 2 + "px"

    document.getElementById("media").appendChild(audio);
}

function displayVideo(data) {
    var video = document.createElement("video");
    video.src = data;
    video.setAttribute("controls", "");

    if (document.body.clientWidth > document.body.clientHeight) {
        video.style.marginTop = "3px";
        video.style.width = "auto";
        video.style.maxHeight = document.body.clientHeight - 55 + "px";
        video.style.height = document.body.clientHeight - 60 + "px";
    } else {
        video.style.height = "auto";
        video.style.maxWidth = document.body.clientWidth - 55 + "px";
        video.style.width = document.body.clientWidth - 60 + "px";
        video.style.marginTop = (document.body.clientHeight - 55 - video.getBoundingClientRect().height) / 4 + "px"
    }

    document.getElementById("media").appendChild(video);
}

function displayImage(data) {
    var img = document.createElement("img");
    img.src = data;

    if (document.body.clientWidth > document.body.clientHeight) {
        img.style.marginTop = "3px";
        img.style.width = "auto";
        img.style.maxHeight = document.body.clientHeight - 55 + "px";
        img.style.height = document.body.clientHeight - 60 + "px";
    } else {
        img.style.height = "auto";
        img.style.maxWidth = document.body.clientWidth - 55 + "px";
        img.style.width = document.body.clientWidth - 60 + "px";
        img.style.marginTop = (document.body.clientHeight - 55 - img.getBoundingClientRect().height) / 4 + "px"
    }

    document.getElementById("media").appendChild(img);
}

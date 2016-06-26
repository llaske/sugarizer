define(["webL10n",
        "sugar-web/activity/shortcut",
        "sugar-web/bus",
        "sugar-web/env",
        "sugar-web/datastore",
        "sugar-web/graphics/icon",
        "sugar-web/graphics/activitypalette"], function (
    l10n, shortcut, bus, env, datastore, icon, activitypalette) {

    'use strict';

    var datastoreObject = null;

    var activity = {};

    activity.setup = function () {
        bus.listen();

        l10n.start();

        function sendPauseEvent() {
			var pauseEvent = document.createEvent("CustomEvent");
			pauseEvent.initCustomEvent('activityPause', false, false, {
				'cancelable': true	
			});
            window.dispatchEvent(pauseEvent);
        }
        bus.onNotification("activity.pause", sendPauseEvent);

        // An activity that handles 'activityStop' can also call
        // event.preventDefault() to prevent the close, and explicitly
        // call activity.close() after storing.

        function sendStopEvent() {
			var stopEvent = document.createEvent("CustomEvent");
			stopEvent.initCustomEvent('activityStop', false, false, {
				'cancelable': true	
			});
            var result = window.dispatchEvent(stopEvent);
            if (result) {
                activity.close();
            }
        }
        bus.onNotification("activity.stop", sendStopEvent);

        datastoreObject = new datastore.DatastoreObject();

        var activityButton = document.getElementById("activity-button");

        var activityPalette = new activitypalette.ActivityPalette(
            activityButton, datastoreObject);

        // Colorize the activity icon.
        activity.getXOColor(function (error, colors) {
            icon.colorize(activityButton, colors);
            var invokerElem =
                document.querySelector("#activity-palette .palette-invoker");
            icon.colorize(invokerElem, colors);
        });

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            sendStopEvent();
        });

        shortcut.add("Ctrl", "Q", this.close);

        env.getEnvironment(function (error, environment) {
            if (!environment.objectId) {
                datastoreObject.setMetadata({
                    "title": environment.activityName + " Activity",
                    "title_set_by_user": "0",
                    "activity": environment.bundleId,
                    "activity_id": environment.activityId
                });
            }
            datastoreObject.save(function () {
                datastoreObject.getMetadata(function (error, metadata) {
                    activityPalette.setTitleDescription(metadata);
                });
            });
        });
    };

    activity.getDatastoreObject = function () {
        return datastoreObject;
    };

    activity.getXOColor = function (callback) {
        function onResponseReceived(error, result) {
            if (error === null) {
                callback(null, {
                    stroke: result[0][0],
                    fill: result[0][1]
                });
            } else {
                callback(null, {
                    stroke: "#00A0FF",
                    fill: "#8BFF7A"
                });
            }
        }

        bus.sendMessage("activity.get_xo_color", [], onResponseReceived);
    };

    activity.close = function (callback) {
        function onResponseReceived(error, result) {
            if (error === null) {
                callback(null);
            } else {
                callback(error, null);
            }
        }

        bus.sendMessage("activity.close", [], onResponseReceived);
    };

    activity.showObjectChooser = function (callback) {
        function onResponseReceived(error, result) {
            if (error === null) {
                callback(null, result[0]);
            } else {
                callback(error, null);
            }
        }

        bus.sendMessage("activity.show_object_chooser", [], onResponseReceived);
    };

    return activity;
});

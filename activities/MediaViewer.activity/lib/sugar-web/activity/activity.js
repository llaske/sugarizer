define(["webL10n",
        "sugar-web/activity/shortcut",
        "sugar-web/bus",
        "sugar-web/env",
        "sugar-web/datastore",
		"sugar-web/presence",
        "sugar-web/graphics/icon",
        "sugar-web/graphics/activitypalette"], function (
    l10n, shortcut, bus, env, datastore, presence, icon, activitypalette) {

    'use strict';

    var datastoreObject = null;

	var presenceCallback = null;
	var presenceResponse = null;

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
                datastoreObject.save(function() {
                    datastore.waitPendingSave(function() {
                        activity.close();
                    });
                });
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
            var buddyIcon='<?xml version="1.0" encoding="UTF-8" standalone="no"?>\
                <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" version="1.0" >\
                <g transform="translate(37.943468,-309.4636)">\
                <g transform="matrix(0.05011994,0,0,0.05012004,-41.76673,299.66011)" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-opacity:1">\
                <circle transform="matrix(0.969697,0,0,0.969697,-90.879133,125.06999)" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-width:20.62502098;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" cx="331.38321" cy="134.2677" r="51.220825" />\
                <path d="m 290.55846,302.47333 -58.81513,59.20058 -59.39461,-59.40024 c -25.19828,-24.48771 -62.7038,13.33148 -38.1941,37.98719 l 60.04451,58.9817 -59.73639,59.42563 c -24.83976,24.97559 12.91592,63.26505 37.66786,37.75282 l 59.95799,-59.28294 58.75912,59.21065 c 24.50656,25.09065 62.43116,-13.00322 37.87956,-37.85772 l -59.24184,-59.02842 58.87574,-59.14782 c 25.1689,-25.18348 -13.0489,-62.75154 -37.80271,-37.84143 z" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-width:20.00002098;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" />\
                </g></g></svg>';
            document.title = document.title+" - Sugarizer";
            var newicon = buddyIcon.replace(new RegExp("&fill_color;","g"),colors.fill).replace(new RegExp("&stroke_color;","g"),colors.stroke);
            var svg_xml = (new XMLSerializer()).serializeToString((new DOMParser()).parseFromString(newicon, "text/xml"));
            var canvas = document.createElement('canvas');
            canvas.width = canvas.height = 16;
            var ctx = canvas.getContext('2d');
            var img = new Image();
            img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = canvas.toDataURL("image/x-icon");
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        });

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            sendStopEvent();
        });

        shortcut.add("Ctrl", "Q", this.close);

        env.getEnvironment(function (error, environment) {
            var l10n ={"en":"{{name}} Activity","fr":"Activité {{name}}","es":"Actividad {{name}}","pt":"{{name}} Atividade","de":"Aktivität {{name}}"};
            if (!environment.objectId) {
                datastoreObject.setMetadata({
                    "title": (l10n[environment.user.language]||l10n["en"]).replace("{{name}}", environment.activityName),
                    "title_set_by_user": "0",
                    "activity": environment.bundleId,
                    "activity_id": environment.activityId
                });
            }
			if (env.isSugarizer()) {
				presence.joinNetwork(function(error, presence) {
					if (environment.sharedId) {
						presence.joinSharedActivity(environment.sharedId, function() {
							var group_color = presence.getSharedInfo().colorvalue;
							icon.colorize(activityButton, group_color);
							datastoreObject.setMetadata({"buddy_color":group_color});
							datastoreObject.save(function() {});
						});
					}
					if (presenceCallback) {
						presenceCallback(error, presence);
					} else {
						presenceResponse = {error: error, presence: presence};
					}
				});
			}
            datastoreObject.save(function () {
                datastoreObject.getMetadata(function (error, metadata) {
                    activityPalette.setTitleDescription(metadata);
                });
            });
			if (environment.standAlone) {
				document.getElementById("stop-button").style.visibility = "hidden";
			};
        });
    };

    activity.getDatastoreObject = function () {
        return datastoreObject;
    };

	activity.getPresenceObject = function(connectionCallback) {
		if (presenceResponse == null) {
			presenceCallback = connectionCallback;
		} else {
			connectionCallback(presenceResponse.error, presenceResponse.presence);
			presenceResponse = null;
		}
		return presence;
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

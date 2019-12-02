/* Start of the app, we require everything that is needed */
define(function (require) {
    requirejs(['domReady!', "sugar-web/activity/activity", "sugar-web/graphics/presencepalette", 'activity/memorize-app'], function (doc, activity, presencePalette, memorizeApp) {

        window.memorizeApp = memorizeApp;
        memorizeApp.activity = activity;
        memorizeApp.activity.setup();

        if (window.top.sugar.environment.sharedId) {
            memorizeApp.initUI(function () {
                initPresence(memorizeApp.activity, memorizeApp, presencePalette);
            })
        } else {
            memorizeApp.initUI(function () {
                initPresence(memorizeApp.activity, memorizeApp, presencePalette);
                memorizeApp.computeCards(true);
                memorizeApp.drawGame();
                loadData(memorizeApp.activity, memorizeApp, function () {
                    memorizeApp.drawGame();
                });
            })

        }

        // Full screen
        var zoomIn = function () {
            var height = document.body.clientHeight;
            var buffer = height*0.03; 
            var gridHeight = document.getElementById("game-grid").offsetWidth;
            var zoom = (height-buffer) / gridHeight
            console.log("height is " +height);
            console.log("gridHeight is "+gridHeight);
            document.getElementById("game-grid").style.zoom = zoom;
            // document.getElementById("game-grid").style.zIndex = 5;

        }

        // Full screen
        var zoomOut = function () {
            document.getElementById("game-grid").style.zoom = 1;
            // document.getElementById("game-grid").style.zIndex = -1;

        }


		document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 0;
            document.getElementById("unfullscreen-button").style.visibility = "visible";
            zoomIn();
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
            document.getElementById("unfullscreen-button").style.visibility = "hidden";
            zoomOut();
        });
        

    });
});

function loadData(activity, memorizeApp, callback) {
    var timeout = 0;
    if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
        chrome.storage.local.get('sugar_settings', function (values) {
            timeout = 500;
        });
    } else {
        timeout = 0;
    }

    setTimeout(function () {
        activity.getDatastoreObject().loadAsText(function (error, metadata, jsonData) {
            if (jsonData == null) {
                return;
            }

            var data = JSON.parse(jsonData);
            if (data == null) {
                return;
            }

            if (data.game) {
                memorizeApp.game = data.game;
                memorizeApp.game.multiplayer = false;
                memorizeApp.game.selectedCards = [];
                memorizeApp.game.currentPlayer = "";
                memorizeApp.game.players = []
            }

            if (callback) {
                callback();
            }
        });
    }, timeout);
}

function initPresence(activity, memorizeApp, presencepalette, callback) {
    activity.getPresenceObject(function (error, presence) {
        memorizeApp.presence = presence;
        var networkButton = document.getElementById("network-button");
        var presencePalette = new presencepalette.PresencePalette(networkButton, undefined, presence);
        presence.onSharedActivityUserChanged(function (msg) {
            presencePalette.onSharedActivityUserChanged(msg);
        });

        //We use one of the palette feature that allows us to get the full list of current users everytime the list changes
        presencePalette.onUsersListChanged(function (users) {
            memorizeApp.onUsersListChanged(users);
        });


        // Launched with a shared id, activity is already shared
        if (window.top && window.top.sugar && window.top.sugar.environment && window.top.sugar.environment.sharedId) {
            shareActivity(activity, presence, memorizeApp, false);
            presencePalette.setShared(true);
        } else {
            presencePalette.addEventListener('shared', function () {
                presencePalette.popDown();
                shareActivity(activity, presence, memorizeApp, true);
            });
        }

        if (callback) {
            callback();
        }
    });
}

function shareActivity(activity, presence, memorizeApp, isHost) {

    memorizeApp.shareActivity(isHost);

    var userSettings = presence.getUserInfo();

    // Not found, create a new shared activity
    if (!window.top.sugar.environment.sharedId) {
        presence.createSharedActivity('org.olpcfrance.MemorizeActivity', function (groupId) {
            //console.log(groupId)
        });
    }

    // Show a disconnected message when the WebSocket is closed.
    presence.onConnectionClosed(function (event) {
        console.log(event);
        console.log("Connection closed");
    });

    presence.onDataReceived(function (data) {
        memorizeApp.onDataReceived(data);
    });

    presence.listUsers(function (users) {
        console.log(users)
    });
}

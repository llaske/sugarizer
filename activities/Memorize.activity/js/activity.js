/* Start of the app, we require everything that is needed */
define(function (require) {
    requirejs(['domReady!', "sugar-web/activity/activity", "sugar-web/graphics/presencepalette", 'sugar-web/env', 'webL10n', 'activity/memorize-app'], function (doc, activity, presencePalette, env, webL10n, memorizeApp) {

        window.memorizeApp = memorizeApp;
        memorizeApp.activity = activity;
        memorizeApp.activity.setup();

        env.getEnvironment(function(err, environment) {
            var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
            var language = environment.user ? environment.user.language : defaultLanguage;
            window.addEventListener('localized', function(e) {
                if (e.language != language) {
                    setTimeout(function() {
                      webL10n.language.code = language;
                    }, 50);
                }
            });
        });

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

        
        // Zoom in/out the game grid
        var zoomIn = function () {
            // Using the minimum of height and width accounts for mobile devices
            var sideLen = Math.min(document.body.clientHeight, document.body.clientWidth);
            var gridHeight = document.getElementById('game-grid').offsetWidth;
             // zoom = how much do we multiply gridHeight by to get sidelen?
            var zoom = sideLen / gridHeight;
            document.getElementById('game-grid').style.zoom = zoom;
        }

        var zoomOut = function () {
            document.getElementById('game-grid').style.zoom = 1;
        }


        document.getElementById('fullscreen-button').addEventListener('click', function() {
            document.getElementById('main-toolbar').style.display = 'none';
            document.getElementById('unfullscreen-button').style.visibility = 'visible';
            zoomIn();
        });
        
        document.getElementById('unfullscreen-button').addEventListener('click', function() {
            document.getElementById('main-toolbar').style.display = '';
            document.getElementById('unfullscreen-button').style.visibility = 'hidden';
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

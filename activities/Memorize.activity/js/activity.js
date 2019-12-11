/* Start of the app, we require everything that is needed */
define(function (require) {
    requirejs(['domReady!', "sugar-web/activity/activity", "sugar-web/graphics/presencepalette", 'sugar-web/env', 'webL10n', 'activity/memorize-app', "humane"], function (doc, activity, presencePalette, env, webL10n, memorizeApp, humane) {

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
                initPresence(memorizeApp.activity, memorizeApp, presencePalette, humane, webL10n);
            })
        } else {
            memorizeApp.initUI(function () {
                initPresence(memorizeApp.activity, memorizeApp, presencePalette, humane, webL10n);
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

var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

function generateXOLogoWithColor(color) {
    var coloredLogo = xoLogo;
    coloredLogo = coloredLogo.replace("#010101", color.stroke);
    coloredLogo = coloredLogo.replace("#FFFFFF", color.fill);

    return "data:image/svg+xml;base64," + btoa(coloredLogo);
}

var onNetworkUserChanged=function(msg, humane, webL10n){
    var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
    var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>";
    if (msg.move === 1) {
        humane.log(html + webL10n.get("PlayerJoin",{user: userName}));
    } else if (msg.move === -1) {
        humane.log(html + webL10n.get("PlayerLeave",{user: userName}));
    }
}

function initPresence(activity, memorizeApp, presencepalette, humane, webL10n, callback) {
    activity.getPresenceObject(function (error, presence) {
        memorizeApp.presence = presence;
        var networkButton = document.getElementById("network-button");
        var presencePalette = new presencepalette.PresencePalette(networkButton, undefined, presence);
        presence.onSharedActivityUserChanged( function(msg){
            onNetworkUserChanged(msg,humane,webL10n);
        });

        presence.onDataReceived(function(data){
            memorizeApp.onDataReceived(data);
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
        console.log(users);
    });
}
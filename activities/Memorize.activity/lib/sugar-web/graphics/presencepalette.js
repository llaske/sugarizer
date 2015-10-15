define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var presencepalette = {};
    var users = [];

    presencepalette.PresencePalette = function (invoker, primaryText, presence) {
        palette.Palette.call(this, invoker, primaryText);

        this.users = users;
        this.presence = presence;
        this.sharedEvent = document.createEvent("CustomEvent");
        this.sharedEvent.initCustomEvent('shared', true, true, {});

        var div = document.createElement('div');
        var txt = document.createElement('span');
        txt.innerHTML = "Private";
        txt.className = 'network-text';
        var hr = document.createElement('hr');
        var privatebutton = document.createElement('button');
        privatebutton.className = 'toolbutton';
        privatebutton.setAttribute('id', 'private-button');
        privatebutton.onclick = function () {
            that.setShared(false);
        };

        var sharedbutton = document.createElement('button');
        sharedbutton.className = 'toolbutton';
        sharedbutton.setAttribute('id', 'shared-button');
        sharedbutton.onclick = function () {
            that.setShared(true);
        };

        this.setShared = function (state) {
            if (state) {
                txt.innerHTML = "My neighborhood";
                privatebutton.disabled = true;
                sharedbutton.disabled = true;
                invoker.style.backgroundImage = 'url(lib/sugar-web/graphics/icons/actions/zoom-neighborhood.svg)';
                that.getPalette().childNodes[0].style.backgroundImage = 'url(lib/sugar-web/graphics/icons/actions/zoom-neighborhood.svg)';
                that.getPalette().dispatchEvent(that.sharedEvent);
            } else {
                txt.innerHTML = "Private";
                privatebutton.disabled = false;
                sharedbutton.disabled = false;
            }
        };

        div.appendChild(txt);
        div.appendChild(hr);
        div.appendChild(privatebutton);
        div.appendChild(sharedbutton);
        var usersDiv = document.createElement('div');
        usersDiv.setAttribute("id", "presence-users");
        div.appendChild(usersDiv);

        this.setContent([div]);

        // Pop-down the palette when a item in the menu is clicked.

        this.buttons = div.querySelectorAll('button');
        var that = this;

        function popDownOnButtonClick(event) {
            that.popDown();
        }

        for (var i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].id == "shared-button")
                this.buttons[i].addEventListener('shared', popDownOnButtonClick);
        }
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    presencepalette.PresencePalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    presencepalette.PresencePalette.prototype.setShared = function (state) {
        this.setShared(state);
    };

    var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

    function generateXOLogoWithColor(color) {
        var coloredLogo = xoLogo;
        coloredLogo = coloredLogo.replace("#010101", color.stroke);
        coloredLogo = coloredLogo.replace("#FFFFFF", color.fill);

        return "data:image/svg+xml;base64," + btoa(coloredLogo);
    }

    function displayUsers(users) {
        if (onUsersListChangedCallback != null) {
            onUsersListChangedCallback(users);
        }
        var presenceUsersDiv = document.getElementById("presence-users");
        var html = "<hr><ul style='list-style: none; padding:0;'>";
        for (var key in users) {
            html += "<li><img style='height:30px;vertical-align:middle;' src='" + generateXOLogoWithColor(users[key].colorvalue) + "'>" + users[key].name + "</li>";
        }
        html += "</ul>";
        presenceUsersDiv.innerHTML = html
    }

    function findUsersInsideAllActivities(activity, users) {
        var realUsers = [];

        for (var i = 0; i < activity.users.length; i++) {
            for (var j = 0; j < users.length; j++) {
                if (users[j].networkId === activity.users[i]) {
                    realUsers.push(users[j]);
                }
            }
        }

        return realUsers;
    }

    var tmpDiv = null;
    var tmpTimeout = null;

    function showQuickModal(text) {
        if (tmpDiv !== null) {
            tmpDiv.parentElement.removeChild(tmpDiv);
            if (tmpTimeout !== null) {
                clearTimeout(tmpTimeout)
            }
        }
        var div = document.createElement('div');
        tmpDiv = div;
        div.style.background = "#000";
        div.style.color = "#fff";
        div.style.bottom = "5px";
        div.style.padding = "15px";
        div.style.right = "5px";
        div.style.position = "absolute";
        div.innerHTML = text;
        document.body.appendChild(div);
        tmpTimeout = setTimeout(function () {
            tmpTimeout = null;
            div.parentElement.removeChild(div);
            tmpDiv = null;
        }, 3000);
    }

    presencepalette.PresencePalette.prototype.onSharedActivityUserChanged = function (msg) {
        var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
        var html = "<img style='height:30px;vertical-align:middle;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>" + userName;

        if (msg.move === 1) {
            showQuickModal(html + " joined")
        }

        if (msg.move === -1) {
            showQuickModal(html + " left")
        }

        var that = this;
        that.presence.listUsers(function (users) {
            that.presence.listSharedActivities(function (activities) {
                for (var i = 0; i < activities.length; i++) {
                    if (activities[i].id === that.presence.sharedInfo.id) {
                        var activity = activities[i];
                        displayUsers(findUsersInsideAllActivities(activity, users));
                        break;
                    }
                }
            });
        })
    };

    var onUsersListChangedCallback = null;
    presencepalette.PresencePalette.prototype.onUsersListChanged = function (callback) {
        onUsersListChangedCallback = callback;
    };

    return presencepalette;
});

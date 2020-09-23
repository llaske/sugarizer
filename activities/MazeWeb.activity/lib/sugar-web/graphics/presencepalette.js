define(["sugar-web/graphics/palette","sugar-web/env","sugar-web/activity/activity"], function(palette, env, activity) {

	'use strict';

	var presencepalette = {};

	var privateString = "Private";
	var sharedString = "Shared";
	env.getEnvironment(function(error, environment) {
		var l10nPrivate = {"en":"Private","fr":"Privée","es":"Privado","pt":"Particular","de":"Privat"};
		var l10nShared = {"en":"Shared","fr":"Partagée","es":"Compartida","pt":"Compartilhada","de":"Freigegebenes"};
		var language = environment.user ? environment.user.language : navigator.language;
		window.addEventListener('localized', function(e) {
			privateString = (l10nPrivate[language]||l10nPrivate["en"]);
			sharedString = (l10nShared[language]||l10nShared["en"]);
			var privateText = document.getElementById("private-text");
			if (!privateText) {
				return;
			}
			if (privateText.innerHTML == l10nShared["en"]) {
				privateText.innerHTML = sharedString;
			} else if (privateText.innerHTML == l10nPrivate["en"]) {
				privateText.innerHTML = privateString;
			}
		});
	});

	var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';
	var timerInterval = 1500;

	var wasShared = false;

	var presence = activity.getPresenceObject();
	function generateXOLogoWithColor(color) {
		var coloredLogo = xoLogo;
		coloredLogo = coloredLogo.replace("#010101", color.stroke)
		coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
		return "data:image/svg+xml;base64," + btoa(coloredLogo);
	}
	function generateItemForUser(user) {
		var element = document.createElement('li');
		element.setAttribute('id', user.networkId);
		element.innerHTML = "<img style='height:30px;' src='" + generateXOLogoWithColor(user.colorvalue) + "'><div style='display:inline;vertical-align:super;margin-left:5px;'>" + user.name + "</div>";
		return element;
	}
	var oldUserChanged = Object.getPrototypeOf(presence).onSharedActivityUserChanged;
	Object.getPrototypeOf(presence).onSharedActivityUserChanged = function(callback) {
		oldUserChanged(function(msg) {
			var usersList = document.getElementById("users-list");
			if (usersList) {
				if (msg.move > 0) {
					usersList.appendChild(generateItemForUser(msg.user));
				} else {
					var removed = document.getElementById(msg.user.networkId);
					if (removed) { usersList.removeChild(removed); }
				}
			}
			callback(msg);
		});
	}

	presencepalette.PresencePalette = function (invoker, primaryText, menuData) {
		palette.Palette.call(this, invoker, primaryText);

		this.sharedEvent = document.createEvent("CustomEvent");
		this.sharedEvent.initCustomEvent('shared', true, true, {});

		var div = document.createElement('div');
		var h4 = document.createElement('span');
		var txt = document.createElement('h4');
		txt.setAttribute('id','private-text');
		txt.setAttribute('style','margin-left:10px');
		txt.innerHTML = privateString;
		txt.className = 'network-text';
		var hr = document.createElement('hr');
		var hr2 = document.createElement('hr');
		hr2.setAttribute('id','hr-users');
		var usersList = document.createElement('ul');
		usersList.setAttribute('id','users-list');
		usersList.setAttribute('style','list-style:none;padding:0;max-height:150px;margin:-7px');
		var privatebutton = document.createElement('button');
		privatebutton.className = 'toolbutton';
		privatebutton.setAttribute('id','private-button');
		privatebutton.onclick = function() {
			that.setShared(false);
		}
		var sharedbutton = document.createElement('button');
		sharedbutton.className = 'toolbutton';
		sharedbutton.setAttribute('id','shared-button');
		sharedbutton.onclick = function() {
			that.setShared(true);
			wasShared = true;
			that.getPalette().dispatchEvent(that.sharedEvent);
		}
		this.setSharedUI = function(state) {
			var usersList = document.getElementById("users-list");
			usersList.style.margin = (state?"8px 2px 8px 2px":"-7px");
			usersList.style.overflowY = (state?"auto":"unset");
			if (state) {
				txt.innerHTML = sharedString;
				privatebutton.disabled = true;
				sharedbutton.disabled = true;
				invoker.style.backgroundImage = 'url(lib/sugar-web/graphics/icons/actions/zoom-neighborhood.svg)';
				that.getPalette().childNodes[0].style.backgroundImage = 'url(lib/sugar-web/graphics/icons/actions/zoom-neighborhood.svg)';
			} else {
				txt.innerHTML = privateString;
				privatebutton.disabled = false;
				sharedbutton.disabled = false;
				invoker.style.backgroundImage = 'url(lib/sugar-web/graphics/icons/actions/zoom-home.svg)';
				that.getPalette().childNodes[0].style.backgroundImage = 'url(lib/sugar-web/graphics/icons/actions/zoom-home.svg)';
				while (usersList.hasChildNodes()) {
					usersList.removeChild(usersList.firstChild);
				}
			}
		}
		this.setShared = function(state) {
			that.setSharedUI(state);
		}

		h4.appendChild(txt);
		div.appendChild(h4);
		div.appendChild(hr);
		div.appendChild(privatebutton);
		div.appendChild(sharedbutton);
		div.appendChild(hr2);
		div.appendChild(usersList);

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

		// Initialize shared
		env.getEnvironment(function(error, environment) {
			if (environment.sharedId) {
				that.setSharedUI(true);
				setTimeout(function() {
					presence.listSharedActivityUsers(environment.sharedId, function(users) {
						var usersList = document.getElementById("users-list");
						for (var i = 0 ; i < users.length ; i++) {
							if (users[i].networkId != environment.user.networkId) {
								usersList.appendChild(generateItemForUser(users[i]));
							}
						}
					});
				}, timerInterval);
			}
		});

		// Detect disconnection
		var testConnection = setInterval(function() {
			if (wasShared && !presence.isConnected()) {
				that.setShared(false);
				privatebutton.disabled = true;
				sharedbutton.disabled = true;
			}
		}, timerInterval);
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	presencepalette.PresencePalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});
	presencepalette.PresencePalette.prototype.setShared = function(state) {
		this.setShared(state);
	}

	return presencepalette;
});

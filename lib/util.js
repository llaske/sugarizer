

// Utility functions
define(["webL10n"], function (l10n) {
	var util = {};

	var units = [{name:'Years', factor:356 * 24 * 60 * 60},
			 {name:'Months', factor:30 * 24 * 60 * 60},
			 {name:'Weeks', factor:7 * 24 * 60 * 60},
			 {name:'Days', factor:24 * 60 * 60},
			 {name:'Hours', factor:60 * 60},
			 {name:'Minutes', factor:60}];

	// Port of timestamp elapsed string from Sugar - timestamp is in milliseconds elapsed since 1er january 1970
	util.timestampToElapsedString = function(timestamp, maxlevel, issmall) {
		var suffix = (issmall ? "_short" : "");
		var levels = 0;
		var time_period = '';
		var elapsed_seconds = ((new Date().getTime()) - timestamp)/1000;
		for (var i = 0; i < units.length ; i++) {
			var factor = units[i].factor;

			var elapsed_units = Math.floor(elapsed_seconds / factor);
			if (elapsed_units > 0) {
				if (levels > 0)
					time_period += ',';

				time_period += ' '+elapsed_units+" "+(elapsed_units==1?l10n.get(units[i].name+"_one"+suffix):l10n.get(units[i].name+"_other"+suffix));

				elapsed_seconds -= elapsed_units * factor;
			}

			if (time_period != '')
				levels += 1;

			if (levels == maxlevel)
				break;
		}

		if (levels == 0) {
			return l10n.get("SecondsAgo"+suffix);
		}

		return l10n.get("Ago"+suffix, {time:time_period});
	}

	// Port of get_date_range from Sugar
	util.getDateRange = function(rangetype) {
		if (rangetype === undefined) {
			return null;
		}
		var now = new Date();
		var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		now = now.getTime();
		var range = null;
		switch(rangetype) {
		case 1:
			range = { min: today, max: now };				// TODAY
			break;
		case 2:
			range = { min: today-86400000, max: now };		// YESTERDAY
			break;
		case 3:
			range = { min: today-604800000, max: now };		// PAST WEEK
			break;
		case 4:
			range = { min: today-2592000000, max: now };	// PAST MONTH
			break;
		case 5:
			range = { min: today-30758400000, max: now };	// PAST YEAR
			break;
		}
		return range;
	}

	// Port of get_next/previous_stroke/fill_color from Sugar
	util.getNextStrokeColor = function(color) {
		var current = util.getColorIndex(color);
		if (current == -1) {
			return color;
		}
		var next = nextIndex(current);
		while (xoPalette.colors[next].stroke != xoPalette.colors[current].stroke) {
			next = nextIndex(next);
		}
		return xoPalette.colors[next];
	}

	util.getPreviousStrokeColor = function(color) {
		var current = util.getColorIndex(color);
		if (current == -1) {
			return color;
		}
		var previous = previousIndex(current);
		while (xoPalette.colors[previous].stroke != xoPalette.colors[current].stroke) {
			previous = previousIndex(previous);
		}
		return xoPalette.colors[previous];
	}

	util.getNextFillColor = function(color) {
		var current = util.getColorIndex(color);
		if (current == -1) {
			return color;
		}
		var next = nextIndex(current);
		while (xoPalette.colors[next].fill != xoPalette.colors[current].fill) {
			next = nextIndex(next);
		}
		return xoPalette.colors[next];
	}

	util.getPreviousFillColor = function(color) {
		var current = util.getColorIndex(color);
		if (current == -1) {
			return color;
		}
		var previous = previousIndex(current);
		while (xoPalette.colors[previous].fill != xoPalette.colors[current].fill) {
			previous = previousIndex(previous);
		}
		return xoPalette.colors[previous];
	}

	util.getColorIndex = function(color) {
		for (var i = 0 ; i < xoPalette.colors.length ; i++) {
			if (color.stroke == xoPalette.colors[i].stroke && color.fill == xoPalette.colors[i].fill) {
				return i;
			}
		}
		return -1;
	}

	function nextIndex(index) {
		var next = index + 1;
		if (next == xoPalette.colors.length) {
			next = 0;
		}
		return next;
	}

	function previousIndex(index) {
		var previous = index - 1;
		if (previous < 0) {
			previous = xoPalette.colors.length - 1;
		}
		return previous;
	}

	// Get center of screen in canvas
	util.getCanvasCenter = function() {
		var canvas = document.getElementById("canvas");
		var canvas_height = canvas.offsetHeight;
		var canvas_width = canvas.offsetWidth;
		var canvas_centery = parseFloat(canvas_height)/2.0;
		var canvas_centerx = parseFloat(canvas_width)/2.0

		return { x: canvas_centerx, y: canvas_centery, dx: canvas_width, dy: canvas_height };
	}

	// Compute margin for the element to be centered
	util.computeMargin = function(size, maxpercent) {
		var canvas = document.getElementById("canvas");
		var canvas_height = canvas.offsetHeight;
		var canvas_width = canvas.offsetWidth;
		var size_width = (size.width <= canvas_width ? size.width : maxpercent.width*canvas_width);
		var size_height = (size.height <= canvas_height ? size.height : maxpercent.height*canvas_height);
		return { left: parseFloat(canvas_width-size_width)/2.0, top: parseFloat(canvas_height-size_height)/2.0, width: size_width, height: size_height };
	}

	// Test if cursor is inside element
	util.cursorIsInside = function(ctrl) {
		var obj = document.getElementById(ctrl.getAttribute("id"));
		if (obj == null) return false;
		var p = {};
		p.x = obj.offsetLeft;
		p.y = obj.offsetTop;
		p.dx = obj.clientWidth;
		p.dy = obj.clientHeight;
		while (obj.offsetParent) {
			p.x = p.x + obj.offsetParent.offsetLeft;
			p.y = p.y + obj.offsetParent.offsetTop - obj.scrollTop;
			if (obj == document.getElementsByTagName("body")[0]) {
				break;
			} else {
				obj = obj.offsetParent;
			}
		}
		var isInside = (
			mouse.position.x >= p.x && mouse.position.x <= p.x + p.dx
			&& mouse.position.y >= p.y && mouse.position.y <= p.y + p.dy
		);
		return isInside;
	};

	// Show/Hide toolbar
	util.setToolbar = function(newtoolbar) {
		if (toolbar == newtoolbar) {
			return;
		}
		toolbar = newtoolbar;
		newtoolbar.renderInto(document.getElementById("toolbar"));
	}

	// Get browser name
	util.getBrowserName = function() {
		if (enyo.platform.android) return "Android";
		else if (enyo.platform.androidChrome) return "Chrome Android";
		else if (enyo.platform.androidFirefox) return "Firefox Android";
		else if (enyo.platform.ie) return "IE";
		else if (enyo.platform.ios) return "iOS";
		else if (enyo.platform.webos) return "webOS";
		else if (enyo.platform.blackberry) return "BlackBerry";
		else if (enyo.platform.safari) return "Safari";
		else if (enyo.platform.chrome) return "Chrome";
		else if (enyo.platform.firefox) return "Firefox";
		return "Unknown";
	}

	// Get browser version
	util.getBrowserVersion = function() {
		if (enyo.platform.android) return enyo.platform.android;
		else if (enyo.platform.androidChrome) return enyo.platform.androidChrome;
		else if (enyo.platform.androidFirefox) return enyo.platform.androidFirefox;
		else if (enyo.platform.ie) return enyo.platform.ie;
		else if (enyo.platform.ios) return enyo.platform.ios;
		else if (enyo.platform.webos) return enyo.platform.webos;
		else if (enyo.platform.blackberry) return enyo.platform.blackberry;
		else if (enyo.platform.safari) return enyo.platform.safari;
		else if (enyo.platform.chrome) return enyo.platform.chrome;
		else if (enyo.platform.firefox) return enyo.platform.firefox;
		return "?";
	}

	// Get client type
	util.getClientType = function() {
		return document.location.protocol.substr(0,4) == "http" ? constant.webAppType : constant.appType;
	}
	util.getClientName = function() {
		return this.getClientType() == constant.webAppType ? "Web App" : "App";
	}

	// URL location
	util.getCurrentServerUrl = function() {
		var url = window.location.href.substr(document.location.protocol.length+2);
		return url.substring(0, url.lastIndexOf('/'));
	}

	// Restart application
	util.restartApp = function() {
		location.reload();
	}

	// Vibrate slightly the device
	util.vibrate = function() {
		if ((enyo.platform.android || enyo.platform.androidChrome || enyo.platform.ios) && util.getClientType() == constant.appType && navigator.vibrate) {
			navigator.vibrate(30);
		}
	}

	// Hide native toolbar
	util.hideNativeToolbar = function() {
		if ((enyo.platform.android || enyo.platform.androidChrome) && util.getClientType() == constant.appType) {
			AndroidFullScreen.immersiveMode(function() {}, function() {});
		}
	}

	// Handle volume buttons
	util.handleVolumeButtons = function() {
		if ((enyo.platform.android || enyo.platform.androidChrome) && util.getClientType() == constant.appType) {
			// HACK: Need only on Android because Cordova intercept volume buttons
			var emptyf = function() {};
			document.addEventListener("volumeupbutton", function() {
				cordova.plugins.VolumeControl.getVolume(function(value) {
					var volume = parseInt(value);
					if (volume < 100) {
						cordova.plugins.VolumeControl.setVolume((volume+10), emptyf, emptyf);
					}
				}, emptyf);
			}, false);
			document.addEventListener("volumedownbutton", function() {
				cordova.plugins.VolumeControl.getVolume(function(value) {
					var volume = parseInt(value);
					if (volume > 0) {
						cordova.plugins.VolumeControl.setVolume((volume-1), emptyf, emptyf);
					}
				}, emptyf);
			}, false);
		}
	}

	// Quit application
	util.quitApp = function() {
		document.getElementById("toolbar").style.visibility = "hidden";
		document.getElementById("canvas").style.visibility = "hidden";
		document.getElementById("shutdown").style.visibility = "visible";
		if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
			window.top.postMessage("", '*');
		}
		window.close();
		if (!/Edge/.test(navigator.userAgent)) {
			window.open('', '_self', ''); // HACK: Not allowed on all browsers
			window.close();
		}
		if (navigator) {
			if (navigator.app)
				navigator.app.exitApp();
			else if (navigator.device)
				navigator.device.exitApp();
		}
	}

	return util;
});

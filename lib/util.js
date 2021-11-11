

// Utility functions
define(["webL10n","sugar-web/datastore","FileSaver"], function (l10n, datastore, FileSaver) {
	var util = {};

	var units = [{name:'Years', factor:356 * 24 * 60 * 60},
			 {name:'Months', factor:30 * 24 * 60 * 60},
			 {name:'Weeks', factor:7 * 24 * 60 * 60},
			 {name:'Days', factor:24 * 60 * 60},
			 {name:'Hours', factor:60 * 60},
			 {name:'Minutes', factor:60}];

	// Detect platform
	util.platform = {
		ios: /(iPhone|iPad|iPod)/.test(navigator.userAgent),
		android: (navigator.userAgent.indexOf("Android")!=-1),
		firefox: (navigator.userAgent.indexOf("Firefox")!=-1),
		chrome: (navigator.userAgent.indexOf("Chrome")!=-1),
		safari: (navigator.userAgent.indexOf("Safari")!=-1),
		windows: (navigator.platform.indexOf("Win")!=-1),
		macos: (navigator.platform.indexOf("Mac")!=-1),
		unix: (navigator.platform.indexOf("X11")!=-1),
		linux: (navigator.platform.indexOf("Linux")!=-1),
		electron: (navigator.userAgent.indexOf("Electron")!=-1),
		touch: ('ontouchstart' in window),
		androidChrome: /Android .* Chrome\/(\d+)[.\d]+/.test(navigator.userAgent)
	};

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
		var canvas = document.getElementById("canvas") || document.getElementById("body");
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
		if (util.platform.android) return "Android";
		else if (util.platform.ios) return "iOS";
		else if (util.platform.chrome) return "Chrome";
		else if (util.platform.firefox) return "Firefox";
		else if (util.platform.safari) return "Safari";
		return "Unknown";
	}

	// Compute browser version
	// Based on article from @pranithpashikanti786 on https://www.geeksforgeeks.org/how-to-detect-the-version-of-a-browser/
	util.getBrowserVersion = function() {
		var objappVersion = navigator.appVersion;
		var browserAgent = navigator.userAgent;
		var browserVersion = '' + parseFloat(navigator.appVersion);
		var browserMajorVersion = parseInt(navigator.appVersion, 10);
		var Offset, OffsetVersion, ix;
		if ((OffsetVersion = browserAgent.indexOf("Chrome")) != -1) {
			browserVersion = browserAgent.substring(OffsetVersion + 7);
		} else if ((OffsetVersion = browserAgent.indexOf("Firefox")) != -1) {
			browserName = "Firefox";
			browserVersion = browserAgent.substring(OffsetVersion + 8);
		} else if ((OffsetVersion = browserAgent.indexOf("Safari")) != -1) {
			browserName = "Safari";
			browserVersion = browserAgent.substring(OffsetVersion + 7);
			if ((OffsetVersion = browserAgent.indexOf("Version")) != -1)
				browserVersion = browserAgent.substring(OffsetVersion + 8);
		} else if ((Offset = browserAgent.lastIndexOf(' ') + 1) < (OffsetVersion = browserAgent.lastIndexOf('/'))) {
			browserName = browserAgent.substring(Offset, OffsetVersion);
			browserVersion = browserAgent.substring(OffsetVersion + 1);
			if (browserName.toLowerCase() == browserName.toUpperCase()) {
				browserName = navigator.appName;
			}
		}
		if ((ix = browserVersion.indexOf(";")) != -1) {
			browserVersion = browserVersion.substring(0, ix);
		}
		if ((ix = browserVersion.indexOf(" ")) != -1) {
			browserVersion = browserVersion.substring(0, ix);
		}
		browserMajorVersion = parseInt('' + browserVersion, 10);
		if (isNaN(browserMajorVersion)) {
			browserVersion = '' + parseFloat(navigator.appVersion);
			browserMajorVersion = parseInt(navigator.appVersion, 10);
		}
		return browserVersion;
	}

	// Get client type
	util.getClientType = function() {
		return (document.location.protocol.substr(0,4) == "http" && !constant.noServerMode) ? constant.webAppType : constant.appType;
	}
	util.getClientName = function() {
		return this.getClientType() == constant.webAppType ? "Web App" : "App";
	}

	// URL location
	util.getCurrentServerUrl = function() {
		var url = window.location.href;
		return url.substring(0, url.lastIndexOf('/'));
	}

	// Min password size
	util.getMinPasswordSize = function() {
		var minSize = constant.minPasswordSize;
		var info = preferences.getServer();
		if (info && info.options && info.options["min-password-size"]) {
			minSize = info.options["min-password-size"];
		}
		return minSize;
	}

	// Restart application
	util.restartApp = function() {
		location.assign(location.href.replace(/\?rst=?./g,"?rst=0"));
	}

	// Vibrate slightly the device
	util.vibrate = function() {
		if ((util.platform.android || util.platform.ios) && util.getClientType() == constant.appType && navigator.vibrate) {
			navigator.vibrate(30);
		}
	}

	// Hide native toolbar
	util.hideNativeToolbar = function() {
		if (util.platform.android && util.getClientType() == constant.appType && !constant.noServerMode) {
			AndroidFullScreen.immersiveMode(function() {}, function() {});
		}
	}

	// Handle volume buttons
	util.handleVolumeButtons = function() {
		if (util.platform.android && util.getClientType() == constant.appType && !constant.noServerMode) {
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

	// Change browser fav icon and title
	var buddyIcon='<?xml version="1.0" encoding="UTF-8" standalone="no"?>\
		<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" version="1.0" >\
		<g transform="translate(37.943468,-309.4636)">\
		<g transform="matrix(0.05011994,0,0,0.05012004,-41.76673,299.66011)" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-opacity:1">\
		<circle transform="matrix(0.969697,0,0,0.969697,-90.879133,125.06999)" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-width:20.62502098;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" cx="331.38321" cy="134.2677" r="51.220825" />\
		<path d="m 290.55846,302.47333 -58.81513,59.20058 -59.39461,-59.40024 c -25.19828,-24.48771 -62.7038,13.33148 -38.1941,37.98719 l 60.04451,58.9817 -59.73639,59.42563 c -24.83976,24.97559 12.91592,63.26505 37.66786,37.75282 l 59.95799,-59.28294 58.75912,59.21065 c 24.50656,25.09065 62.43116,-13.00322 37.87956,-37.85772 l -59.24184,-59.02842 58.87574,-59.14782 c 25.1689,-25.18348 -13.0489,-62.75154 -37.80271,-37.84143 z" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-width:20.00002098;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" />\
		</g></g></svg>';
	util.updateFavicon = function() {
		var color = preferences.getColor();
		var name = preferences.getName();
		if (!color) {
			color = {stroke: "#005FE4", fill: "#FF2B34"};
		}
		document.title = ((name&&name!="<No name>")?name+" - ":"")+"Sugarizer";
		var icon = buddyIcon.replace(new RegExp("&fill_color;","g"),color.fill).replace(new RegExp("&stroke_color;","g"),color.stroke);
		var svg_xml = (new XMLSerializer()).serializeToString((new DOMParser()).parseFromString(icon, "text/xml"));
		var canvas = document.createElement('canvas');
		canvas.width = 16;
		canvas.height = 16;
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
	}

	// Scan code functions
	var currentCamera = 0;
	var qrCancelCallback = null;

	function closeQR() {
		QRScanner.cancelScan(function(status){});
		if (qrCancelCallback) {
			qrCancelCallback();
		}
		document.getElementById("toolbar").style.opacity = 1;
		document.getElementById("canvas").style.opacity = 1;
		document.getElementById("qrclosebutton").style.visibility = "hidden";
		document.getElementById("qrswitchbutton").style.visibility = "hidden";
		var qrBackground = document.getElementById("qrbackground");
		qrBackground.parentNode.removeChild(qrBackground);
	}

	function switchCameraQR() {
		currentCamera = (currentCamera + 1) % 2;
		QRScanner.useCamera(currentCamera, function(err, status){});
	}

	util.scanQRCode = function(okCallback, cancelCallback) {
		currentCamera = 0;
		qrCancelCallback = cancelCallback;
		var qrBackground = document.createElement('div');
		qrBackground.className = "first-qrbackground";
		qrBackground.id = "qrbackground";
		document.getElementById("canvas").appendChild(qrBackground);
		document.getElementById("qrclosebutton").addEventListener('click', closeQR);
		document.getElementById("qrswitchbutton").addEventListener('click', switchCameraQR);
		QRScanner.prepare(function(err, status) {
			document.getElementById("toolbar").style.opacity = 0;
			document.getElementById("canvas").style.opacity = 0;
			document.getElementById("qrclosebutton").style.visibility = "visible";
			document.getElementById("qrswitchbutton").style.visibility = "visible";
			if (err) {
				console.log("Error "+err);
			} else {
				QRScanner.scan(function(err, code) {
					if (err) {
						console.log("Error "+err);
					} else {
						if (okCallback) {
							okCallback(code);
						}
					}
					util.cancelScan();
					document.getElementById("toolbar").style.opacity = 1;
					document.getElementById("canvas").style.opacity = 1;
					document.getElementById("qrclosebutton").style.visibility = "hidden";
					document.getElementById("qrswitchbutton").style.visibility = "hidden";
				});
				QRScanner.show(function(status) {});
			}
		});
	}

	util.cancelScan = function() {
		QRScanner.cancelScan(function(status){});
		qrCancelCallback = null;
		document.getElementById("qrclosebutton").removeEventListener('click', closeQR);
		document.getElementById("qrswitchbutton").removeEventListener('click', switchCameraQR);
		var qrBackground = document.getElementById("qrbackground");
		if (qrBackground) qrBackground.parentNode.removeChild(qrBackground);
	}

	// Decoding functions taken from
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
	function b64ToUint6(nChr) {
		return nChr > 64 && nChr < 91 ?
			nChr - 65
				: nChr > 96 && nChr < 123 ?
			nChr - 71
				: nChr > 47 && nChr < 58 ?
			nChr + 4
				: nChr === 43 ?
			62
				: nChr === 47 ?
			63
				:
			0;
	}
	function base64DecToArr(sBase64, nBlocksSize) {
		var
			sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
			nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);
 		for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
			nMod4 = nInIdx & 3;
			nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
					taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;
			}
		}
		return taBytes;
	}

	// Write a new file
	util.writeFile = function(directory, metadata, content, callback) {
		var binary = null;
		var text = null;
		var extension = "json";
		var title = metadata.title;
		var mimetype = 'application/json';
		if (metadata && metadata.mimetype) {
			mimetype = metadata.mimetype;
			if (mimetype == "image/jpeg") {
				extension = "jpg";
			} else if (mimetype == "image/png") {
				extension = "png";
			} else if (mimetype == "audio/wav") {
				extension = "wav";
			} else if (mimetype == "video/webm") {
				extension = "webm";
			} else if (mimetype == "audio/mp3"||mimetype == "audio/mpeg") {
				extension = "mp3";
			} else if (mimetype == "video/mp4") {
				extension = "mp4";
			} else if (mimetype == "text/plain") {
				extension = "txt";
				text = content;
			} else if (mimetype == "application/pdf") {
				extension = "pdf";
			} else if (mimetype == "application/msword") {
				extension = "doc";
			} else if (mimetype == "application/vnd.oasis.opendocument.text") {
				extension = "odt";
			} else {
				extension = "bin";
			}
			binary = base64DecToArr(content.substr(content.indexOf('base64,')+7)).buffer;
		} else {
			text = JSON.stringify({metadata: metadata, text: content});
		}
		var filename = title;
		if (filename.indexOf("."+extension)==-1) {
			filename += "."+extension;
		}
		if (util.getClientType() == constant.appType && (util.platform.android || util.platform.ios || util.platform.electron) && !constant.noServerMode) {
			if (util.platform.android || util.platform.ios) {
				var cordovaFileStorage = cordova.file.externalRootDirectory;
				if (util.platform.ios) {
					cordovaFileStorage = cordova.file.documentsDirectory;
				}
				window.resolveLocalFileSystemURL(cordovaFileStorage, function(directory) {
					directory.getFile(filename, {create:true}, function(file) {
						if (!file) {
							return;
						}
						file.createWriter(function(fileWriter) {
							fileWriter.seek(fileWriter.length);
							if (text) {
								var blob = new Blob([text], {type:mimetype});
								fileWriter.write(blob);
							} else {
								fileWriter.write(binary);
							}
							callback(null, file.fullPath);
						}, function(evt) {
							callback(error.code, null);
						});
					});
				});
			} else {
				var electron = require("electron");
				var ipc = electron.ipcRenderer;
				ipc.removeAllListeners('save-file-reply');
				ipc.send('save-file-dialog', {directory: directory, filename: filename, mimetype: mimetype, extension: extension, text: text, binary: content});
				ipc.on('save-file-reply', function(event, arg) {
					callback(arg.err, arg.filename);
				});
			}
		} else {
			var blob = new Blob((text?[text]:[binary]), {type:mimetype});
			FileSaver.saveAs(blob, filename);
			callback(null, filename);
		}
	}

	// Write file content to datastore
	function writeFileToStore(file, text, callback) {
		if (file.type == 'application/json') {
			// Handle JSON file
			var data = null;
			try {
				data = JSON.parse(text);
				if (!data.metadata) {
					callback(file.name, -1);
					return;
				}
			} catch(e) {
				callback(file.name, -1);
				return;
			}
			callback(file.name, 0, data.metadata, data.text);
		} else {
			var activity = "";
			if (file.type != "text/plain" && file.type != "application/pdf" && file.type != "application/msword" && file.type != "application/vnd.oasis.opendocument.text") {
				activity = "org.olpcfrance.MediaViewerActivity";
			}
			var metadata = {
				title: file.name,
				mimetype: file.type,
				activity: activity
			}
			callback(file.name, 0, metadata, text);
		}
	}

	// Load a file
	util.loadFile = function(file, callback) {
		// Use FileReaer object in web
		if (util.getClientType() == constant.webAppType || constant.noServerMode || (util.getClientType() == constant.appType && !util.platform.android && !util.platform.ios && !util.platform.electron)) {
			// Ensure type is valid
			var validTypes = ['application/json','image/jpeg','image/png','audio/wav','video/webm','audio/mp3','audio/mpeg','video/mp4','text/plain','application/pdf','application/msword','application/vnd.oasis.opendocument.text'];
			if (validTypes.indexOf(file.type) == -1) {
				callback(file.name, -1);
				return;
			}
			var reader = new FileReader();
			reader.onload = function() {
				writeFileToStore(file, reader.result, callback);
			};
			if (file.type == 'application/json' || file.type == 'text/plain') {
				reader.readAsText(file);
			} else {
				reader.readAsDataURL(file);
			}
		}
	}

	// Ask the user a directory (use to save a set of files)
	util.askDirectory = function(callback) {
		if (util.getClientType() != constant.appType || (util.platform.android || util.platform.ios)) {
			return;
		}
		var electron = require("electron");
		var ipc = electron.ipcRenderer;
		ipc.removeAllListeners('choose-directory-reply');
		ipc.send('choose-directory-dialog');
		ipc.on('choose-directory-reply', function(event, arg) {
			callback(arg);
		})
	}

	// Ask the user a set files and write it to datastore
	util.askFiles = function(callback) {
		if (util.getClientType() != constant.appType) {
			return;
		}
		if (util.platform.android || util.platform.ios) {
			if (!window.cordova && !window.PhoneGap) {
				return;
			}

			var file = {
				type: "image/jpeg",
				name: l10n.get("ImageFromDevice")
			};
			var captureSuccess = function(imageData) {
				var text = "data:image/jpeg;base64," + imageData;
				writeFileToStore(file, text, callback);
			}
			var captureError = function(error) {
			};

			navigator.camera.getPicture(captureSuccess, captureError, {
				quality: 50,
				targetWidth: 640,
				targetHeight: 480,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY
			});
		} else {
			var electron = require("electron");
			var ipc = electron.ipcRenderer;
			ipc.removeAllListeners('choose-files-reply');
			ipc.send('choose-files-dialog');
			ipc.on('choose-files-reply', function(event, file, err, text) {
				if (err) {
					callback(file.name, -1);
				} else {
					writeFileToStore(file, text, callback);
				}
			});
		}
	}

	function base64toBlob(mimetype, base64) {
		var contentType = mimetype;
		var byteCharacters = atob(base64.substr(base64.indexOf(';base64,')+8));
		var byteArrays = [];
		for (var offset = 0; offset < byteCharacters.length; offset += 1024) {
			var slice = byteCharacters.slice(offset, offset + 1024);
			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			var byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
		var blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}

	// Open the content as a document in a new Window
	util.openAsDocument = function(metadata, text) {
		if (util.getClientType() == constant.webAppType || (util.getClientType() == constant.appType && !enyo.platform.android && !enyo.platform.androidChrome && !enyo.platform.ios && !enyo.platform.electron) || constant.noServerMode) {
			// Convert blob object URL
			var blob = base64toBlob(metadata.mimetype, text);
			var blobUrl = URL.createObjectURL(blob);

			// Open in a new browser tab
			window.open(blobUrl, '_blank');
		} else if (enyo.platform.android || enyo.platform.androidChrome) {
			// On Android, create a temporary file
			var cordovaFileStorage = cordova.file.externalCacheDirectory;
			if (enyo.platform.ios) {
				cordovaFileStorage = cordova.file.documentsDirectory;
			}
			window.resolveLocalFileSystemURL(cordovaFileStorage, function(directory) {
				directory.getFile("sugarizertemp", {create: true, exclusive: false}, function(file) {
					if (!file) {
						return;
					}
					file.createWriter(function(fileWriter) {
						fileWriter.seek(fileWriter.length);
						var blob = base64toBlob(metadata.mimetype, text)
						fileWriter.write(blob);

						// On Android, just open in the file system
						var filename = cordovaFileStorage+"sugarizertemp";
						cordova.InAppBrowser.open(filename, '_system');
					}, function(evt) {
					});
				});
			});
		} else if (enyo.platform.ios) {
			// On iOS convert to blob object URL and Open InApp 
			var blob = base64toBlob(metadata.mimetype, text);
			var blobUrl = URL.createObjectURL(blob);
			cordova.InAppBrowser.open(blobUrl, '_blank', 'location=no,closebuttoncaption='+l10n.get("Ok"));
		} else {
			// Save in a temporary file
			var electron = require("electron");
			var shell = electron.shell;
			var ipc = electron.ipcRenderer;
			ipc.removeAllListeners('create-tempfile-reply');
			ipc.send('create-tempfile', {metadata: metadata, text: text});
			ipc.on('create-tempfile-reply', function(event, file) {
				// Open in a shell
				shell.openExternal("file://"+file);
			});
		}
	}

	// Open the content as an URL in a new Window
	util.openAsUrl = function(url) {
		if (util.getClientType() == constant.webAppType || (util.getClientType() == constant.appType && !util.platform.android && !util.platform.ios && !util.platform.electron) || constant.noServerMode) {
			// Open in a new browser tab
			window.open(url, '_blank');
		} else if (util.platform.android || util.platform.ios) {
			// Open in browser
			if (util.platform.ios) {
				cordova.InAppBrowser.open(url, '_blank', 'location=no,closebuttoncaption='+l10n.get("Ok"));
			} else {
				cordova.InAppBrowser.open(url, '_system');
			}
		} else {
			// Save in a temporary file
			var electron = require("electron");
			var shell = electron.shell;
			shell.openExternal(url);
		}
	}

	// Clean localStorage: datastore and settings
	util.cleanDatastore = function(full, then) {
		var results = datastore.find();
		var i = 0;
		var removeOneEntry = function(err) {
			if (++i < results.length) {
				datastore.remove(results[i].objectId, removeOneEntry);
			} else {
				if (then) {
					then();
				}
			}
		};
		preferences.reset(full);
		if (results.length) {
			datastore.remove(results[i].objectId, removeOneEntry);
		} else {
			if (then) {
				then();
			}
		}
	}

	// Set global options
	util.getOptions = function() {
 		var options = datastore.localStorage.getValue('sugar_options');
		return options ? options : {};
	}
	util.setOptions = function(options) {
		datastore.localStorage.setValue('sugar_options', options);
	}

	// Compute storage size
	util.computeDatastoreSize = function(callback) {
		// Compute local storage size
		var used = 0;
		for(var x in localStorage) {
			var amount = (localStorage[x].length * 2);
			if (!isNaN(amount)) {
				used += amount;
			}
		}

		// Compute file size
		var results = datastore.find();
		for (var i = 0 ; i < results.length ; i++) {
			var entry = results[i];
			var textsize = entry.metadata["textsize"];
			if (textsize) {
				used += textsize;
			}
		}

		if (callback) {
			callback({bytes: used, formatted: util.formatSize(used)});
		}
	}

	// Format size
	util.formatSize = function(bytes) {
		var formatted = "";
		if (bytes > 1048576) {
			formated = (bytes/1024/1024).toFixed()+" "+l10n.get("ShortForMegabytes");
		} else if (bytes > 1024) {
			formated = (bytes/1024).toFixed()+" "+l10n.get("ShortForKilobytes");
		} else if (bytes == 0) {
			formated = "-";
		} else {
			formated = bytes + " " + l10n.get("ShortForBytes");
		}
		return formated;
	}

	// Quit application
	util.quitApp = function() {
		new Sugar.EE({mode: 2}).renderInto(document.getElementById("body"));
		window.setTimeout(function() {
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
		}, constant.timerBeforeClose);
	}

	return util;
});

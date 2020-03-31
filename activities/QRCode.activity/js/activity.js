

define(["sugar-web/activity/activity","sugar-web/datastore", "sugar-web/env", "webL10n", "tutorial"], function (activity, datastore, env, webL10n, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!', 'humane'], function (doc, humane) {

		// Initialize the activity.
		activity.setup();
		var isMobile = (/Android/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent)) && document.location.protocol.substr(0,4) != "http";
		var currentCamera = 0;
		var history = [];
		env.getEnvironment(function(err, environment) {
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
		});

		// Compute size of QR Code
		var toolbarSize = 55;
		var headerSize = toolbarSize + 40;
		var marginPercent = 20;
		var qrSize = document.getElementById("canvas").parentNode.offsetHeight - headerSize;
		qrSize -= (marginPercent*qrSize)/100;

		// Init QR Code object
		var qrCode = new QRCode("qr-code", {
			width: qrSize,
			height: qrSize,
			colorDark : "#000000",
			colorLight : "#ffffff",
			correctLevel : QRCode.CorrectLevel.H
		});
		var margin = (document.getElementById("canvas").parentNode.offsetWidth - qrSize) / 2;
		document.getElementById("qr-code").style.marginLeft = margin + "px";
		document.getElementById("qr-code").style.marginTop = "20px";

		// Generate Code
		var generateCode = function(text) {
			qrCode.clear();
			qrCode.makeCode(text);
			addToHistory(text);
			var text = userText.value.toLowerCase();
			if (text.length > 0) {
				document.getElementById("erasetext-button").style.visibility = "visible";
			} else {
				document.getElementById("erasetext-button").style.visibility = "hidden";
			}
			if (text.indexOf("http://") == 0 || text.indexOf("https://") == 0) {
				document.getElementById("user-text").classList.add("text-url");
			} else {
				document.getElementById("user-text").classList.remove("text-url");
			}
		}

		// Process Resize events

		var resizeHandler = function() {
			var windowSize = document.body.clientHeight - headerSize + (document.getElementById("unfullscreen-button").style.visibility == "visible"?toolbarSize:0);
			var zoom = windowSize/((qrSize*(100+marginPercent))/100);
			document.getElementById("qr-code").style.zoom = zoom;
			var useragent = navigator.userAgent.toLowerCase();
			if (useragent.indexOf('chrome') == -1) {
				document.getElementById("qr-code").style.MozTransform = "scale("+zoom+")";
				document.getElementById("qr-code").style.MozTransformOrigin = "0 0";
			}
			if (photoInitialized) {
				document.getElementById("outdiv").style.zoom = zoom;
				if (useragent.indexOf('chrome') == -1) {
					document.getElementById("outdiv").style.MozTransform = "scale("+zoom+")";
					document.getElementById("outdiv").style.MozTransformOrigin = "0 0";
				}
			}
		}
		window.addEventListener('resize', resizeHandler);

		// Get settings
		var userText = document.getElementById("user-text");
		userText.addEventListener('keyup', function() {
			var text = userText.value.toLowerCase();
			if (text.length > 0) {
				document.getElementById("erasetext-button").style.visibility = "visible";
			} else {
				document.getElementById("erasetext-button").style.visibility = "hidden";
			}
			if (text.indexOf("http://") == 0 || text.indexOf("https://") == 0) {
				document.getElementById("user-text").classList.add("text-url");
			} else {
				document.getElementById("user-text").classList.remove("text-url");
			}
		});
		userText.addEventListener('click', function() {
			var text = userText.value.toLowerCase();
			if (text.indexOf("http://") == 0 || text.indexOf("https://") == 0) {
				if (isMobile) {
					cordova.InAppBrowser.open(userText.value, '_system');
				} else {
					window.open(userText.value);
				}
			}
		});
		document.getElementById("erasetext-button").addEventListener('click', function() {
			userText.value = "";
			userText.focus();
			document.getElementById("erasetext-button").style.visibility = "hidden";
			document.getElementById("user-text").classList.remove("text-url");
		});
		//localization for placeholder text
		window.addEventListener("localized", function() {
			document.getElementById("user-text").placeholder = webL10n.get("Text");
		});

		// Handle text change
		document.getElementById("generate-button").addEventListener('click', function() {
			generateCode(userText.value);
		});

		// Handle text scan
		var codeScanned = function(code) {
			document.getElementById("outdiv").style.visibility = "hidden";
			document.getElementById("video-stream").style.visibility = "hidden";
			document.getElementById("qr-code").style.visibility = "visible";
			document.getElementById("loading-spinner").style.visibility = "hidden";
			document.getElementById("photo-button").classList.remove("active");
			userText.value = code;
			generateCode(code);
		};

		var x = document.getElementById("input-box");
		x.addEventListener("focus", myFocusFunction, true);
		x.addEventListener("blur", myBlurFunction, true);
		
		// Function to change searchbar color
		function myFocusFunction() {
			document.getElementById("user-text").style.backgroundColor = "white"; 
			document.getElementById("field").style.backgroundColor = "white"; 
		}
	
		function myBlurFunction() {
			document.getElementById("user-text").style.backgroundColor = "#e5e5e5";
			document.getElementById("field").style.backgroundColor = "#e5e5e5"; 
		}

		// Export as PNG image
		document.getElementById("png-button").addEventListener('click', function() {
			var mimetype = 'image/png';
			var inputData = document.getElementById("qr-code").childNodes[1].src;
			var metadata = {
				mimetype: mimetype,
				title: "Image QR Code",
				activity: "org.olpcfrance.MediaViewerActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			datastore.create(metadata, function() {
				humane.log(webL10n.get('QRCodeSaved'))
				console.log("export done.")
			}, inputData);
		});

		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		// Full screen
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			if (document.getElementById("photo-button").classList.contains('active')) {
				return;
			}
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("input-box").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			resizeHandler();
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("input-box").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			resizeHandler();
		});

		// Capture photo
		var photoButton = document.getElementById("photo-button");
		var photoInitialized = false;
		var oldUserText = "";
		photoButton.addEventListener('click', function() {
			// Handle mobile capture
			if (isMobile) {
				document.getElementById("main-toolbar").style.opacity = 0;
				document.getElementById("canvas").style.opacity = 0;
				document.getElementById("close-button").style.visibility = "visible";
				document.getElementById("switchcamera-button").style.visibility = "visible";
				QRScanner.prepare(function(err, status) {
					if (err) {
						console.log("Error "+err);
					} else {
						console.log(status);
						QRScanner.scan(function(err, code) {
							if (err) {
								console.log("Error "+err);
							} else {
								userText.value = code;
								generateCode(code);
							}
							QRScanner.cancelScan(function(status){});
							document.getElementById("main-toolbar").style.opacity = 1;
							document.getElementById("canvas").style.opacity = 1;
							document.getElementById("close-button").style.visibility = "hidden";
							document.getElementById("switchcamera-button").style.visibility = "hidden";
						});
						QRScanner.show(function(status) {});
					}
				});
				return;
			}

			// Handle HTML5 capture
			var outdiv = document.getElementById("outdiv");
			var videostream = document.getElementById("video-stream");
			if (!photoButton.classList.contains('active')) {
				document.getElementById("qr-code").style.visibility = "hidden";
				document.getElementById("loading-spinner").style.visibility = "visible";
				oldUserText = userText.value;
				userText.value = "";
				if (!photoInitialized) {
					outdiv.innerHTML = '<video id="video-window" autoplay></video>';
					load(qrSize, margin, codeScanned);
					photoInitialized = true;
				} else {
					outdiv.style.visibility = "visible";
					videostream.style.visibility = "visible";
				}
			} else {
				outdiv.style.visibility = "hidden";
				videostream.style.visibility = "hidden";
				document.getElementById("loading-spinner").style.visibility = "hidden";
				document.getElementById("qr-code").style.visibility = "visible";
				userText.value = oldUserText;
				generateCode(userText.value);
			}
			photoButton.classList.toggle("active");
		});

		// Mobile buttons: Cancel capture, Switch camera
		document.getElementById("close-button").addEventListener('click', function (event) {
			if (isMobile) {
				QRScanner.cancelScan(function(status){});
			}
		});
		document.getElementById("switchcamera-button").addEventListener('click', function (event) {
			if (isMobile) {
				currentCamera = (currentCamera + 1) % 2;
				QRScanner.useCamera(currentCamera, function(err, status){});
			}
		});

		// Add entry to history
		function addToHistory(text) {
			if(!history.includes(text)){
				history.push(text);
				updateHistory();
			}
		}

		// Update dropdown with user history
		function updateHistory() {
			var mhtml = '';
			var index = history.length;
			while(index--) {
				mhtml += '<option value="'+(history[index])+'">'+(history[index])+'</option>';
			}
			document.getElementById("qrtextdropdown").innerHTML = mhtml;
		}

		// QR history dropdown change
		document.getElementById("qrtextdropdown").addEventListener('change', function () {
			document.getElementById("user-text").value = document.getElementById("qrtextdropdown").value;
			generateCode(document.getElementById("qrtextdropdown").value);
		});

		// Handle graph save/world
		var stopButton = document.getElementById("stop-button");
		stopButton.addEventListener('click', function (event) {
			console.log("writing...");
			var data = { userText: (photoButton.classList.contains('active') ? oldUserText : userText.value), uHistory: history };
			var jsonData = JSON.stringify(data);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

		// Initialize code
		env.getEnvironment(function(err, environment) {
			if (!environment.objectId) {
				console.log("New instance");
				userText.value = environment.user.name;
				generateCode(environment.user.name);
			} else {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						data = JSON.parse(data);
						userText.value = data.userText;
						history = data.uHistory;
						generateCode(data.userText);
					}
				});
			}
		});
	});
});

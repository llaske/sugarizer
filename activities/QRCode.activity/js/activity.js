

define(["sugar-web/activity/activity","sugar-web/datastore"], function (activity, datastore) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var isMobile = (/Android/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent)) && document.location.protocol.substr(0,4) != "http";
		var currentCamera = 0;

		// Compute size of QR Code
		var headerSize = 55 + 40;
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
			var text = userText.value.toLowerCase();
			if (text.indexOf("http://") == 0 || text.indexOf("https://") == 0) {
				document.getElementById("user-text").classList.add("text-url");
			} else {
				document.getElementById("user-text").classList.remove("text-url");
			}
		}

		// Process Resize events
		window.addEventListener('resize', function() {
			var windowSize = document.body.clientHeight - headerSize;
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
		});

		// Get settings
		var userSettings = datastore.localStorage.getValue('sugar_settings');
		var userText = document.getElementById("user-text");
		userText.value = userSettings.name;
		userText.addEventListener('keyup', function() {
			var text = userText.value.toLowerCase();
			if (text.indexOf("http://") == 0 || text.indexOf("https://") == 0) {
				document.getElementById("user-text").classList.add("text-url");
			} else {
				document.getElementById("user-text").classList.remove("text-url");
			}
		});
		userText.addEventListener('click', function() {
			var text = userText.value.toLowerCase();
			if (text.indexOf("http://") == 0 || text.indexOf("https://") == 0) {
				window.open(userText.value);
			}
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
				console.log("export done.")
			}, inputData);
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
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("input-box").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
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

		// Handle graph save/world
		var stopButton = document.getElementById("stop-button");
		stopButton.addEventListener('click', function (event) {
			console.log("writing...");
			var data = { userText: (photoButton.classList.contains('active') ? oldUserText : userText.value) };
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
		generateCode(userSettings.name);
		activity.getDatastoreObject().getMetadata(function(error, mdata) {
			console.log("datastore check");
			var d = new Date().getTime();
			if (Math.abs(d-mdata.creation_time) < 2000) {
				console.log("Time too short");
			} else {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						data = JSON.parse(data);
						userText.value = data.userText;
						generateCode(data.userText);
					}
				});
			}
		});
	});
});

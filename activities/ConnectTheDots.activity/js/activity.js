define(["sugar-web/activity/activity", "sugar-web/env", "l10n", "sugar-web/graphics/presencepalette", "sugar-web/datastore", "tutorial"], function (activity, env, l10n, presencepalette, datastore, tutorial) {

	requirejs(['domReady!'], function (doc) {

		activity.setup();

		// Link presence palette to network button
		var presence = null;
		var isHost = false;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);

		// Handle sharing
		palette.addEventListener('shared', function () {
			palette.popDown();
			console.log("Want to share");
			presence = activity.getPresenceObject(function (error, network) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				network.createSharedActivity('org.sugarlabs.ConnectTheDots', function (groupId) {
					console.log("Activity shared");
					isHost = true;
				});
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		});

		// Handle incoming data from network
		var onNetworkDataReceived = function (msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			switch (msg.content.action) {
				case 'init':
					// Received initial grid settings from host
					break;
			}
		};

		// Handle user join/leave
		var onNetworkUserChanged = function (msg) {
			if (isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'init'
					}
				});
			}
			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "join" : "leave"));
		};

		// Set language from environment
		var currentenv;
		env.getEnvironment(function (err, environment) {
			currentenv = environment;

			// Set current language
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			l10n.init(language);

			// Load from datastore
			if (!environment.objectId) {
				console.log("New instance");
			} else {
				activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
					if (error == null && data != null) {
						console.log("Loaded instance");
					}
				});
			}

			// Handle shared instances (joining)
			if (environment.sharedId) {
				console.log("Shared instance");
				presence = activity.getPresenceObject(function (error, network) {
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}
		});

		// Save in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			console.log("writing...");
			var jsonData = JSON.stringify({});
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

		// Dot Grid
		var canvas = document.getElementById('gridCanvas');
		var ctx = canvas.getContext('2d');
		var dots = [];
		var mouseX = -1000;
		var mouseY = -1000;
		var spacing = 55;
		var baseRadius = 4;
		var maxRadius = 9;
		var influenceRadius = 125;
		var dotColor = '#a0a0a0';
		var zoom = 1;

		// Fixed internal resolution (like GridPaint)
		var CANVAS_WIDTH = 900;
		var CANVAS_HEIGHT = 748;
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;

		function resize() {
			var container = document.getElementById('canvas');
			var isFullscreen = document.getElementById("unfullscreen-button").style.visibility === "visible";
			var availableHeight = document.body.clientHeight - (isFullscreen ? 0 : 55);
			var availableWidth = container.clientWidth;

			// Scale to fit available height
			zoom = availableHeight / CANVAS_HEIGHT;
			
			// Get actual device pixel ratio for high-DPI screens
			var dpr = window.devicePixelRatio || 1;

			// Update actual physical pixels to be ultra-high-definition
			canvas.width = (CANVAS_WIDTH * zoom) * dpr;
			canvas.height = (CANVAS_HEIGHT * zoom) * dpr;

			// Set CSS size (scales visually while keeping the element size correct)
			canvas.style.width = (CANVAS_WIDTH * zoom) + "px";
			canvas.style.height = (CANVAS_HEIGHT * zoom) + "px";
			ctx.scale(zoom * dpr, zoom * dpr);

			// Center the canvas horizontally
			var leftMargin = (availableWidth - CANVAS_WIDTH * zoom) / 2;
			canvas.style.marginLeft = leftMargin + "px";
			canvas.style.marginTop = "0px";
		}

		function initDots() {
			dots = [];
			var cols = 15;
			var rows = 13;
			var offsetX = (CANVAS_WIDTH - (cols - 1) * spacing) / 2;
			var offsetY = (CANVAS_HEIGHT - (rows - 1) * spacing) / 2;

			for (var i = 0; i < cols; i++) {
				for (var j = 0; j < rows; j++) {
					dots.push({
						x: offsetX + i * spacing,
						y: offsetY + j * spacing,
						baseR: baseRadius,
						r: baseRadius,
						targetR: baseRadius,
						color: dotColor
					});
				}
			}
		}

		function draw() {
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			for (var i = 0; i < dots.length; i++) {
				var dot = dots[i];
				var dx = mouseX - dot.x;
				var dy = mouseY - dot.y;
				var dist = Math.max(Math.abs(dx), Math.abs(dy));
				var angle = Math.atan2(dy, dx);
				
				// 8-pointed star without shrinking nearby dots
				var dirInfluence = influenceRadius * (1.3 + 0.5 * Math.cos(angle * 8));

				if (dist < dirInfluence) {
					var t = 1 - (dist / dirInfluence);
					// Increase slightly when little far, more rapidly when close
					t = Math.pow(t, 1.5);
					dot.targetR = dot.baseR + (maxRadius - dot.baseR) * t;
				} else {
					dot.targetR = dot.baseR;
				}

				// Smooth easing
				if (dot.targetR > dot.r) {
					dot.r += (dot.targetR - dot.r) * 0.5; // Grow fast
				} else {
					dot.r += (dot.targetR - dot.r) * 0.05; // Shrink slow (leaves a trail)
				}

				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
				ctx.fillStyle = dot.color;
				ctx.fill();
			}
			requestAnimationFrame(draw);
		}

		// Handle click on help-button
		document.getElementById("help-button").addEventListener('click', function (e) {
			tutorial.start();
		});

		// Fullscreen
		document.getElementById("fullscreen-button").addEventListener('click', function () {
			document.getElementById("main-toolbar").style.display = "none";
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("canvas").style.height = "100vh";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			resize();
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			document.getElementById("main-toolbar").style.display = "";
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("canvas").style.height = "calc(100vh - 55px)";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			resize();
		});

		// Mouse/Touch handling
		window.addEventListener('resize', resize);

		canvas.addEventListener('mousemove', function (e) {
			var rect = canvas.getBoundingClientRect();
			mouseX = (e.clientX - rect.left) / zoom;
			mouseY = (e.clientY - rect.top) / zoom;
		});
		canvas.addEventListener('touchmove', function (e) {
			if (e.touches.length > 0) {
				var rect = canvas.getBoundingClientRect();
				mouseX = (e.touches[0].clientX - rect.left) / zoom;
				mouseY = (e.touches[0].clientY - rect.top) / zoom;
			}
		});
		canvas.addEventListener('mouseout', function () {
			mouseX = -1000;
			mouseY = -1000;
		});
		canvas.addEventListener('touchend', function () {
			mouseX = -1000;
			mouseY = -1000;
		});

		// Handle localized event
		window.addEventListener("localized", function () {
			document.getElementById("activity-button").title = l10n.get("ConnectTheDots");
			document.getElementById("network-button").title = l10n.get("Network");
			document.getElementById("fullscreen-button").title = l10n.get("Fullscreen");
			document.getElementById("unfullscreen-button").title = l10n.get("Unfullscreen");
			document.getElementById("help-button").title = l10n.get("Tutorial");
			document.getElementById("stop-button").title = l10n.get("Stop");
		});

		initDots();
		resize();
		draw();
	});
});

define(["sugar-web/activity/activity", "sugar-web/env", "l10n", "sugar-web/graphics/presencepalette", "sugar-web/datastore", "tutorial", "activity/palettes/color-palette", "activity/modes/draw-mode", "sugar-web/graphics/menupalette", "activity/modes/number-mode", "activity/palettes/timerPalette", "sugar-web/graphics/icon", "activity/modes/game-mode", "activity/palettes/speedPalette", "humane"], function (activity, env, l10n, presencepalette, datastore, tutorial, colorpalette, drawMode, menupalette, numberMode, timerPalette, icon, gameMode, speedPalette, humane) {
	requirejs(['domReady!'], function (doc) {

		activity.setup();

		var currentMode = drawMode;
		var canvas = document.getElementById('gridCanvas');
		var ctx = canvas ? canvas.getContext('2d') : null;
		var CANVAS_WIDTH = 900;
		var CANVAS_HEIGHT = 748;
		var spacing = 55;
		var baseRadius = 4;
		var maxRadius = 9;
		var influenceRadius = 92;
		var dotColor = '#a0a0a0';
		var zoom = 1;
		var mouseX = -1000;
		var mouseY = -1000;
		var prevMouseX = -1000;
		var prevMouseY = -1000;
		var dots = [];
		var buddyStroke = '#005fe4';
		var buddyFill = '#ff2b34';
		var hasReceivedInit = false;
		var mySharedSpawnIndex = 0;

		var recentNotifications = {};
		var formatAndLogNotification = function(event, subjectName, subjectColor, objectName) {
			var getL10n = function(key, fallback) {
				var val = l10n.get(key);
				return (val && val !== key && val !== "") ? val : fallback;
			};
			var myName = currentenv ? currentenv.user.name : "Player";
			var youStr = getL10n("You", "You");
			var sName = (subjectName === myName) ? youStr : subjectName;
			var msg = "";
			
			var oName = "";
			if (objectName) {
				oName = (objectName === myName) ? youStr : objectName;
			}

			if (event === 'hitWall') msg = sName + " " + getL10n("hitTheWall", "hit the wall");
			else if (event === 'win') msg = sName + " " + getL10n("fillMoreThan50", "fill more than 50% of the board");
			else if (event === 'eliminated') msg = sName + " " + getL10n("eliminated", "eliminated") + " " + oName;
			else if (event === 'intercepted') msg = sName + " " + getL10n("hasBeenIntercepted", "has been intercepted");
			else if (event === 'eliminatedEachOther') msg = sName + " and " + oName + " " + getL10n("eliminatedEachOther", "eliminated each other");
			else if (event === 'gameWon') msg = sName + " " + getL10n("wonTheGame", "won the game");

			var now = Date.now();
			if (recentNotifications[msg] && now - recentNotifications[msg] < 1500) {
				return;
			}
			recentNotifications[msg] = now;
			
			// cleanup old entries
			for (var key in recentNotifications) {
				if (now - recentNotifications[key] > 2000) {
					delete recentNotifications[key];
				}
			}

			icon.load({
				uri: "icons/owner-icon.svg",
				fillColor: subjectColor.fill,
				strokeColor: subjectColor.stroke
			}, function(url) {
				var iconHtml = "<br><img style='height:30px;vertical-align:middle;margin-top:5px;' src='" + url + "'>";
				humane.log(msg + iconHtml);
			});
		};

		function getMySpawnIndex() {
			if (!presence) return 0;
			return mySharedSpawnIndex;
		}

		function initDots() {
			dots = [];
			var cols = 15;
			var rows = 13;
			var offsetX = (CANVAS_WIDTH - (cols - 1) * spacing) / 2;
			var offsetY = (CANVAS_HEIGHT - (rows - 1) * spacing) / 2;

			for (var i = 0; i < cols; i++) {
				for (var j = 0; j < rows; j++) {
					var dotX = offsetX + i * spacing;
					var dotY = offsetY + j * spacing;
					dots.push({
						col: i,
						row: j,
						baseX: dotX,
						baseY: dotY,
						x: dotX,
						y: dotY,
						baseR: baseRadius,
						r: baseRadius,
						targetR: baseRadius,
						color: dotColor
					});
				}
			}
		}

		function resize() {
			var container = document.getElementById('canvas');
			if (!container || !canvas) return;
			var isFullscreen = document.getElementById("unfullscreen-button").style.visibility === "visible";
			var availableHeight = window.innerHeight - (isFullscreen ? 0 : 55);
			var availableWidth = window.innerWidth;
			if (availableHeight <= 0 || availableWidth <= 0) return;

			container.style.top = (isFullscreen ? 0 : 55) + "px";
			container.style.width = availableWidth + "px";
			container.style.height = availableHeight + "px";

			zoom = availableHeight / CANVAS_HEIGHT;
			var dpr = window.devicePixelRatio || 1;

			canvas.width = (CANVAS_WIDTH * zoom) * dpr;
			canvas.height = (CANVAS_HEIGHT * zoom) * dpr;

			canvas.style.width = (CANVAS_WIDTH * zoom) + "px";
			canvas.style.height = (CANVAS_HEIGHT * zoom) + "px";
			if (ctx) {
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.scale(zoom * dpr, zoom * dpr);
			}

			canvas.style.margin = "auto";

			if (currentMode && typeof currentMode.resize === 'function') {
				currentMode.resize();
			}
		}

		if (canvas) {
			window.addEventListener('resize', resize);
			var endTouch = function (e) {
				if (e && e.target === canvas && e.cancelable) e.preventDefault();
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			};

			window.addEventListener('mouseup', function () {
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			});
			window.addEventListener('touchend', endTouch, { passive: false });
			window.addEventListener('touchcancel', endTouch, { passive: false });

			canvas.addEventListener('mousedown', function (e) {
				var rect = canvas.getBoundingClientRect();
				mouseX = (e.clientX - rect.left) / zoom;
				mouseY = (e.clientY - rect.top) / zoom;
				prevMouseX = mouseX;
				prevMouseY = mouseY;
				if (currentMode && typeof currentMode.onMouseDown === 'function') {
					currentMode.onMouseDown(mouseX, mouseY);
				}
			});
			canvas.addEventListener('mouseup', function () {
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			});
			canvas.addEventListener('touchstart', function (e) {
				if (e && e.cancelable) e.preventDefault();
				if (e.touches.length > 0) {
					var rect = canvas.getBoundingClientRect();
					mouseX = (e.touches[0].clientX - rect.left) / zoom;
					mouseY = (e.touches[0].clientY - rect.top) / zoom;
					prevMouseX = mouseX;
					prevMouseY = mouseY;
					if (currentMode && typeof currentMode.onMouseDown === 'function') {
						currentMode.onMouseDown(mouseX, mouseY);
					}
				}
			}, { passive: false });
			canvas.addEventListener('mousemove', function (e) {
				var rect = canvas.getBoundingClientRect();
				var newMouseX = (e.clientX - rect.left) / zoom;
				var newMouseY = (e.clientY - rect.top) / zoom;
				if (currentMode && typeof currentMode.onMouseMove === 'function') {
					currentMode.onMouseMove(newMouseX, newMouseY, prevMouseX, prevMouseY);
				}
				mouseX = newMouseX;
				mouseY = newMouseY;
				prevMouseX = newMouseX;
				prevMouseY = newMouseY;
			});
			canvas.addEventListener('touchmove', function (e) {
				if (e && e.cancelable) e.preventDefault();
				if (e.touches.length > 0) {
					var rect = canvas.getBoundingClientRect();
					var newMouseX = (e.touches[0].clientX - rect.left) / zoom;
					var newMouseY = (e.touches[0].clientY - rect.top) / zoom;
					if (currentMode && typeof currentMode.onMouseMove === 'function') {
						currentMode.onMouseMove(newMouseX, newMouseY, prevMouseX, prevMouseY);
					}
					mouseX = newMouseX;
					mouseY = newMouseY;
					prevMouseX = newMouseX;
					prevMouseY = newMouseY;
				}
			}, { passive: false });
			canvas.addEventListener('mouseout', function () {
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			});
		}
		var lastTime = Date.now();
		function renderLoop() {
			var now = Date.now();
			var delta = now - lastTime;
			lastTime = now;
			
			if (!ctx) return;
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			if (currentMode && typeof currentMode.drawBehindDots === 'function') {
				currentMode.drawBehindDots(ctx, delta);
			}

			for (var i = 0; i < dots.length; i++) {
				var dot = dots[i];

				var isInfluenced = false;
				var maxT = 0;
				var checkInfluence = function(x, y) {
					var dx = x - dot.baseX;
					var dy = y - dot.baseY;
					var dist = Math.max(Math.abs(dx), Math.abs(dy));
					var angle = Math.atan2(dy, dx);
					var dirInfluence = influenceRadius * (1.3 + 0.5 * Math.cos(angle * 8));
					if (dist < dirInfluence) {
						isInfluenced = true;
						var t = 1 - (dist / dirInfluence);
						t = Math.pow(t, 1.5);
						if (t > maxT) maxT = t;
					}
				};

				if (currentMode && typeof currentMode.getPlayerPositions === 'function') {
					var positions = currentMode.getPlayerPositions();
					if (positions.length > 0) {
						for (var p = 0; p < positions.length; p++) {
							checkInfluence(positions[p].x, positions[p].y);
						}
					} else {
						checkInfluence(mouseX, mouseY);
					}
				} else {
					checkInfluence(mouseX, mouseY);
				}

				var isCompleted = currentMode && typeof currentMode.isDotCompleted === 'function' && currentMode.isDotCompleted(dot);
				var isDrawingActive = currentMode && typeof currentMode.isDrawingActive === 'function' && currentMode.isDrawingActive();

				if (isCompleted && !(isDrawingActive && isInfluenced)) {
					dot.targetR = 0;
				} else {
					if (isInfluenced) {
						dot.targetR = dot.baseR + (maxRadius - dot.baseR) * maxT;
					} else {
						dot.targetR = dot.baseR;
					}
				}

				if (dot.targetR > dot.r) {
					dot.r += (dot.targetR - dot.r) * 0.5;
				} else {
					dot.r += (dot.targetR - dot.r) * 0.02;
				}

				if (isCompleted && dot.r <= 0.2) {
					continue;
				}

				if (dot.r < 0.1) {
					continue;
				}

				var dotRenderColor = dot.color;
				if (currentMode && typeof currentMode.getDotColor === 'function') {
					var modeColor = currentMode.getDotColor(dot);
					if (modeColor) dotRenderColor = modeColor;
				}

				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
				ctx.fillStyle = dotRenderColor;
				ctx.fill();
			}

			if (currentMode && typeof currentMode.drawFrontDots === 'function') {
				currentMode.drawFrontDots(ctx);
			}

			requestAnimationFrame(renderLoop);
		}

		// Link presence palette to network button
		var presence = null;
		var isHost = false;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);

		// Handle sharing
		palette.addEventListener('shared', function () {
			palette.popDown();
			console.log("Want to share");
			activity.getPresenceObject(function (error, network) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				presence = network;
				network.createSharedActivity('org.sugarlabs.ConnectTheDots', function (groupId) {
					console.log("Activity shared");
					isHost = true;
					if (typeof numberMode.initNetwork === 'function') numberMode.initNetwork(presence, isHost, activity);
					setSharedToolbar();
					if (currentMode === numberMode && typeof numberMode.startChallenge === 'function') {
						numberMode.startChallenge(120, false); // Auto-start 2 minute challenge
					}
					// Reset the board
					if (currentMode === gameMode && typeof gameMode.previewGame === 'function') {
						gameMode.previewGame(false, 0, false);
					}
				});
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		});

		function setSharedToolbar() {
			document.getElementById('mode-button').style.display = 'none';
			document.getElementById('robot-button').style.display = 'none';
			if (!isHost) {
				document.getElementById('speed-button').style.display = 'none';
			}
		}

		function broadcastUpdate() {
			var isChallengeActive = false;
			if (currentMode === numberMode && typeof numberMode.getSharedState === 'function') {
				isChallengeActive = numberMode.getSharedState().challengeActive;
			}
			if (isChallengeActive) return; // Do not broadcast drawing updates during challenge
			
			if (typeof updateLibraryMenu === 'function') {
				updateLibraryMenu();
			}
			if (presence && currentMode && typeof currentMode.serialize === 'function') {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'update',
						mode: currentMode === numberMode ? 'number' : (currentMode === gameMode ? 'game' : 'draw'),
						data: currentMode.serialize()
					}
				});
			}
		}

		// Handle incoming data from network
		var onNetworkDataReceived = function (msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			var targetMode = (msg.content.mode === 'number') ? numberMode : ((msg.content.mode === 'game') ? gameMode : ((msg.content.mode === 'draw') ? drawMode : currentMode));
			if (targetMode !== currentMode && targetMode === numberMode) {
				switchMode(numberMode, 'mode-number', true);
			} else if (targetMode !== currentMode && targetMode === gameMode) {
				switchMode(gameMode, 'mode-game', true);
			} else if (targetMode !== currentMode && targetMode === drawMode) {
				switchMode(drawMode, 'mode-draw', true);
			}
			switch (msg.content.action) {
				case 'init':
					if (hasReceivedInit) break;
					if (msg.content.targetNetworkId && msg.content.targetNetworkId !== presence.getUserInfo().networkId) break;
					hasReceivedInit = true;
					if (msg.content.spawnIndex !== undefined) {
						mySharedSpawnIndex = msg.content.spawnIndex;
					}
					if (msg.content.gameSpeed !== undefined && currentMode === gameMode && typeof gameMode.setSpeed === 'function') {
						gameMode.setSpeed(msg.content.gameSpeed);
					}
					if (msg.content.totalUsers !== undefined && typeof gameMode.setTotalPlayers === 'function') {
						gameMode.setTotalPlayers(msg.content.totalUsers);
					}
					if (presence && presence.getSharedInfo && typeof gameMode.setTotalPlayers === 'function') {
						var sharedInfo = presence.getSharedInfo();
						if (sharedInfo && sharedInfo.id) {
							presence.listSharedActivityUsers(sharedInfo.id, function(users) {
								gameMode.setTotalPlayers(users.length);
							});
						}
					}
					if (currentMode && typeof currentMode.deserialize === 'function') {
						if (currentMode === numberMode) {
							currentMode.deserialize(msg.content.data, true);
							if (typeof currentMode.updateLibraryMenu === 'function') currentMode.updateLibraryMenu();
						} else if (currentMode === gameMode) {
							if (typeof gameMode.previewGame === 'function') {
								gameMode.previewGame(false, mySharedSpawnIndex, true);
							}
							currentMode.deserialize(msg.content.data, true, msg.user.networkId, msg.user.name);
						} else {
							currentMode.deserialize(msg.content.data.strokes, msg.content.data.figures);
						}
					}
					if (msg.content.challengeActive) {
						if (currentMode === numberMode && typeof currentMode.startChallenge === 'function') {
							currentMode.startChallenge(msg.content.challengeDuration !== undefined ? msg.content.challengeDuration : 120, true);
							if (msg.content.challengeScores) currentMode.setChallengeScores(msg.content.challengeScores);
						}
					}
					break;
				case 'update':
					if (currentMode && typeof currentMode.deserialize === 'function') {
						if (currentMode === numberMode) {
							currentMode.deserialize(msg.content.data);
							if (typeof currentMode.updateLibraryMenu === 'function') currentMode.updateLibraryMenu();
						} else if (currentMode === gameMode) {
							currentMode.deserialize(msg.content.data, false, msg.user.networkId, msg.user.name);
						} else {
							currentMode.deserialize(msg.content.data.strokes, msg.content.data.figures, true);
						}
					}
					break;
				case 'clear':
					if (currentMode && typeof currentMode.clear === 'function') {
						if (currentMode === numberMode) {
							currentMode.clear(true);
						} else {
							currentMode.clear();
						}
					}
					break;
				case 'notification':
					if (msg.content.event === 'headToHeadClaim') {
						var myId = presence.getUserInfo().networkId;
						if (msg.content.objectId === myId || msg.content.subjectId === myId) {
							var oppId = (msg.content.objectId === myId) ? msg.content.subjectId : msg.content.objectId;
							if (currentMode === gameMode && typeof gameMode.checkHeadToHeadAgreement === 'function') {
								if (gameMode.checkHeadToHeadAgreement(oppId)) {
									// Send the elimination notification
									presence.sendMessage(presence.getSharedInfo().id, {
										user: presence.getUserInfo(),
										content: {
											action: 'notification',
											event: 'eliminatedEachOther',
											subjectName: msg.content.subjectName,
											subjectColor: msg.content.subjectColor,
											objectName: msg.content.objectName,
											subjectId: msg.content.subjectId,
											objectId: msg.content.objectId
										}
									});
								}
							}
						}
					break;
					}
					formatAndLogNotification(msg.content.event, msg.content.subjectName, msg.content.subjectColor, msg.content.objectName);
					if (msg.content.event === 'eliminated' || msg.content.event === 'eliminatedEachOther') {
						var myId = presence.getUserInfo().networkId;
						if (msg.content.objectId === myId || (msg.content.event === 'eliminatedEachOther' && msg.content.subjectId === myId)) {
							if (currentMode === gameMode && typeof gameMode.killPlayer === 'function') {
								gameMode.killPlayer();
							}
						}
					} else if (msg.content.event === 'gameWon' || msg.content.event === 'win') {
						if (currentMode === gameMode && typeof gameMode.endGame === 'function') {
							gameMode.endGame();
						}
					}
					break;
				case 'start-game':
					if (currentMode === gameMode && typeof gameMode.startGame === 'function') {
						isGameStarted = true;
						var rb = document.getElementById('robot-button');
						if (rb) {
							rb.disabled = true;
							rb.style.opacity = 0.5;
						}
						document.getElementById('play-button').style.display = 'none';
						document.getElementById('restart-button').style.display = isHost ? '' : 'none';
						gameMode.startGame(false, getMySpawnIndex());
					}
					break;
				case 'restart-game':
					if (currentMode === gameMode && typeof gameMode.restart === 'function') {
						gameMode.restart(false, getMySpawnIndex());
					}
					break;
				case 'stop-shared-game':
				case 'timer-selected':
				case 'finish-challenge':
				case 'figure-completed':
				case 'restart-challenge':
					if (currentMode === numberMode && typeof currentMode.handleNetworkMessage === 'function') {
						currentMode.handleNetworkMessage(msg);
					}
					break;
				case 'update-spawns':
					if (typeof gameMode.setTotalPlayers === 'function') {
						gameMode.setTotalPlayers(msg.content.totalUsers);
						if (currentMode === gameMode && typeof gameMode.previewGame === 'function') {
							if (!isGameStarted) {
								gameMode.previewGame(false, mySharedSpawnIndex, true);
							}
						}
					}
					break;
				case 'update-speed':
					if (currentMode === gameMode && typeof gameMode.setSpeed === 'function') {
						gameMode.setSpeed(msg.content.speed);
					}
					break;
			}
		};
		var nextSpawnIndex = 1;

		// Handle user join/leave
		var onNetworkUserChanged = function (msg) {
			if (msg.move === 1 && currentMode && typeof currentMode.serialize === 'function') {
				if (isHost) {
					var joinerSpawnIndex = nextSpawnIndex++;
					if (typeof gameMode.setTotalPlayers === 'function') {
						gameMode.setTotalPlayers(nextSpawnIndex);
					}
					if (currentMode === gameMode && typeof gameMode.previewGame === 'function') {
						if (!isGameStarted) {
							gameMode.previewGame(false, mySharedSpawnIndex, true);
						}
					}
					var content = {
						action: 'init',
						mode: currentMode === numberMode ? 'number' : (currentMode === gameMode ? 'game' : 'draw'),
						data: currentMode === numberMode ? currentMode.serialize(true) : currentMode.serialize(),
						spawnIndex: joinerSpawnIndex,
						totalUsers: nextSpawnIndex,
						gameSpeed: currentMode === gameMode && typeof gameMode.getSpeed === 'function' ? gameMode.getSpeed() : undefined,
						targetNetworkId: msg.user.networkId
					};
					if (currentMode === numberMode && typeof currentMode.getSharedState === 'function') {
						var state = currentMode.getSharedState();
						content.challengeActive = state.challengeActive;
						content.challengeRemaining = state.challengeRemaining;
						content.challengeDuration = state.challengeDuration;
						content.challengeScores = state.challengeScores;
						content.currentChallengeScore = state.currentChallengeScore;
					}
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: content
					});
					
					// Broadcast new players to all existing players
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: 'update-spawns',
							totalUsers: nextSpawnIndex
						}
					});
				}
				// All existing players broadcast their state to the new joiner
				if (hasReceivedInit || isHost) {
					if (currentMode === gameMode && typeof broadcastUpdate === 'function') {
						broadcastUpdate();
					}
				}
			}
			if (msg.move === -1) {
				if (currentMode === gameMode && typeof gameMode.removeOpponent === 'function') {
					gameMode.removeOpponent(msg.user.networkId);
				}
			}
			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "join" : "leave"));
		};

		// Set language from environment
		var currentenv;
		env.getEnvironment(function (err, environment) {
			currentenv = environment;
			if (numberMode && typeof numberMode.setEnvironment === 'function') {
				numberMode.setEnvironment(environment);
			}
			if (environment && environment.user && environment.user.name) {
				if (gameMode && typeof gameMode.setLocalPlayerName === 'function') {
					gameMode.setLocalPlayerName(environment.user.name);
				}
			}
			if (environment && environment.user && environment.user.colorvalue) {
				buddyStroke = environment.user.colorvalue.stroke || buddyStroke;
				buddyFill = environment.user.colorvalue.fill || buddyFill;
				if (numberMode && typeof numberMode.setBuddyColors === 'function') {
					numberMode.setBuddyColors(buddyStroke, buddyFill);
				}
				if (gameMode && typeof gameMode.setBuddyColors === 'function') {
					gameMode.setBuddyColors(buddyStroke, buddyFill);
				}
			}

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
						try {
							var parsed = JSON.parse(data);
							if (parsed.drawData !== undefined || parsed.numberData !== undefined) {
								if (drawMode && typeof drawMode.deserialize === 'function' && parsed.drawData) {
									drawMode.deserialize(parsed.drawData.strokes, parsed.drawData.figures);
								}
								if (numberMode && typeof numberMode.deserialize === 'function' && parsed.numberData) {
									numberMode.deserialize(parsed.numberData);
									if (typeof updateLibraryMenu === 'function') updateLibraryMenu();
								}
								if (parsed.mode === 'number') {
									currentMode = null;
									switchMode(numberMode, 'mode-number', true);
								} else {
									currentMode = null;
									switchMode(drawMode, 'mode-draw', true);
								}
							} else {
								if (parsed.libraries) {
									if (numberMode && typeof numberMode.deserialize === 'function') {
										numberMode.deserialize(parsed);
										if (typeof updateLibraryMenu === 'function') updateLibraryMenu();
									}
									currentMode = null;
									switchMode(numberMode, 'mode-number', true);
								} else {
									if (drawMode && typeof drawMode.deserialize === 'function') {
										drawMode.deserialize(parsed.strokes, parsed.figures);
									}
									currentMode = null;
									switchMode(drawMode, 'mode-draw', true);
								}
							}
						} catch (e) {
							console.log("Error loading instance", e);
						}
					}
				});
			}

			// Handle shared instances (joining)
			if (environment.sharedId) {
				console.log("Shared instance");
				activity.getPresenceObject(function (error, network) {
					presence = network;
					if (typeof numberMode.initNetwork === 'function') numberMode.initNetwork(presence, isHost, activity);
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
					setSharedToolbar();
				});
			}
		});

		// Save in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			console.log("writing...");

			var dataToSave = {
				mode: currentMode === numberMode ? 'number' : 'draw'
			};
			if (drawMode && typeof drawMode.serialize === 'function') {
				dataToSave.drawData = drawMode.serialize();
			}
			if (numberMode && typeof numberMode.serialize === 'function') {
				dataToSave.numberData = numberMode.serialize();
			}
			var jsonData = JSON.stringify(dataToSave);
			
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

		// Mode palette
		var menuData = [
			{
				icon: true,
				id: "mode-draw",
				label: l10n.get("DrawMode") || "Draw Mode"
			},
			{
				icon: true,
				id: "mode-number",
				label: l10n.get("NumberMode") || "Number Mode"
			},
			{
				icon: true,
				id: "mode-game",
				label: l10n.get("GameMode") || "Game Mode"
			}
		];
		var modeButton = document.getElementById('mode-button');
		var modePalette = new menupalette.MenuPalette(modeButton, undefined, menuData);
		var modeInvoker = modePalette.getPalette().querySelector('.palette-invoker');

		var libraryButton = document.getElementById('library-button');
		var libraryPalette = new menupalette.MenuPalette(libraryButton, undefined, []);

		document.addEventListener('click', function (event) {
			if (libraryPalette && !libraryPalette.isDown()) {
				var pEl = libraryPalette.getPalette();
				if (pEl && !pEl.contains(event.target) && libraryButton && !libraryButton.contains(event.target)) {
					libraryPalette.popDown();
				}
			}
		}, true);

		function updateLibraryMenu() {
			if (numberMode && typeof numberMode.updateLibraryMenu === 'function') {
				numberMode.updateLibraryMenu(libraryPalette, l10n);
			}
		}

		function switchMode(newMode, iconName, skipBroadcast) {
			if (currentMode === newMode) return;
			if (currentMode && typeof currentMode.stopDrawing === 'function') {
				currentMode.stopDrawing();
			}
			if (currentMode && typeof currentMode.stopCreatingFigure === 'function') {
				currentMode.stopCreatingFigure();
			}
			if (currentMode && typeof currentMode.deactivate === 'function') {
				currentMode.deactivate();
			}
			currentMode = newMode;

			modeButton.style.backgroundImage = "url('icons/" + iconName + ".svg')";
			if (modeInvoker) {
				modeInvoker.style.backgroundImage = "url('icons/" + iconName + ".svg')";
			}

			if (newMode === numberMode) {
				document.getElementById('colors-button-fill').style.display = 'none';
				if (colorPaletteFill) colorPaletteFill.popDown();
				document.getElementById('draw-button').style.display = 'none';
				document.getElementById('erase-button').style.display = 'none';
				document.getElementById('clear-button').style.display = 'none';
				document.getElementById('restart-button').style.display = 'none';
				document.getElementById('robot-button').style.display = 'none';
				document.getElementById('speed-button').style.display = 'none';
				document.getElementById('play-button').style.display = 'none';
				document.getElementById('save-image-button').style.display = 'none';
				
				if (typeof newMode.activate === 'function') newMode.activate();
			
				updateLibraryMenu();
				numberMode.showGallery(undefined, l10n, skipBroadcast);
			} else if (newMode === gameMode) {
				document.getElementById('colors-button-fill').style.display = 'none';
				if (colorPaletteFill) colorPaletteFill.popDown();
				document.getElementById('draw-button').style.display = 'none';
				document.getElementById('erase-button').style.display = 'none';
				document.getElementById('clear-button').style.display = 'none';
				document.getElementById('restart-button').style.display = 'none';
				document.getElementById('save-image-button').style.display = 'none';
				var rb = document.getElementById('robot-button');
				rb.style.display = 'none';
				document.getElementById('speed-button').style.display = (((currentenv && currentenv.sharedId) || presence) && !isHost) ? 'none' : '';
				if (!presence) {
					rb.style.display = '';
					rb.disabled = false;
					rb.style.opacity = 1;
				}

				var pb = document.getElementById('play-button');
				pb.style.display = (presence && !isHost) ? 'none' : '';

				var canPlay = presence ? false : isRobotOn;
				if (canPlay) {
					pb.disabled = false;
					pb.style.opacity = 1;
				} else {
					pb.disabled = true;
					pb.style.opacity = 0.5;
				}
				
				isGameStarted = false;
				if (typeof newMode.previewGame === 'function') newMode.previewGame(presence ? false : isRobotOn, getMySpawnIndex());
				
				if (libraryPalette) libraryPalette.popDown();
				var gallery = document.getElementById('library-gallery');
				if (gallery) gallery.style.display = 'none';
				var formScreen = document.getElementById('category-form-screen');
				if (formScreen) formScreen.style.display = 'none';
				var gridCanvas = document.getElementById('gridCanvas');
				if (gridCanvas) gridCanvas.style.display = '';
				var playBackBtn = document.getElementById('play-figure-back-button');
				if (playBackBtn) playBackBtn.style.display = 'none';

			} else {
				document.getElementById('colors-button-fill').style.display = '';
				document.getElementById('draw-button').style.display = '';
				document.getElementById('erase-button').style.display = '';
				document.getElementById('clear-button').style.display = '';
				document.getElementById('restart-button').style.display = 'none';
				document.getElementById('robot-button').style.display = 'none';
				document.getElementById('speed-button').style.display = 'none';
				document.getElementById('play-button').style.display = 'none';
				document.getElementById('save-image-button').style.display = '';
				
				if (numberMode && typeof numberMode.deactivate === 'function') numberMode.deactivate();
				
				if (libraryPalette) libraryPalette.popDown();
				var gallery = document.getElementById('library-gallery');
				if (gallery) gallery.style.display = 'none';
				var formScreen = document.getElementById('category-form-screen');
				if (formScreen) formScreen.style.display = 'none';
				var gridCanvas = document.getElementById('gridCanvas');
				if (gridCanvas) gridCanvas.style.display = '';
				var playBackBtn = document.getElementById('play-figure-back-button');
				if (playBackBtn) playBackBtn.style.display = 'none';
				if (newMode && typeof newMode.setTool === 'function') {
					newMode.setTool('draw');
				}
				document.getElementById('draw-button').classList.add('active');
				document.getElementById('erase-button').classList.remove('active');
			}

			if (!skipBroadcast) {
				broadcastUpdate();
			}
		}

		modePalette.addEventListener('selectItem', function (e) {
			var targetButton = e.detail.target;
			while (targetButton && targetButton.tagName !== 'BUTTON' && targetButton.parentElement) {
				targetButton = targetButton.parentElement;
			}
			var selectedId = targetButton ? targetButton.id : '';
			if (selectedId === 'mode-number') {
				switchMode(numberMode, 'mode-number');
			} else if (selectedId === 'mode-draw') {
				switchMode(drawMode, 'mode-draw');
			} else if (selectedId === 'mode-game') {
				switchMode(gameMode, 'mode-game');
			}
		});

		updateLibraryMenu();

		libraryButton.addEventListener('click', function () {
			var gallery = document.getElementById('library-gallery');
			var leaderboardScreen = document.getElementById('leaderboard-screen');
			var endScreen = document.getElementById('end-screen');
			var isPopupVisible = (leaderboardScreen && leaderboardScreen.style.display !== 'none') || 
			                     (endScreen && endScreen.style.display !== 'none');
			if (gallery && gallery.style.display === 'none' && currentMode === numberMode && !isPopupVisible) {
				numberMode.showGallery(undefined, l10n);
				if (libraryPalette) libraryPalette.popDown();
			}
		});

		var viewButton = document.getElementById('view-button');
		var createCategoryButton = document.getElementById('create-category-button');
		if (viewButton) {
			viewButton.addEventListener('click', function () {
				if (currentMode === numberMode && typeof numberMode.toggleView === 'function') {
					numberMode.toggleView();
				}
			});
		}
		if (createCategoryButton) {
			createCategoryButton.addEventListener('click', function (e) {
				e.stopPropagation();
				if (currentMode === numberMode && typeof numberMode.showCategoryForm === 'function') {
					numberMode.showCategoryForm(l10n);
				}
			});
		}

		// Color palette (Fill Color)
		var currentFillColor = '#ed2529';
		var colorsButtonFill = document.getElementById('colors-button-fill');
		var colorPaletteFill = new colorpalette.ColorPalette(colorsButtonFill, undefined, "fill");
		var colorInvokerFill = colorPaletteFill.getPalette().querySelector('.palette-invoker');
		colorPaletteFill.addEventListener('colorChange', function (e) {
			currentFillColor = e.detail.color;
			colorsButtonFill.style.backgroundColor = e.detail.color;
			if (colorInvokerFill) {
				colorInvokerFill.style.backgroundColor = e.detail.color;
			}
			if (currentMode && typeof currentMode.setFillColor === 'function') {
				currentMode.setFillColor(e.detail.color);
			}
		});
		colorPaletteFill.setColor(0);
		// Speed palette for Game Mode
		var speedButton = document.getElementById('speed-button');
		var speedPal = new speedPalette.SpeedPalette(speedButton, undefined);
		var lastSpeedSend = 0;
		speedButton.addEventListener('speedChanged', function (e) {
			if (currentMode === gameMode && typeof gameMode.setSpeed === 'function') {
				gameMode.setSpeed(e.detail.speed);
				if (isHost && presence && presence.getSharedInfo()) {
					var now = Date.now();
					if (now - lastSpeedSend > 150) {
						presence.sendMessage(presence.getSharedInfo().id, {
							user: presence.getUserInfo(),
							content: {
								action: 'update-speed',
								speed: e.detail.speed
							}
						});
						lastSpeedSend = now;
					}
					if (window.speedSyncTimer) clearTimeout(window.speedSyncTimer);
					window.speedSyncTimer = setTimeout(function () {
						presence.sendMessage(presence.getSharedInfo().id, {
							user: presence.getUserInfo(),
							content: {
								action: 'update-speed',
								speed: e.detail.speed
							}
						});
						lastSpeedSend = Date.now();
					}, 200);
				}
			}
		});

		// Handle click on help-button
		document.getElementById("help-button").addEventListener('click', function (e) {
			tutorial.start();
		});

		// Handle draw button
		document.getElementById("draw-button").addEventListener('click', function () {
			if (currentMode && typeof currentMode.setTool === 'function') {
				currentMode.setTool('draw');
			}
			this.classList.add("active");
			document.getElementById("erase-button").classList.remove("active");
		});

		// Handle erase button
		document.getElementById("erase-button").addEventListener('click', function () {
			if (currentMode && typeof currentMode.setTool === 'function') {
				currentMode.setTool('erase');
			}
			this.classList.add("active");
			document.getElementById("draw-button").classList.remove("active");
		});

		// Handle restart button
		document.getElementById("restart-button").addEventListener('click', function () {
			if (currentMode && typeof currentMode.restart === 'function') {
				if (currentMode === gameMode) {
					currentMode.restart(presence ? false : isRobotOn, getMySpawnIndex());
				} else {
					currentMode.restart();
				}
			}
			if (presence && currentMode === gameMode) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'restart-game',
						mode: 'game'
					}
				});
				broadcastUpdate();
			}
		});

		// Handle clear button
		document.getElementById("clear-button").addEventListener('click', function () {
			if (currentMode && typeof currentMode.clear === 'function') {
				currentMode.clear();
			}
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'clear',
						mode: currentMode === numberMode ? 'number' : 'draw'
					}
				});
			}
			broadcastUpdate();
		});

		// Handle Add to Journal
		document.getElementById("save-image-button").addEventListener('click', function () {
			var mimetype = 'image/png';

			// Render without dots
			if (currentMode === drawMode) {
				ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				if (typeof currentMode.drawBehindDots === 'function') {
					currentMode.drawBehindDots(ctx);
				}
			}

			var inputData = canvas.toDataURL(mimetype, 1);

			if (currentMode === drawMode) {
				ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			}

			var metadata = {
				mimetype: mimetype,
				title: "ConnectTheDots",
				activity: "org.olpcfrance.MediaViewerActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			datastore.create(metadata, function () {
				humane.log(l10n.get("ImageSavedToJournal"));
			}, inputData);
		});

		var isRobotOn = true;
		var isGameStarted = false;
		var robotButton = document.getElementById('robot-button');
		var playButton = document.getElementById('play-button');

		var robotMenuData = [
			{ icon: false, id: "robot-level-1", label: l10n.get("Level1") || "Level 1" },
			{ icon: false, id: "robot-level-2", label: l10n.get("Level2") || "Level 2" },
			{ icon: false, id: "robot-level-3", label: l10n.get("Level3") || "Level 3" }
		];
		var robotPalette = new menupalette.MenuPalette(robotButton, undefined, robotMenuData);
		var robotInvoker = robotPalette.getPalette().querySelector('.palette-invoker');
		
		// Set initial selected item
		var buttons = robotPalette.getPalette().querySelectorAll('button');
		for (var i = 0; i < buttons.length; i++) {
			if (buttons[i].id === 'robot-level-1') {
				buttons[i].classList.add('palette-item-selected');
			}
		}

		robotPalette.addEventListener('selectItem', function (e) {
			if (isGameStarted) return;
			var targetButton = e.detail.target;
			while (targetButton && targetButton.tagName !== 'BUTTON' && targetButton.parentElement) {
				targetButton = targetButton.parentElement;
			}
			var selectedId = targetButton ? targetButton.id : '';
			
			if (selectedId) {
				var buttons = robotPalette.getPalette().querySelectorAll('button');
				for (var i = 0; i < buttons.length; i++) {
					if (buttons[i].id === selectedId) {
						buttons[i].classList.add('palette-item-selected');
					} else {
						buttons[i].classList.remove('palette-item-selected');
					}
				}

				isRobotOn = true;
				var level = 1;
				if (selectedId === 'robot-level-1') level = 1;
				if (selectedId === 'robot-level-2') level = 2;
				if (selectedId === 'robot-level-3') level = 3;
				
				if (gameMode && typeof gameMode.setAiLevel === 'function') {
					gameMode.setAiLevel(level);
				}

				robotButton.style.backgroundImage = "url('icons/robot-on.svg')";
				if (robotInvoker) {
					robotInvoker.style.backgroundImage = "url('icons/robot-on.svg')";
				}

				var canPlay = isRobotOn;
				if (canPlay) {
					playButton.disabled = false;
					playButton.style.opacity = 1;
				} else {
					playButton.disabled = true;
					playButton.style.opacity = 0.5;
				}
				if (currentMode === gameMode) {
					if (typeof gameMode.previewGame === 'function') {
						gameMode.previewGame(presence ? false : isRobotOn, getMySpawnIndex());
					}
				}
			}
		});

		playButton.addEventListener('click', function () {
			var opponentCount = 0;
			if (currentMode === gameMode && typeof gameMode.getOpponentCount === 'function') {
				opponentCount = gameMode.getOpponentCount();
			}
			var canPlay = presence ? (isHost && opponentCount > 0) : isRobotOn;
			if (!canPlay) return;

			isGameStarted = true;
			robotButton.disabled = true;
			robotButton.style.opacity = 0.5;

			if (currentMode && typeof currentMode.startGame === 'function') {
				currentMode.startGame(presence ? false : isRobotOn, getMySpawnIndex());
			}
			playButton.style.display = 'none';
			document.getElementById('restart-button').style.display = (presence && !isHost) ? 'none' : '';

			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'start-game',
						mode: 'game'
					}
				});
				broadcastUpdate();
			}
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

		// Handle localized event
		window.addEventListener("localized", function () {
			document.getElementById("activity-button").title = l10n.get("ConnectTheDots");
			document.getElementById("network-button").title = l10n.get("Network");
			document.getElementById("mode-button").title = l10n.get("Mode") || "Mode";
			document.getElementById("library-button").title = l10n.get("Library") || "Library";
			if (document.getElementById("view-button")) {
				var isSettingMode = (typeof numberMode !== 'undefined' && numberMode.getView && numberMode.getView() === 'setting');
				document.getElementById("view-button").title = isSettingMode ? (l10n.get("Play") || "Play") : (l10n.get("View") || "View");
			}
			if (document.getElementById("create-category-button")) document.getElementById("create-category-button").title = l10n.get("NewCategory") || "New Category";
			if (document.getElementById("category-form-title")) document.getElementById("category-form-title").innerHTML = l10n.get("NewTitle") || "New Category";
			if (document.getElementById("category-form-label")) document.getElementById("category-form-label").innerHTML = l10n.get("Title") || "Title";
			if (document.getElementById("category-confirm-span")) document.getElementById("category-confirm-span").innerHTML = l10n.get("Confirm") || "Confirm";
			if (document.getElementById("category-cancel-span")) document.getElementById("category-cancel-span").innerHTML = l10n.get("Cancel") || "Cancel";
			if (document.getElementById("figure-form-title")) document.getElementById("figure-form-title").innerHTML = l10n.get("NewFigure") || "New Figure";
			if (document.getElementById("figure-form-label")) document.getElementById("figure-form-label").innerHTML = l10n.get("Name") || "Name";
			if (document.getElementById("figure-confirm-span")) document.getElementById("figure-confirm-span").innerHTML = l10n.get("Confirm") || "Confirm";
			if (document.getElementById("figure-cancel-span")) document.getElementById("figure-cancel-span").innerHTML = l10n.get("Cancel") || "Cancel";
			
			if (document.getElementById("leaderboard-rank-label")) document.getElementById("leaderboard-rank-label").innerHTML = l10n.get("Rank") || "Rank";
			if (document.getElementById("leaderboard-user-label")) document.getElementById("leaderboard-user-label").innerHTML = l10n.get("User") || "User";
			if (document.getElementById("leaderboard-score-label")) document.getElementById("leaderboard-score-label").innerHTML = l10n.get("Score") || "Score";
			if (document.getElementById("btn-see-leaderboard")) document.getElementById("btn-see-leaderboard").title = l10n.get("SeeLeaderboard") || "See Leaderboard";
			if (document.getElementById("btn-restart-challenge")) document.getElementById("btn-restart-challenge").title = l10n.get("RestartChallenge") || "Restart Challenge";
			if (document.getElementById("end-total-time") && document.getElementById("end-total-time").innerHTML.indexOf(":") !== -1) {
				var parts = document.getElementById("end-total-time").innerHTML.split(":");
				document.getElementById("end-total-time").innerHTML = (l10n.get("TotalTime") || "Total Time") + ":" + parts[1] + (parts[2] ? ":" + parts[2] : "");
			}
			if (document.getElementById("end-total-score") && document.getElementById("end-total-score").innerHTML.indexOf(":") !== -1) {
				var parts2 = document.getElementById("end-total-score").innerHTML.split(":");
				document.getElementById("end-total-score").innerHTML = (l10n.get("TotalScore") || "Total Score") + ":" + parts2[1];
			}

			var modeDrawElem = document.getElementById("mode-draw");
			if (modeDrawElem) modeDrawElem.innerHTML = '<span></span>' + (l10n.get("DrawMode") || "Draw Mode");
			var modeNumElem = document.getElementById("mode-number");
			if (modeNumElem) modeNumElem.innerHTML = '<span></span>' + (l10n.get("NumberMode") || "Number Mode");
			var modeGameElem = document.getElementById("mode-game");
			if (modeGameElem) modeGameElem.innerHTML = '<span></span>' + (l10n.get("GameMode") || "Game Mode");
			var libBasicElem = document.getElementById("lib-basic-shapes");
			if (libBasicElem) libBasicElem.innerHTML = l10n.get("BasicShapes") || "Basic Shapes";
			var libObjElem = document.getElementById("lib-objects");
			if (libObjElem) libObjElem.innerHTML = l10n.get("Objects") || "Objects";
			document.getElementById("fullscreen-button").title = l10n.get("Fullscreen");
			document.getElementById("unfullscreen-button").title = l10n.get("Unfullscreen");
			document.getElementById("help-button").title = l10n.get("Tutorial");
			document.getElementById("stop-button").title = l10n.get("Stop");
			document.getElementById("robot-button").title = l10n.get("AIOpponent") || "AI Opponent";
			document.getElementById("play-button").title = l10n.get("Play") || "Play";
			document.getElementById("draw-button").title = l10n.get("Draw");
			document.getElementById("erase-button").title = l10n.get("Erase") || "Erase";
			document.getElementById("clear-button").title = l10n.get("Clear");
			document.getElementById("restart-button").title = l10n.get("Restart") || "Restart";
			document.getElementById("speed-button").title = l10n.get("GameSpeed") || "Game Speed";
			document.getElementById("stop-game-button").title = l10n.get("StopGame") || "Stop Game";
		});

		// Initialize Shared Grid and Modes
		initDots();
		resize();
		requestAnimationFrame(renderLoop);
		drawMode.init(dots, broadcastUpdate, currentFillColor);
		numberMode.init(dots, broadcastUpdate, currentFillColor);

		function onGameModeOpponentCountChanged(count) {
			if (currentMode !== gameMode || isGameStarted) return;
			if (presence) {
				var pb = document.getElementById('play-button');
				if (count > 0 && isHost) {
					pb.disabled = false;
					pb.style.opacity = 1;
				} else {
					pb.disabled = true;
					pb.style.opacity = 0.5;
				}
			}
		}
		gameMode.init(dots, broadcastUpdate, spacing, onGameModeOpponentCountChanged, function(event, subjectName, subjectColor, objectName, isSubLocal, isObjLocal, subjectId, objectId) {
			formatAndLogNotification(event, subjectName, subjectColor, objectName);
			if (presence) {
				var myId = presence.getUserInfo().networkId;
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'notification',
						event: event,
						subjectName: subjectName,
						subjectColor: subjectColor,
						objectName: objectName,
						subjectId: isSubLocal ? myId : subjectId,
						objectId: isObjLocal ? myId : objectId
					}
				});
			}

			// Handle single-player game over
			if (!presence && (event === 'win' || event === 'gameWon' || event === 'eliminated' || event === 'hitWall' || event === 'intercepted')) {
				isGameStarted = false;
				if (robotButton) {
					robotButton.disabled = false;
					robotButton.style.opacity = 1;
				}
				var pb = document.getElementById('play-button');
				var rb = document.getElementById('restart-button');
				if (pb) {
					pb.style.display = 'none';
				}
				if (rb) {
					rb.style.display = '';
					rb.disabled = false;
					rb.style.opacity = 1;
				}
			}
		});
		if (typeof numberMode.setBuddyColors === 'function') {
			numberMode.setBuddyColors(buddyStroke, buddyFill);
		}
		if (currentMode && typeof currentMode.setTool === 'function') {
			currentMode.setTool('draw');
		}
		modeButton.style.backgroundImage = "url('icons/mode-draw.svg')";
		if (modeInvoker) {
			modeInvoker.style.backgroundImage = "url('icons/mode-draw.svg')";
		}
		document.getElementById("draw-button").classList.add('active');
		document.getElementById("erase-button").classList.remove('active');
	});
});
define(["sugar-web/activity/activity", "sugar-web/env", "l10n", "sugar-web/graphics/presencepalette", "sugar-web/datastore", "tutorial", "activity/palettes/color-palette", "activity/modes/draw-mode", "sugar-web/graphics/menupalette", "activity/modes/number-mode", "activity/palettes/timerPalette", "sugar-web/graphics/icon", "activity/modes/game-mode", "activity/palettes/speedPalette", "humane"], function (activity, env, l10n, presencepalette, datastore, tutorial, colorpalette, drawMode, menupalette, numberMode, timerPalette, icon, gameMode, speedPalette, humane) {
	requirejs(['domReady!'], function (doc) {

		activity.setup();

		var currentMode = drawMode;
		var canvas = document.getElementById('gridCanvas');
		var ctx = canvas ? canvas.getContext('2d') : null;
		var modeButton = document.getElementById('mode-button');
		var libraryButton = document.getElementById('library-button');
		var colorsButtonFill = document.getElementById('colors-button-fill');
		var drawButton = document.getElementById('draw-button');
		var eraseButton = document.getElementById('erase-button');
		var clearButton = document.getElementById('clear-button');
		var restartButton = document.getElementById('restart-button');
		var robotButton = document.getElementById('robot-button');
		var speedButton = document.getElementById('speed-button');
		var playButton = document.getElementById('play-button');
		var saveImageButton = document.getElementById('save-image-button');
		var libraryGallery = document.getElementById('library-gallery');
		var categoryFormScreen = document.getElementById('category-form-screen');
		var playFigureBackButton = document.getElementById('play-figure-back-button');
		var isRobotOn = true;
		var isGameStarted = false;
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
		var joinExclusionTriggered = false;
		var pendingPreInitNotifications = [];
		var initRequestTimer = null;
		var initRequestQuickTimer = null;
		var initRequestAttempts = 0;
		var clientInitToken = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
		var backgroundTickTimer = null;
		var backgroundTickWorker = null;
		var backgroundTickBlobUrl = null;
		var lastRenderLoopAt = 0;

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
			var resetPointer = function () {
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			};

			var endTouch = function (e) {
				if (e && e.target === canvas && e.cancelable) e.preventDefault();
				resetPointer();
			};
			var handlePointerDown = function (clientX, clientY) {
				var rect = canvas.getBoundingClientRect();
				mouseX = (clientX - rect.left) / zoom;
				mouseY = (clientY - rect.top) / zoom;
				prevMouseX = mouseX;
				prevMouseY = mouseY;
				if (currentMode && typeof currentMode.onMouseDown === 'function') {
					currentMode.onMouseDown(mouseX, mouseY);
				}
			};
			var handlePointerMove = function (clientX, clientY) {
				var rect = canvas.getBoundingClientRect();
				var newMouseX = (clientX - rect.left) / zoom;
				var newMouseY = (clientY - rect.top) / zoom;
				if (currentMode && typeof currentMode.onMouseMove === 'function') {
					currentMode.onMouseMove(newMouseX, newMouseY, prevMouseX, prevMouseY);
				}
				mouseX = newMouseX;
				mouseY = newMouseY;
				prevMouseX = newMouseX;
				prevMouseY = newMouseY;
			};

			window.addEventListener('mouseup', resetPointer);
			window.addEventListener('touchend', endTouch, { passive: false });
			window.addEventListener('touchcancel', endTouch, { passive: false });

			canvas.addEventListener('mousedown', function (e) {
				if (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
				handlePointerDown(e.clientX, e.clientY);
			});
			canvas.addEventListener('touchstart', function (e) {
				if (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
				if (e && e.cancelable) e.preventDefault();
				if (e.touches.length > 0) {
					handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
				}
			}, { passive: false });
			canvas.addEventListener('mousemove', function (e) {
				if (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
				handlePointerMove(e.clientX, e.clientY);
			});
			canvas.addEventListener('touchmove', function (e) {
				if (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
				if (e && e.cancelable) e.preventDefault();
				if (e.touches.length > 0) {
					handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
				}
			}, { passive: false });
			canvas.addEventListener('mouseout', function () {
				if (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
				resetPointer();
			});
		}

		var nowMs = function () {
			return (typeof performance !== 'undefined' && typeof performance.now === 'function')
				? performance.now()
				: Date.now();
		};
		var lastTime = nowMs();
		lastRenderLoopAt = lastTime;
		function renderLoop() {
			var now = nowMs();
			lastRenderLoopAt = now;
			var delta = Math.max(0, now - lastTime);
			lastTime = now;
			
			if (!ctx) return;
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			var isWaitingOrExcluded = (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) ||
				joinExclusionTriggered ||
				(presence && !isHost && !hasReceivedInit);

			if (isWaitingOrExcluded) {
				for (var i = 0; i < dots.length; i++) {
					var dot = dots[i];
					ctx.beginPath();
					ctx.arc(dot.x, dot.y, dot.baseR, 0, Math.PI * 2);
					ctx.fillStyle = dot.color || '#a0a0a0';
					ctx.fill();
				}
				requestAnimationFrame(renderLoop);
				return;
			}

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
		var myUserInfo = null;
		function getMyUserInfo() {
			if ((!myUserInfo || !myUserInfo.networkId) && presence && typeof presence.getUserInfo === 'function') {
				myUserInfo = presence.getUserInfo();
			}
			return myUserInfo;
		}
		var isHost = false;
		var hostNetworkId = null;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);

		function stopBackgroundTickLoop() {
			if (backgroundTickWorker) {
				try {
					backgroundTickWorker.terminate();
				} catch (ignore) {}
				backgroundTickWorker = null;
			}
			if (backgroundTickBlobUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
				try {
					URL.revokeObjectURL(backgroundTickBlobUrl);
				} catch (ignore) {}
				backgroundTickBlobUrl = null;
			}
			if (backgroundTickTimer) {
				clearInterval(backgroundTickTimer);
				backgroundTickTimer = null;
			}
		}

		function runBackgroundTick(forceTick) {
			if (!presence || joinExclusionTriggered) {
				stopBackgroundTickLoop();
				return;
			}
			if (currentMode !== gameMode || typeof gameMode.tickBackground !== 'function') {
				return;
			}
			var nowBg = nowMs();
			var isHidden = !!(typeof document !== 'undefined' && document.hidden);
			var rafStalled = (nowBg - lastRenderLoopAt) >= 85;
			if (!forceTick && !isHidden && !rafStalled) {
				return;
			}
			var deltaBg = Math.max(0, nowBg - lastTime);
			if (deltaBg <= 0) return;
			lastTime = nowBg;
			gameMode.tickBackground(deltaBg);
		}

		function startFallbackInterval(intervalMs) {
			if (backgroundTickTimer) return;
			backgroundTickTimer = setInterval(function () {
				runBackgroundTick(false);
			}, intervalMs);
		}

		function syncBackgroundTickLoop() {
			var shouldRun = !!(presence && !joinExclusionTriggered);
			if (!shouldRun) {
				stopBackgroundTickLoop();
				return;
			}
			if (typeof document !== 'undefined' && document.hidden) {
				runBackgroundTick(true);
			}
			if (backgroundTickWorker || backgroundTickTimer) return;
			var intervalMs = 50;
			// Use an inline Web Worker heartbeat so hidden or unfocused windows keep ticking at 20Hz instead of 1Hz throttling
			var canUseWorker = (typeof Worker === 'function' && typeof Blob === 'function' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function');
			if (canUseWorker) {
				try {
					var workerSrc = "setInterval(function(){ postMessage('tick'); }, " + intervalMs + ");";
					var blob = new Blob([workerSrc], { type: 'application/javascript' });
					backgroundTickBlobUrl = URL.createObjectURL(blob);
					backgroundTickWorker = new Worker(backgroundTickBlobUrl);
					backgroundTickWorker.onmessage = function () {
						runBackgroundTick(false);
					};
					backgroundTickWorker.onerror = function () {
						stopBackgroundTickLoop();
						startFallbackInterval(intervalMs);
					};
					return;
				} catch (ignore) {
					stopBackgroundTickLoop();
				}
			}
			startFallbackInterval(intervalMs);
		}

		if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
			document.addEventListener('visibilitychange', syncBackgroundTickLoop);
		}

		function stopInitRequestLoop() {
			if (initRequestQuickTimer) {
				clearTimeout(initRequestQuickTimer);
				initRequestQuickTimer = null;
			}
			if (initRequestTimer) {
				clearInterval(initRequestTimer);
				initRequestTimer = null;
			}
		}

		function sendInitRequest() {
			if (isHost || hasReceivedInit || joinExclusionTriggered || !presence || typeof presence.sendMessage !== 'function') {
				stopInitRequestLoop();
				return;
			}
			var groupId = getSharedGroupId();
			var me = getMyUserInfo();
			if (!groupId || !me || !me.networkId) return;
			presence.sendMessage(groupId, {
				user: me,
				content: {
					action: 'request-init',
					initToken: clientInitToken
				}
			});
		}

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
				myUserInfo = presence.getUserInfo();
				network.createSharedActivity('org.sugarlabs.ConnectTheDots', function (groupId) {
					console.log("Activity shared");
					isHost = true;
					isGameStarted = false;
					roomOtherUsers = {};
					pendingPreInitNotifications = [];
					if (typeof numberMode.initNetwork === 'function') numberMode.initNetwork(presence, isHost, activity);
					if (typeof gameMode.initNetwork === 'function') gameMode.initNetwork(presence, isHost, activity, humane, l10n, icon);
					syncBackgroundTickLoop();
					setSharedToolbar();
					if (currentMode === numberMode && typeof numberMode.startChallenge === 'function') {
						numberMode.startChallenge(120, false); // Auto-start 2 minute challenge
					}

					// Reset the board
					if (currentMode === gameMode && typeof gameMode.previewGame === 'function') {
						gameMode.previewGame(false, 0, false);
						onGameModeOpponentCountChanged(0);
					}
				});
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		});

		function setSharedToolbar() {
			if (modeButton) modeButton.style.display = 'none';
			if (robotButton) robotButton.style.display = 'none';
			if (gameMode && typeof gameMode.setSharedSession === 'function') {
				gameMode.setSharedSession(true);
			}
			if (!isHost && speedButton) {
				speedButton.style.display = 'none';
			}
		}

		function getSharedGroupId() {
			if (presence && typeof presence.getSharedInfo === 'function') {
				var info = presence.getSharedInfo();
				if (info && info.id) return info.id;
			}
			if (currentenv && currentenv.sharedId) {
				return currentenv.sharedId;
			}
			return null;
		}

		function sendRawPresenceMessage(content) {
			if (!presence || typeof presence.sendMessage !== 'function') return;
			var groupId = getSharedGroupId();
			if (!groupId) return;
			presence.sendMessage(groupId, {
				user: getMyUserInfo(),
				content: content
			});
		}

		function sendPresenceMessage(content) {
			if (joinExclusionTriggered) return;
			if (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
			if (presence && !isHost && !hasReceivedInit) return;
			sendRawPresenceMessage(content);
		}

		function broadcastUpdate() {
			if (joinExclusionTriggered) return;
			if (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
			if (presence && !isHost && !hasReceivedInit) return;
			var isChallengeActive = false;
			if (currentMode === numberMode && typeof numberMode.getSharedState === 'function') {
				isChallengeActive = numberMode.getSharedState().challengeActive;
			}
			if (isChallengeActive) return; // Do not broadcast drawing updates during challenge

			if (currentMode === numberMode && typeof updateLibraryMenu === 'function') {
				updateLibraryMenu();
			}
			if (presence && currentMode) {
				var payloadData = null;
				if (currentMode === gameMode && typeof gameMode.serializeNetworkUpdate === 'function') {
					payloadData = gameMode.serializeNetworkUpdate();
				} else if (typeof currentMode.serialize === 'function') {
					payloadData = currentMode.serialize();
				}
				if (payloadData !== null) {
					sendPresenceMessage({
						action: 'update',
						mode: currentMode === numberMode ? 'number' : (currentMode === gameMode ? 'game' : 'draw'),
						data: payloadData
					});
				}
			}
		}

		function canAcceptHostGameControl(msg) {
			if (joinExclusionTriggered || (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded())) return false;
			if (presence && (isHost || !hasReceivedInit)) return false;
			if (presence && hostNetworkId && (!msg.user || msg.user.networkId !== hostNetworkId)) return false;
			return true;
		}

		// Handle incoming data from network
		var onNetworkDataReceived = function (msg) {
			if (!msg || !msg.content) return;
			if (joinExclusionTriggered || (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded())) {
				return;
			}
			var myUser = getMyUserInfo();
			var myNetId = myUser ? myUser.networkId : (currentenv && currentenv.user ? currentenv.user.networkId : null);
			if (myNetId && msg.user && myNetId === msg.user.networkId) {
				return;
			}

			if (msg.content.action === 'request-init') {
				if (isHost && msg.user && msg.user.networkId) {
					roomOtherUsers[msg.user.networkId] = true;
					handleHostUserAdmitOrResend(msg.user, true, msg.content.initToken);
				}
				return;
			}

			var isInitialInitAdmission = false;
			// If joining non-host has not received admission init yet
			if (!isHost && !hasReceivedInit) {
				if (msg.user && msg.user.networkId && msg.user.networkId !== myNetId) {
					roomOtherUsers[msg.user.networkId] = true;
					if (Object.keys(roomOtherUsers).length >= 8) {
						triggerJoinExclusion();
						return;
					}
				}
				if (msg.content && msg.content.totalUsers !== undefined && msg.content.totalUsers > 8) {
					triggerJoinExclusion();
					return;
				}
				// The only message an unadmitted client can proceed with is targeted init
				if (msg.content && msg.content.action === 'init') {
					if (msg.content.targetNetworkId && (!myNetId || msg.content.targetNetworkId !== myNetId)) {
						// Init targeted at someone else (or our networkId isn't ready yet)
						return;
					}
					if (msg.content.spawnIndex !== undefined && msg.content.spawnIndex >= 8) {
						triggerJoinExclusion();
						return;
					}
					// Admit client before switchMode so switchMode is not aborted by !hasReceivedInit
					hasReceivedInit = true;
					isInitialInitAdmission = true;
					stopInitRequestLoop();
					if (typeof gameMode.syncSharedMetadata === 'function') {
						gameMode.syncSharedMetadata(msg.content, myNetId, true);
					}
				} else {
					// Preserve pending deaths (notifications or final isDead updates) during admission init
					if (msg.content && msg.content.action === 'notification') {
						pendingPreInitNotifications.push({ content: msg.content });
					} else if (msg.content && msg.content.action === 'update' && msg.content.data && msg.content.data.isDead && msg.user && msg.user.networkId) {
						pendingPreInitNotifications.push({
							content: {
								event: 'eliminatedSync',
								subjectId: msg.user.networkId,
								roundId: msg.content.data.roundId
							}
						});
					}
					// Drop all other non init packets (update, start game, restart game, update spawns)
					// Unadmitted clients must NEVER deserialize opponents or switch modes!
					return;
				}
			}
			if (!isHost && msg.user && msg.user.networkId &&
				(msg.content.action === 'init' ||
				 (!hostNetworkId && (msg.content.action === 'update-spawns' ||
				 msg.content.action === 'start-game' || msg.content.action === 'restart-game')))) {
				hostNetworkId = msg.user.networkId;
			}
			var previousMode = currentMode;
			var canSwitchFromRemote = !isHost && (!hostNetworkId || (msg.user && msg.user.networkId === hostNetworkId));
			var targetMode = (msg.content.mode === 'number') ? numberMode : ((msg.content.mode === 'game') ? gameMode : ((msg.content.mode === 'draw') ? drawMode : currentMode));
			if (canSwitchFromRemote) {
				if (targetMode !== currentMode && targetMode === numberMode) {
					switchMode(numberMode, 'mode-number', true);
				} else if (targetMode !== currentMode && targetMode === gameMode) {
					switchMode(gameMode, 'mode-game', true);
				} else if (targetMode !== currentMode && targetMode === drawMode) {
					switchMode(drawMode, 'mode-draw', true);
				}
			}
			var switchedIntoGame = (previousMode !== gameMode && currentMode === gameMode);
			switch (msg.content.action) {
				case 'init':
					if (isHost || !isInitialInitAdmission) break;
					if (currentMode && typeof currentMode.deserialize === 'function') {
						if (currentMode === numberMode) {
							currentMode.deserialize(msg.content.data, true);
							if (typeof currentMode.updateLibraryMenu === 'function') currentMode.updateLibraryMenu();
						} else if (currentMode === gameMode) {
							if (typeof gameMode.applyHostInit === 'function' && gameMode.applyHostInit(msg.content, msg.user, myNetId, switchedIntoGame)) {
								isGameStarted = true;
								if (playButton) playButton.style.display = 'none';
							}
							if (pendingPreInitNotifications.length > 0 && typeof gameMode.handleNotificationMessage === 'function') {
								var activeRound = (typeof gameMode.getRoundId === 'function') ? gameMode.getRoundId() : 1;
								var queued = pendingPreInitNotifications.splice(0, pendingPreInitNotifications.length);
								for (var nq = 0; nq < queued.length; nq++) {
									var nc = queued[nq] && queued[nq].content;
									if (nc && (nc.roundId === undefined || nc.roundId === activeRound)) {
										gameMode.handleNotificationMessage(nc, myNetId, currentMode === gameMode);
									}
								}
							}
							if (typeof broadcastUpdate === 'function') {
								broadcastUpdate();
							}
						} else if (msg.content.data) {
							currentMode.deserialize(msg.content.data.strokes, msg.content.data.figures);
						}
					}
					pendingPreInitNotifications = [];
					if (msg.content.challengeActive) {
						if (currentMode === numberMode && typeof currentMode.startChallenge === 'function') {
							currentMode.startChallenge(msg.content.challengeDuration !== undefined ? msg.content.challengeDuration : 120, true);
							if (msg.content.challengeScores) currentMode.setChallengeScores(msg.content.challengeScores);
						}
					}
					break;
				case 'update':
					if (joinExclusionTriggered || (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded())) break;
					if (presence && !isHost && !hasReceivedInit) break;
					if (currentMode && typeof currentMode.deserialize === 'function') {
						if (currentMode === numberMode) {
							currentMode.deserialize(msg.content.data);
							if (typeof currentMode.updateLibraryMenu === 'function') currentMode.updateLibraryMenu();
						} else if (currentMode === gameMode) {
							currentMode.deserialize(msg.content.data, false, msg.user.networkId, msg.user.name);
						} else if (msg.content.data) {
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
					if (typeof gameMode.handleNotificationMessage === 'function') {
						gameMode.handleNotificationMessage(msg.content, myNetId, currentMode === gameMode);
					}
					break;
				case 'start-game':
					if (!canAcceptHostGameControl(msg)) break;
					if (typeof gameMode.applyStartGame === 'function' && !gameMode.applyStartGame(msg, myUser, myNetId, currentMode === gameMode)) break;
					isGameStarted = true;
					if (robotButton) {
						robotButton.disabled = true;
						robotButton.style.opacity = 0.5;
					}
					if (playButton) playButton.style.display = 'none';
					if (restartButton) restartButton.style.display = isHost ? '' : 'none';
					if (currentMode === gameMode && typeof broadcastUpdate === 'function') {
						broadcastUpdate();
					}
					break;
				case 'restart-game':
					if (!canAcceptHostGameControl(msg)) break;
					if (typeof gameMode.applyRestartGame === 'function' && !gameMode.applyRestartGame(msg, myUser, myNetId, currentMode === gameMode)) break;
					isGameStarted = true;
					if (playButton) playButton.style.display = 'none';
					if (restartButton) restartButton.style.display = isHost ? '' : 'none';
					if (currentMode === gameMode && typeof broadcastUpdate === 'function') {
						broadcastUpdate();
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
					if (!canAcceptHostGameControl(msg)) break;
					if (typeof gameMode.syncSharedMetadata === 'function' && !gameMode.syncSharedMetadata(msg.content, myNetId, false)) break;
					if (typeof gameMode.handleNetworkMessage === 'function') {
						gameMode.handleNetworkMessage(msg, myUser);
					}
					break;
				case 'update-speed':
					if (!canAcceptHostGameControl(msg)) break;
					if (currentMode === gameMode && typeof gameMode.handleNetworkMessage === 'function') {
						gameMode.handleNetworkMessage(msg, myUser);
					}
					break;
			}
		};

		var roomOtherUsers = {};

		function handleHostUserAdmitOrResend(targetUser, isFromRequestInit, initToken) {
			if (!isHost || !targetUser || !targetUser.networkId || !currentMode || typeof currentMode.serialize !== 'function') return;

			if (currentMode === gameMode) {
				var admitRes = (typeof gameMode.admitGameModeUser === 'function') ? gameMode.admitGameModeUser(targetUser, isFromRequestInit, initToken) : null;
				if (!admitRes) return;
				sendPresenceMessage(admitRes.initMessage);
				if (admitRes.updateSpawnsMessage) {
					sendPresenceMessage(admitRes.updateSpawnsMessage);
				}
			} else {
				var nonGameInfo = (typeof gameMode.admitNonGameModeUser === 'function') ?
					gameMode.admitNonGameModeUser(targetUser) : { slot: 1, totalUsers: 2, roundId: 1 };
				var nonGameContent = {
					action: 'init',
					mode: currentMode === numberMode ? 'number' : 'draw',
					data: currentMode === numberMode ? currentMode.serialize(true) : currentMode.serialize(),
					spawnIndex: nonGameInfo.slot,
					totalUsers: nonGameInfo.totalUsers,
					roundId: nonGameInfo.roundId,
					targetNetworkId: targetUser.networkId
				};
				if (currentMode === numberMode && typeof currentMode.getSharedState === 'function') {
					var state = currentMode.getSharedState();
					nonGameContent.challengeActive = state.challengeActive;
					nonGameContent.challengeRemaining = state.challengeRemaining;
					nonGameContent.challengeDuration = state.challengeDuration;
					nonGameContent.challengeScores = state.challengeScores;
					nonGameContent.currentChallengeScore = state.currentChallengeScore;
				}
				sendPresenceMessage(nonGameContent);

				if (!isFromRequestInit) {
					sendPresenceMessage({
						action: 'update-spawns',
						mode: currentMode === numberMode ? 'number' : 'draw',
						roundId: nonGameInfo.roundId,
						totalUsers: nonGameInfo.totalUsers
					});
				}
			}
		}
		function triggerJoinExclusion() {
			if (joinExclusionTriggered || isHost || hasReceivedInit) return;
			joinExclusionTriggered = true;
			pendingPreInitNotifications = [];
			stopInitRequestLoop();
			stopBackgroundTickLoop();
			if (typeof gameMode.setExcluded === 'function') {
				gameMode.setExcluded(true);
			}
			if (canvas) {
				canvas.style.pointerEvents = 'none';
			}
			mouseX = -1000;
			mouseY = -1000;
			prevMouseX = -1000;
			prevMouseY = -1000;

			if (playButton) {
				playButton.style.display = 'none';
				playButton.disabled = true;
			}
			if (restartButton) {
				restartButton.style.display = 'none';
				restartButton.disabled = true;
			}
			if (robotButton) {
				robotButton.style.display = 'none';
				robotButton.disabled = true;
			}
			if (speedButton) {
				speedButton.style.display = 'none';
			}

			// Sever network and presence connection completely
			if (presence) {
				var p = presence;
				presence = null;
				try {
					var groupId = getSharedGroupId();
					if (groupId && typeof p.leaveSharedActivity === 'function') {
						p.leaveSharedActivity(groupId);
					}
					if (typeof p.leaveNetwork === 'function') {
						p.leaveNetwork();
					}
				} catch (e) {
					console.log("Error disconnecting excluded presence", e);
				}
			}

			if (gameMode && typeof gameMode.showMaxPlayersNotification === 'function') {
				gameMode.showMaxPlayersNotification(null, getMyUserInfo() ? getMyUserInfo().colorvalue : null, 5000);
			}
			setTimeout(function () {
				var stopButton = document.getElementById("stop-button");
				if (stopButton) stopButton.click();
				else if (activity && typeof activity.close === 'function') activity.close();
			}, 5000);
		}

		// Handle user join/leave
		var onNetworkUserChanged = function (msg) {
			if (!msg || !msg.user) return;
			if (joinExclusionTriggered || (currentMode === gameMode && typeof gameMode.isExcluded === 'function' && gameMode.isExcluded())) {
				return;
			}
			var myUser = getMyUserInfo();
			var myNetId = myUser ? myUser.networkId : null;
			if (msg.user.networkId) {
				if (msg.user.networkId !== myNetId) {
					if (msg.move === 1) {
						roomOtherUsers[msg.user.networkId] = true;
					} else if (msg.move === -1) {
						delete roomOtherUsers[msg.user.networkId];
					}
				}
			}
			if (!isHost && !hasReceivedInit && Object.keys(roomOtherUsers).length >= 8) {
				triggerJoinExclusion();
				return;
			}
			if (msg.move === 1 && msg.user && msg.user.networkId && typeof gameMode.markPlayerJoined === 'function') {
				gameMode.markPlayerJoined(msg.user.networkId);
			}
			if (msg.move === 1 && currentMode && typeof currentMode.serialize === 'function') {
				if (isHost && msg.user.networkId && msg.user.networkId !== myNetId) {
					handleHostUserAdmitOrResend(msg.user, false);
				}
			}
			if (msg.move === -1) {
				if (typeof gameMode.handleUserLeave === 'function') {
					gameMode.handleUserLeave(msg.user);
				}
				if (isHost) {
					if (currentMode === gameMode) {
						sendPresenceMessage(gameMode.buildRosterContent('update-spawns'));
					} else {
						var totalRemaining = (typeof gameMode.getRoomTotalUsers === 'function') ? gameMode.getRoomTotalUsers() : 1;
						if (typeof gameMode.setTotalPlayers === 'function') {
							gameMode.setTotalPlayers(Math.min(8, totalRemaining));
						}
						sendPresenceMessage({
							action: 'update-spawns',
							mode: currentMode === numberMode ? 'number' : 'draw',
							roundId: (typeof gameMode.getRoundId === 'function') ? gameMode.getRoundId() : 1,
							totalUsers: totalRemaining
						});
					}
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
					if (presence || isHost || hasReceivedInit || (environment && environment.sharedId)) {
						return;
					}
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
					myUserInfo = presence.getUserInfo();
					if (typeof numberMode.initNetwork === 'function') numberMode.initNetwork(presence, isHost, activity);
					if (typeof gameMode.initNetwork === 'function') gameMode.initNetwork(presence, isHost, activity, humane, l10n, icon);
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
					syncBackgroundTickLoop();
					setSharedToolbar();
					stopInitRequestLoop();
					sendInitRequest();
					initRequestAttempts = 0;
					initRequestQuickTimer = setTimeout(function () {
						initRequestQuickTimer = null;
						sendInitRequest();
					}, 250);
					initRequestTimer = setInterval(function () {
						initRequestAttempts++;
						if (initRequestAttempts >= 45 || hasReceivedInit || joinExclusionTriggered || isHost || !presence) {
							stopInitRequestLoop();
							return;
						}
						sendInitRequest();
					}, 400);

					var checkUsersAndExclude = function (users) {
						if (!isHost && !hasReceivedInit && Array.isArray(users)) {
							if (users.length > 8) {
								triggerJoinExclusion();
							} else if (users.length === 8) {
								var myId = getMyUserInfo() ? getMyUserInfo().networkId : null;
								if (myId && !users.some(function (u) { return u && u.networkId === myId; })) {
									triggerJoinExclusion();
								}
							}
						}
					};

					var sharedInfo = (presence && typeof presence.getSharedInfo === 'function') ? presence.getSharedInfo() : null;
					if (sharedInfo && Array.isArray(sharedInfo.users)) {
						checkUsersAndExclude(sharedInfo.users);
					}
					if (presence && !joinExclusionTriggered && typeof presence.listSharedActivityUsers === 'function') {
						presence.listSharedActivityUsers(environment.sharedId, function (users) {
							checkUsersAndExclude(users);
						});
					}
					setTimeout(function () {
						if (!isHost && !hasReceivedInit && Object.keys(roomOtherUsers).length >= 8) {
							triggerJoinExclusion();
						}
					}, 1000);
				});
			}
		});

		// Save in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			stopInitRequestLoop();
			stopBackgroundTickLoop();
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
		var modePalette = new menupalette.MenuPalette(modeButton, undefined, menuData);
		var modeInvoker = modePalette.getPalette().querySelector('.palette-invoker');

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
			if (joinExclusionTriggered || (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded())) return;
			if (presence && !isHost && !hasReceivedInit) return;
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
				if (colorsButtonFill) colorsButtonFill.style.display = 'none';
				if (colorPaletteFill) colorPaletteFill.popDown();
				if (drawButton) drawButton.style.display = 'none';
				if (eraseButton) eraseButton.style.display = 'none';
				if (clearButton) clearButton.style.display = 'none';
				if (restartButton) restartButton.style.display = 'none';
				if (robotButton) robotButton.style.display = 'none';
				if (speedButton) speedButton.style.display = 'none';
				if (playButton) playButton.style.display = 'none';
				if (saveImageButton) saveImageButton.style.display = 'none';
				
				if (typeof newMode.activate === 'function') newMode.activate();
			
				updateLibraryMenu();
				numberMode.showGallery(undefined, l10n, skipBroadcast);
			} else if (newMode === gameMode) {
				if (colorsButtonFill) colorsButtonFill.style.display = 'none';
				if (colorPaletteFill) colorPaletteFill.popDown();
				if (drawButton) drawButton.style.display = 'none';
				if (eraseButton) eraseButton.style.display = 'none';
				if (clearButton) clearButton.style.display = 'none';
				if (restartButton) restartButton.style.display = 'none';
				if (saveImageButton) saveImageButton.style.display = 'none';
				if (robotButton) {
					robotButton.style.display = 'none';
					if (!presence) {
						robotButton.style.display = '';
						robotButton.disabled = false;
						robotButton.style.opacity = 1;
					}
				}
				if (speedButton) {
					speedButton.style.display = (((currentenv && currentenv.sharedId) || presence) && !isHost) ? 'none' : '';
				}

				if (playButton) {
					if (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) {
						playButton.style.display = 'none';
						playButton.disabled = true;
					} else {
						playButton.style.display = (presence && !isHost) ? 'none' : '';
						var canPlay = presence ? false : isRobotOn;
						if (canPlay) {
							playButton.disabled = false;
							playButton.style.opacity = 1;
						} else {
							playButton.disabled = true;
							playButton.style.opacity = 0.5;
						}
					}
				}
				
				isGameStarted = false;
				var willSyncHostUsers = !!(isHost && presence && typeof gameMode.hasRoomUsers === 'function' && gameMode.hasRoomUsers());
				if (typeof newMode.previewGame === 'function') {
					if (!presence || isHost || hasReceivedInit) {
						newMode.previewGame(presence ? false : isRobotOn, gameMode.getMySpawnIndex(), !!presence, !!(skipBroadcast || willSyncHostUsers));
					}
				}
				if (willSyncHostUsers) {
					gameMode.syncRoomUsersToGameMode();
					if (typeof newMode.refreshLobbySpawn === 'function') {
						newMode.refreshLobbySpawn(false, gameMode.getMySpawnIndex());
					}
					if (typeof onGameModeOpponentCountChanged === 'function' && typeof gameMode.getOpponentCount === 'function') {
						onGameModeOpponentCountChanged(gameMode.getOpponentCount());
					}
					if (!skipBroadcast) {
						sendPresenceMessage(gameMode.buildRosterContent('update-spawns'));
					}
				}
				
				if (libraryPalette) libraryPalette.popDown();
				if (libraryGallery) libraryGallery.style.display = 'none';
				if (categoryFormScreen) categoryFormScreen.style.display = 'none';
				if (canvas) canvas.style.display = '';
				if (playFigureBackButton) playFigureBackButton.style.display = 'none';

			} else {
				if (colorsButtonFill) colorsButtonFill.style.display = '';
				if (drawButton) {
					drawButton.style.display = '';
					drawButton.classList.add('active');
				}
				if (eraseButton) {
					eraseButton.style.display = '';
					eraseButton.classList.remove('active');
				}
				if (clearButton) clearButton.style.display = '';
				if (restartButton) restartButton.style.display = 'none';
				if (robotButton) robotButton.style.display = 'none';
				if (speedButton) speedButton.style.display = 'none';
				if (playButton) playButton.style.display = 'none';
				if (saveImageButton) saveImageButton.style.display = '';
				
				if (numberMode && typeof numberMode.deactivate === 'function') numberMode.deactivate();
				
				if (libraryPalette) libraryPalette.popDown();
				if (libraryGallery) libraryGallery.style.display = 'none';
				if (categoryFormScreen) categoryFormScreen.style.display = 'none';
				if (canvas) canvas.style.display = '';
				if (playFigureBackButton) playFigureBackButton.style.display = 'none';
				if (newMode && typeof newMode.setTool === 'function') {
					newMode.setTool('draw');
				}
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
		var colorPaletteFill = new colorpalette.ColorPalette(colorsButtonFill, undefined, "fill");
		var colorInvokerFill = colorPaletteFill.getPalette().querySelector('.palette-invoker');
		colorPaletteFill.addEventListener('colorChange', function (e) {
			currentFillColor = e.detail.color;
			if (colorsButtonFill) colorsButtonFill.style.backgroundColor = e.detail.color;
			if (colorInvokerFill) {
				colorInvokerFill.style.backgroundColor = e.detail.color;
			}
			if (currentMode && typeof currentMode.setFillColor === 'function') {
				currentMode.setFillColor(e.detail.color);
			}
		});
		colorPaletteFill.setColor(0);
		// Speed palette for Game Mode
		var speedPal = new speedPalette.SpeedPalette(speedButton, undefined);
		if (speedButton) {
			speedButton.addEventListener('speedChanged', function (e) {
				if (currentMode === gameMode && typeof gameMode.onLocalSpeedChange === 'function') {
					gameMode.onLocalSpeedChange(e.detail.speed);
				}
			});
		}

		// Handle click on help-button
		var helpButton = document.getElementById("help-button");
		if (helpButton) {
			helpButton.addEventListener('click', function (e) {
				tutorial.start();
			});
		}

		// Handle draw button
		if (drawButton) {
			drawButton.addEventListener('click', function () {
				if (currentMode && typeof currentMode.setTool === 'function') {
					currentMode.setTool('draw');
				}
				this.classList.add("active");
				if (eraseButton) eraseButton.classList.remove("active");
			});
		}

		// Handle erase button
		if (eraseButton) {
			eraseButton.addEventListener('click', function () {
				if (currentMode && typeof currentMode.setTool === 'function') {
					currentMode.setTool('erase');
				}
				this.classList.add("active");
				if (drawButton) drawButton.classList.remove("active");
			});
		}

		// Handle restart button
		if (restartButton) {
			restartButton.addEventListener('click', function () {
				if (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
				if (presence && currentMode === gameMode) {
					if (!isHost) return;
					gameMode.syncRoomUsersToGameMode();
					var startTime = Date.now();
					gameMode.incrementRoundId();
					currentMode.restart(false, gameMode.getMySpawnIndex());
					isGameStarted = true;
					sendPresenceMessage(gameMode.buildRosterContent('restart-game', { startTime: startTime }));
					broadcastUpdate();
				} else {
					if (currentMode === gameMode && typeof currentMode.restart === 'function') {
						currentMode.restart(isRobotOn, gameMode.getMySpawnIndex());
					}
				}
			});
		}

		// Handle clear button
		if (clearButton) {
			clearButton.addEventListener('click', function () {
				if (currentMode && typeof currentMode.clear === 'function') {
					currentMode.clear();
				}
				sendRawPresenceMessage({
					action: 'clear',
					mode: currentMode === numberMode ? 'number' : 'draw'
				});
				broadcastUpdate();
			});
		}

		// Handle Add to Journal
		if (saveImageButton) {
			saveImageButton.addEventListener('click', function () {
				var mimetype = 'image/png';

				// Render without dots
				if (currentMode === drawMode) {
					ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
					if (typeof currentMode.drawBehindDots === 'function') {
						currentMode.drawBehindDots(ctx);
					}
				}

				var inputData = canvas.toDataURL(mimetype, 1);
				// Clear so the next renderLoop frame restores the full view with dots

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
		}

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
						gameMode.previewGame(presence ? false : isRobotOn, gameMode.getMySpawnIndex());
					}
				}
			}
		});

		playButton.addEventListener('click', function () {
			if (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) return;
			if (isHost && presence && currentMode === gameMode) {
				gameMode.syncRoomUsersToGameMode();
			}
			var opponentCount = 0;
			if (currentMode === gameMode && typeof gameMode.getOpponentCount === 'function') {
				opponentCount = gameMode.getOpponentCount();
			}
			var canPlay = presence ? (isHost && opponentCount > 0) : isRobotOn;
			if (!canPlay) return;

			isGameStarted = true;
			robotButton.disabled = true;
			robotButton.style.opacity = 0.5;

			playButton.style.display = 'none';
			if (restartButton) restartButton.style.display = (presence && !isHost) ? 'none' : '';

			if (presence) {
				if (currentMode && typeof currentMode.startGame === 'function') {
					currentMode.startGame(false, gameMode.getMySpawnIndex());
				}
				sendPresenceMessage(gameMode.buildRosterContent('start-game'));
				broadcastUpdate();
			} else {
				if (currentMode && typeof currentMode.startGame === 'function') {
					currentMode.startGame(isRobotOn, gameMode.getMySpawnIndex());
				}
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
			if (typeof gameMode.isExcluded === 'function' && gameMode.isExcluded()) {
				if (playButton) {
					playButton.style.display = 'none';
					playButton.disabled = true;
				}
				return;
			}
			if (presence && playButton) {
				if (count > 0 && isHost) {
					playButton.disabled = false;
					playButton.style.opacity = 1;
				} else {
					playButton.disabled = true;
					playButton.style.opacity = 0.5;
				}
			}
		}
		gameMode.init(dots, broadcastUpdate, spacing, onGameModeOpponentCountChanged, function (event) {

			// Handle single-player game over
			if (!presence && (event === 'win' || event === 'gameWon' || event === 'eliminated' || event === 'hitWall' || event === 'intercepted' || event === 'tie' || event === 'eliminatedEachOther')) {
				isGameStarted = false;
				if (robotButton) {
					robotButton.disabled = false;
					robotButton.style.opacity = 1;
				}
				if (playButton) {
					playButton.style.display = 'none'; // Keep play button hidden, use restart to play again
				}
				if (restartButton) {
					restartButton.style.display = ''; // Keep restart button visible
					restartButton.disabled = false;
					restartButton.style.opacity = 1;
				}
			}
		});
		if (typeof gameMode.setMessageSender === 'function') {
			gameMode.setMessageSender(sendRawPresenceMessage);
		}
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
		if (drawButton) drawButton.classList.add('active');
		if (eraseButton) eraseButton.classList.remove('active');
	});
});